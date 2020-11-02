# etcd集群中超过一半以上的节点故障导致leader选主失败

|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-Kubernetes相关

---

## 问题现象
k8s集群中，多个etcd节点出现etcd不健康的问题，但是过一会又好了。查看etcd的日志可以看到，有大量的读操作都达到了秒级，查看etcd的磁盘同步周期最高达到了十几秒。

## 问题原因

此问题的根本原因是磁盘的IO性能不足。发生问题的k8s环境，etcd节点都是跑在虚拟机上，只分配了一块盘，etcd直接运行在根目录所在的磁盘上，由于etcd所在的节点磁盘性能不足，导致磁盘同步周期长，etcd心跳检测超时，相关的查询操作也是达到了秒级，所以导致etcd集群濒繁出现不健康的问题。

etcd会将数据持久化到磁盘上，如果平均申请时间超过100ms，etcd将警告条目申请时间太长。，etcd对延迟比较敏感，一般建议使用SSD作为etcd存储的磁盘。

## 问题解决

更换高性能的磁盘，挂载到/var/lib/etcd目录下即可。

测试磁盘IO性能可以参考以下文档
* https://www.ibm.com/cloud/blog/using-fio-to-tell-whether-your-storage-is-fast-enough-for-etcd