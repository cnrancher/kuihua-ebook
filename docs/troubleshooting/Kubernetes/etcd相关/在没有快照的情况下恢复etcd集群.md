

| 作者   | 王哲              |
|------|-----------------|
| 团队   | Filed&&Suppoort |
| 编写时间 | 2021/5/18       |
| 类型   | 应用部署常见问题        |


# 在没有快照的情况下恢复etcd集群




> 此方法适用于所有rancher创建的自定义集群，且集群未从UI上删除


如果集群原有两个ETCD节点而坏掉一个，或者原有三个ETCD节点而坏掉两个。这个时候ETCD集群将自动降级，所有键值对变成只读状态，这种情况下只能进行ETCD集群恢复。对于早期的Rancher版本或者没有开启自动备份的Rancher环境，将需要使用/var/lib/etcd目录的etcd数据进行恢复。

## 当前集群环境

![image](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/01.jpg)

查看etcd member：

![image](https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/02.jpg)

查看集群组件健康状态：

![image](https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/03.jpg)

环境信息 | 版本
---|---
system | centos7.8
kernel | 5.4
docker| 19.03.15
k8s | 1.18.18
rancher | 2.5.7-ent


## 操作步骤

> 离线环境需要先准备assaflavie/runlike镜像再进行操作

### 1、通过删除所有其他 etcd 节点，在集群中只保留一个 etcd 节点。

删除node02和node03中的etcd容器


```
docker rm -f etcd 
```
![image](https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/04.jpg)




### 2、在剩下的 etcd 节点上也就是node01上，运行以下命令：


```
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock assaflavie/runlike etcd
```

此命令输出 etcd 的运行命令，保存此命令供以后使用。

![image](https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/05.jpg)



### 3、停止上一步在node01启动的 etcd 容器，将其重命名为 etcd-old。

```
docker stop etcd
docker rename etcd etcd-old
```

### 4、修改步骤 2 中保存的命令


**如果最初拥有一个以上的 etcd 节点，那么您需要将 --initial-cluster 更改为只包含剩余的节点也就是node01，并在命令末尾添加--force-new-cluster 。**

![image](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/06.jpg)



### 5、 在node01上运行修改后的命令,则单个etcd节点重建成功。

### 6、在单个节点启动并运行之后，需要向集群添加另外两个 etcd 节点。

如果您有一个自定义集群并且希望重用旧节点，则需要在尝试将它们重新添加回集群之前清理节点或删除有问题的etcd容器。

在剩下的最后两个ETCD节点中，执行以下命令添加第一个ETCD MEMBER节点

node02:
```
MEMBER_IP=172.16.51.59
docker exec -ti etcd etcdctl member add etcd-`echo $MEMBER_IP | sed 's/\./-/g'` --peer-urls=https://$MEMBER_IP:2380

```

node03:
```
MEMBER_IP=172.16.51.63
docker exec -ti etcd etcdctl member add etcd-`echo $MEMBER_IP | sed 's/\./-/g'` --peer-urls=https://$MEMBER_IP:2380
```


> 执行以上命令后将输出以下信息，请保存这些信息，在运行member节点时将要使用。

node02:
```
ETCD_NAME="etcd-172-16-51-59"
ETCD_INITIAL_CLUSTER="etcd-rnode-01=https://172.16.51.58:2380,etcd-172-16-51-59=https://172.16.51.59:2380"
ETCD_INITIAL_CLUSTER_STATE="existing"
```
node03:
```
ETCD_NAME="etcd-172-16-51-63"
ETCD_INITIAL_CLUSTER="etcd-172-16-51-63=https://172.16.51.63:2380,etcd-rnode-01=https://172.16.51.58:2380,etcd-172-16-51-59=https://172.16.51.59:2380"
ETCD_INITIAL_CLUSTER_STATE="existing"
```

### 7、执行以下命令查看成员状态，正常情况新加的成员会处于未开始状态，因为新的ETCD实例未运行。


```
docker exec -ti etcd etcdctl member list
```
![image](https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/07.jpg)


### 8、在node02节点上执行以下命令添加第一个member节点。node03上同理。

```
# 定义节点IP
## 注意，如果是多IP主机，需要根据第二步中显示的IP来判断其他节点中默认使用的是什么接口的IP，因为在`/etc/kubernetes/ssl/`会以IP为格式命名生成ETCD SSL证书文件。
# 备份原有ETCD数据
mv /var/lib/etcd /var/lib/etcd-bak-$(date +"%Y%m%d%H%M")

NODE_IP=172.16.51.59
ETCD_IMAGES=rancher/mirrored-coreos-etcd:v3.4.15-rancher1

# 以下三个配置为添加成员时返回

ETCD_NAME="etcd-172-16-51-59"
ETCD_INITIAL_CLUSTER="etcd-rnode-01=https://172.16.51.58:2380,etcd-172-16-51-59=https://172.16.51.59:2380"
ETCD_INITIAL_CLUSTER_STATE="existing"

docker run --name=etcd --hostname=`hostname` \
--env="ETCDCTL_API=3" \
--env="ETCDCTL_CACERT=/etc/kubernetes/ssl/kube-ca.pem" \
--env="ETCDCTL_CERT=/etc/kubernetes/ssl/kube-etcd-`echo $NODE_IP|sed 's/\./-/g'`.pem" \
--env="ETCDCTL_KEY=/etc/kubernetes/ssl/kube-etcd-`echo $NODE_IP|sed 's/\./-/g'`-key.pem" \
--env="ETCDCTL_ENDPOINT=https://0.0.0.0:2379" \
--env="ETCD_UNSUPPORTED_ARCH=x86_64" \
--env="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
--volume="/var/lib/etcd:/var/lib/rancher/etcd/:z" \
--volume="/etc/kubernetes:/etc/kubernetes:z" \
--network=host \
--restart=always \
--label io.rancher.rke.container.name="etcd" \
--detach=true \
$ETCD_IMAGES \
/usr/local/bin/etcd \
--peer-client-cert-auth \
--client-cert-auth \
--peer-cert-file=/etc/kubernetes/ssl/kube-etcd-`echo $NODE_IP|sed 's/\./-/g'`.pem \
--peer-key-file=/etc/kubernetes/ssl/kube-etcd-`echo $NODE_IP|sed 's/\./-/g'`-key.pem \
--cert-file=/etc/kubernetes/ssl/kube-etcd-`echo $NODE_IP|sed 's/\./-/g'`.pem \
--trusted-ca-file=/etc/kubernetes/ssl/kube-ca.pem \
--initial-cluster-token=etcd-cluster-1 \
--peer-trusted-ca-file=/etc/kubernetes/ssl/kube-ca.pem \
--key-file=/etc/kubernetes/ssl/kube-etcd-`echo $NODE_IP|sed 's/\./-/g'`-key.pem \
--data-dir=/var/lib/rancher/etcd/ \
--advertise-client-urls=https://$NODE_IP:2379,https://$NODE_IP:4001 \
--listen-client-urls=https://0.0.0.0:2379 \
--listen-peer-urls=https://0.0.0.0:2380 \
--initial-advertise-peer-urls=https://$NODE_IP:2380 \
--election-timeout=5000 \
--heartbeat-interval=500 \
--name=$ETCD_NAME \
--initial-cluster=$ETCD_INITIAL_CLUSTER \
--initial-cluster-state=$ETCD_INITIAL_CLUSTER_STATE

```

### 9、添加完member之后再次查看etcd member 
![image](https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/08.jpg)

### 10、集群状态恢复正常

![image](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8Detcd%E9%9B%86%E7%BE%A4/jt/09.jpg)



参考文档：

https://docs.rancher.cn/docs/rancher2/cluster-admin/restoring-etcd/_index/#%E5%9C%A8%E6%B2%A1%E6%9C%89%E5%BF%AB%E7%85%A7%E7%9A%84%E6%83%85%E5%86%B5%E4%B8%8B%E6%81%A2%E5%A4%8D-etcd


https://docs2.rancher.cn/rancher2x/backups-and-restoration/restorations/custom.html#_1-%E9%80%9A%E8%BF%87ui%E6%81%A2%E5%A4%8D%E9%9B%86%E7%BE%A4-ui%E4%B8%8A%E9%9B%86%E7%BE%A4%E6%9C%AA%E5%88%A0%E9%99%A4

