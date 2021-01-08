*Copyright  2020, [Rancher Labs (CN)](https://www.rancher.cn/). All Rights Reserved.*

|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/04/29
|类型|常见问题-istio相关

---

## 问题简述

通过istio实现灰度发布，浏览器访问报404错误，但是通过curl传递一个Host请求头就能访问成功。



## 问题复现

#### Rancher UI界面启动Istio，并开启ingress网关

![image-20200429120505161](https://s1.ax1x.com/2020/04/29/JTd4XD.png)



#### 命名空间启动Istio自动注入

![image-20200429120612538](https://s1.ax1x.com/2020/04/29/JTd4XD.png)



#### 部署nginx应用

```yaml
###deploy-nginx-v1.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx
    version: v1
  name: nginx-v1
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
      version: v1
  template:
    metadata:
      labels:
        app: nginx
        version: v1
    spec:
      containers:
      - image: satomic/nginx:v1
        imagePullPolicy: IfNotPresent
        name: nginx
        ports:
        - containerPort: 80
          name: 80tcp02
          protocol: TCP
---      
##deploy-nginx-v2.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: nginx
    version: v2
  name: nginx-v2
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
      version: v2
  template:
    metadata:
      labels:
        app: nginx
        version: v2
    spec:
      containers:
      - image: satomic/nginx:v2
        imagePullPolicy: IfNotPresent
        name: nginx
        ports:
        - containerPort: 80
          name: 80tcp02
          protocol: TCP
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nginx
    service: nginx
  name: nginx
  namespace: default
spec:
  ports:
  - name: 80tcp02
    port: 80
    protocol: TCP
    targetPort: 80
  selector:
    app: nginx
  type: ClusterIP
---                
##gw.yaml 
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: mynginx-gateway
  namespace: default
spec:
  selector:
    istio: ingressgateway # use istio default controller
  servers:
  - hosts:
    - 'web1.com'
    port:
      name: http
      number: 80
      protocol: HTTP
---
##vs-nginx.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: nginx
  namespace: default
spec:
  gateways:
  - mynginx-gateway
  hosts:
  - 'web1.com'
  http:
  - match:
    - uri:
        exact: /index.html
    route:
    - destination:
        host: nginx
        subset: dr-nginx-v1
      weight: 50
    - destination:
        host: nginx
        subset: dr-nginx-v2
      weight: 50
##dr-nginx.yaml
---
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: nginx
  namespace: default
spec:
  host: nginx
  subsets:
  - labels:
      version: v1
    name: dr-nginx-v1
  - labels:
      version: v2
    name: dr-nginx-v2
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
```



#### 浏览器访问：http://web1.com:31380/index.html，访问报错

```bash
# windows添加主机映射，C:\Windows\System32\drivers\etc\hosts
172.16.0.211 web1.com
```

*172.16.0.211 为访问主机，31380则是ingressGateway使用NodePort映射 端口*

![image-20200429122013810](https://s1.ax1x.com/2020/04/29/JTdIne.png)



#### curl访问，直接curl访问失败，带上Host请求头，访问成功

```bash
# Linux添加主机映射，/etc/hosts
172.16.0.211 web1.com
```

![image-20200429122221917](https://s1.ax1x.com/2020/04/29/JTdHAA.png)



## 排查思路

#### 查看默认发送的请求头

```http
[root@node02 ~]# curl -v http://web1.com:31380/index.html
* About to connect() to web1.com port 31380 (#0)
*   Trying 172.16.0.211...
* Connected to web1.com (172.16.0.211) port 31380 (#0)
> GET /index.html HTTP/1.1
> User-Agent: curl/7.29.0
> Host: web1.com:31380
> Accept: */*
> 
< HTTP/1.1 404 Not Found
< date: Wed, 29 Apr 2020 04:28:41 GMT
< server: istio-envoy
< content-length: 0
< 
* Connection #0 to host web1.com left intact
```

可以看到请求的`Host`是`web1.com:31380`，而我们`virtualservice`的hosts写的是`web.com`，所以请求的地址不对，自然就没法访问



## 问题处理

既然请求的Host不对，那么就要修改成相对应的Host才能访问，可以有以下几种处理方式。

#### 1 请求头(Request Header)手动指定Host字段

如果是应用内部自己调用，例如代码或者脚本，可以手动指定Host请求头，但是这种就无法再浏览器上访问

```http
[root@node02 ~]# curl -v -H Host:web1.com http://web1.com:31380/index.html
* About to connect() to web1.com port 31380 (#0)
*   Trying 172.16.0.211...
* Connected to web1.com (172.16.0.211) port 31380 (#0)
> GET /index.html HTTP/1.1
> User-Agent: curl/7.29.0
> Accept: */*
> Host:web1.com
> 
< HTTP/1.1 200 OK
< server: istio-envoy
< date: Wed, 29 Apr 2020 04:37:21 GMT
< content-type: text/html
< content-length: 7
< last-modified: Wed, 25 Mar 2020 15:18:37 GMT
< etag: "5e7b764d-7"
< accept-ranges: bytes
< x-envoy-upstream-service-time: 1
< 
app v2
* Connection #0 to host web1.com left intact
```



#### 2 在VirtualService中设置`authority`来支持port访问

istio目前暂时还不支持直接添加DOMAIN+PORT，可以通过设置`authority`来支持PORT访问

在gateway和virtualservice设置hosts为`"*"`，并在virtualservice设置`authority`

```yaml
## gateway
spec:
  - hosts:
    - '*'
---
## virtualservice
spec:
  hosts:
  - '*'
  http:
    - authority:
        exact: "web2.com:31380"
```

完整示例

```yaml
##gw.yaml 
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: mynginx-gateway
  namespace: default
spec:
  selector:
    istio: ingressgateway # use istio default controller
  servers:
  - hosts:
    - '*'
    port:
      name: http
      number: 80
      protocol: HTTP
---
##vs-nginx.yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: nginx
  namespace: default
spec:
  gateways:
  - mynginx-gateway
  hosts:
  - '*'
  http:
  - match:
    - uri:
        exact: /index.html
      authority:
        exact: "web2.com:31380"
    route:
    - destination:
        host: nginx
        subset: dr-nginx-v1
      weight: 50
    - destination:
        host: nginx
        subset: dr-nginx-v2
      weight: 50
```

kubectl apply刷新配置后，就可以在浏览器上访问了

![image-20200429125624700](https://s1.ax1x.com/2020/04/29/JTdbtI.png)

并且我们也可以看到，Host请求头是web1.com:31380，如果使用web1.com Host请求头访问，则会失败

```http
[root@node02 ~]# curl -v http://web1.com:31380/index.html
* About to connect() to web1.com port 31380 (#0)
*   Trying 172.16.0.211...
* Connected to web1.com (172.16.0.211) port 31380 (#0)
> GET /index.html HTTP/1.1
> User-Agent: curl/7.29.0
> Host: web1.com:31380
> Accept: */*
> 
< HTTP/1.1 200 OK
< server: istio-envoy
< date: Wed, 29 Apr 2020 05:34:12 GMT
< content-type: text/html
< content-length: 7
< last-modified: Wed, 25 Mar 2020 15:18:37 GMT
< etag: "5e7b764d-7"
< accept-ranges: bytes
< x-envoy-upstream-service-time: 1
< 
app v2
* Connection #0 to host web1.com left intact
[root@node02 ~]# curl -v -H Host:web1.com http://web1.com:31380/index.html
* About to connect() to web1.com port 31380 (#0)
*   Trying 172.16.0.211...
* Connected to web1.com (172.16.0.211) port 31380 (#0)
> GET /index.html HTTP/1.1
> User-Agent: curl/7.29.0
> Accept: */*
> Host:web1.com
> 
< HTTP/1.1 404 Not Found
< date: Wed, 29 Apr 2020 05:34:25 GMT
< server: istio-envoy
< content-length: 0
< 
* Connection #0 to host web1.com left intact

```



#### 3 设置ingressGateway使用LoadBalancer

ingressGateway使用LoadBancer，设置好对应的地址即可

![image-20200429143039440](https://s1.ax1x.com/2020/04/29/JTdO9P.png)





## 参考

相关issue参考：https://github.com/istio/istio/issues/11828

官方istio VirtualService设置选项：https://istio.io/zh/docs/reference/config/networking/virtual-service/#HTTPMatchRequest