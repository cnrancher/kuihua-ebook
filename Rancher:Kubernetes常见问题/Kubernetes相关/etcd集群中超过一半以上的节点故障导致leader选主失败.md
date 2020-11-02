# etcd集群中超过一半以上的节点故障导致leader选主失败

|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-Kubernetes相关

---

## 问题现象
kubernetes集群环境，3个etcd节点组成etcd集群。其中2个etcd节点故障，超过集群节点一半的数量，导致etcd leader节点选主失败。

## 问题原因

**etcd的选举**：选举是etcd集群启动后的第一件事，没有leader，集群将不允许任何的数据更新操作。选举完成以后，集群会通过心跳的方式维持leader的地位，并同步数据到其他follower节点。一旦leader失效，会有新的follower起来竞选leader。

此时如果存活的节点无法接收到leader的心跳检测，或者存活的leader检测不到其他follower的节点，则会停止数据的更新操作，重新进行leader选举，防止etcd集群脑裂。而此时由于etcd少于一半的节点数，导致无法进行leader选举，因为选举需要半数的follower通过才能完成选举。此时etcd 集群依然可以接收请求并让程序没有任何大的中断。


## 问题解决

如果是通过rke或者rancher启动的k8s集群，则可以通过etcd备份文件进行恢复。

找到/opt/rke/etcd-snapshots下的压缩备份文件，解压到etcd容器内，执行etcdctl命令恢复即可。

```
etcdctl snapshot restore xxx 
```