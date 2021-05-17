*Copyright  2020, [Rancher Labs (CN)](https://www.rancher.cn/). All Rights Reserved.*

|作者|谢泽钦|
|---|---|
|团队|Filed&&Suppoort
|编写时间|2020/10/19
|类型|监控解决方案

---

## 前提

| 软件       | 版本      |
| ---------- | --------- |
| Rancher    | 2.4.8-ent |
| monitoring | 0.1.2000  |



## 问题现象

Rancher-v2.4.8-ent企业版启用监控(0.1.2000版本)后，只能通过Rancher-URL去访问，通过service暴露nodeport去访问，会报`unauthorized`错误。

![image-20201018201738902](https://s1.ax1x.com/2020/10/18/0jd58K.png)


## 问题原因

默认情况下，社区版本的监控将认证步骤做在了Prometheus-proxy容器中，所以我们可以直接通过pod IP/service IP就能访问Prometheus UI页面。

企业版0.1.2000监控版本，取消了项目监控的开关，只保留了集群监控，并取消了社区版在prometheus-proxy中进行认证的方式，将认证统一设置在Rancher-api-proxy中，这样设计是为了控制不同用户，根据其角色权限访问不同的资源。所以企业版默认只能通过rancher-api-proxy去访问prometheus UI界面。


## 解决方法

有两种解决方法，一种是通过ingress在header中传递token认证信息，另一种方法就是修改chart，将认证方式改成在Prometheus-proxy容器中认证。但是不管是在ingress中传递token，还是修改chart，都存在一定的权限泄露问题。

### 方法一：通过ingress进行认证

#### 1、首先获取cluster-monitoring的token

```
kubectl -n cattle-prometheus -o template get sa cluster-monitoring --template='{{range .secrets}} {{.name}} {{end}}' | xargs kubectl -n cattle-prometheus get secrets -o template --template='{{.data.token}}' |base64 -d
```

#### 2、创建ingress，并添加token至header中

通过Rancher UI创建Ingress，在cattle-prometheus命名空间下，选择目前后端为 access-prometheus

![image-20201018210058194](https://s1.ax1x.com/2020/10/18/0jwWLQ.png)

添加annotations注释：将其中TOKEN换成上一步获取的token值

```yaml
nginx.ingress.kubernetes.io/configuration-snippet: proxy_set_header Authorization "Bearer <TOKEN>";
```

![image-20201018210322041](https://s1.ax1x.com/2020/10/18/0jw4ds.png)



创建完成yaml配置文件如下：

![image-20201018205542711](https://s1.ax1x.com/2020/10/18/0jwhZj.png)


#### 3、通过ingress访问Prometheus UI界面

![image-20201018210551862](https://s1.ax1x.com/2020/10/18/0jwRsg.png)


#### 4、小结
通过ingress可以实现访问Prometheus UI页面，但是由于token明文展示在了ingress的注释中，用户仅需有查看system项目的就可以获取到token，存在一定权限泄露问题。


### 方法二：修改chart

此方法适用于有本地git仓库

#### 1、同步 system-charts

同步https://github.com/cnrancher/system-charts 到本地git仓库

```bash
git clone https://github.com/cnrancher/system-charts
```



#### 2、切换release-v2.4-ent分支

查看当前分支

```bash
cd system-charts/
git branch -a
```

默认是release-v2.4-ent分支，如果不是，则用这个命令切换

```
git checkout release-v2.4-ent
```



#### 3、修改proxy配置

进入到Prometheus目录

```
cd charts/rancher-monitoring/v0.1.2000/charts/prometheus/templates/
```

编辑`nginx-configmap.yaml`文件

3.1、找到这一行

```
sed "s/REPLACE_PARAM_IP/${POD_IP}/g" $srcpath > $dstpath
```

将这一行删除，然后替换成

```
token=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
sed "s/REPLACE_PARAM_AUTHORIZATION/Bearer ${token}/g" $srcpath | sed "s/REPLACE_PARAM_IP/${POD_IP}/g" > $dstpath
```

3.2、在server下，添加`proxy_set_header`
```
proxy_set_header    Authorization "REPLACE_PARAM_AUTHORIZATION";
```

如图所示


![image-20201018212614174](https://s1.ax1x.com/2020/10/19/0v3MiF.png)



#### 4、上传到本地git仓库



#### 5、设置system-charts地址

在 全局-> 工具 -> 商店设置 中，找到 system-library，编辑这个应用商店，修改URL地址为本地git仓库地址，并刷新一下

![image-20201018213044955](https://s1.ax1x.com/2020/10/18/0jwcz8.png)



#### 6、重启监控

禁用监控，等所有组件删除完毕后，再开启监控

![image-20201018213404130](https://s1.ax1x.com/2020/10/18/0jwyJP.png)



#### 7、通过nodeport service访问Prometheus UI页面
克隆access-prometheus service，并设置service类型为nodeport类型

![image-20201018213822715](https://s1.ax1x.com/2020/10/18/0jw6Rf.png)

#### 8、小结

使用修改chart方式也可以实现通过service IP访问Prometheus UI页面，可能会放大prometheus权限。


## Grafana 访问


### 问题描述

由于企业版监控架构调整，基于用户权限控制，使不同用户登录Grafana查看到对应的图表监控信息，导致默认的admin用户没有权限查看到监控图表。



### 解决方法

可以通过ingress携带对应token去访问Grafana UI界面



#### 1、获取Rancher admin用户ID

![image-20201021193749966](https://s1.ax1x.com/2020/10/21/BPJwDO.png)

例如这里获取到的ID为：user-87tkg



#### 2、创建ingress，并添加user ID至header中

通过Rancher UI创建Ingress，在cattle-prometheus命名空间下，选择目前后端为 access-grafana

添加annotations注释：将其中<USER_ID>改为上一步获取的user ID

```yaml
nginx.ingress.kubernetes.io/configuration-snippet: proxy_set_header    X-RANCHER-USER "<USER_ID>";
```



![image-20201021194121803](https://s1.ax1x.com/2020/10/21/BPJUv6.png)



#### 3、通过ingress访问Grafana UI界面

查看左下角用户是否处于登录状态

![image-20201021205004308](https://s1.ax1x.com/2020/10/21/BPJt81.png)

尝试访问监控图表

![image-20201021205028797](https://s1.ax1x.com/2020/10/21/BPJNgx.png)