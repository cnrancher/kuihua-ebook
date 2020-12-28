# 内核arp_proxy参数配置不当导致Macvlan环路

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-操作系统

---

## 问题现象
使用canal+Macvlan网络插件，ping对应的POD Macvlan网络出现了环路情况

## 问题原因

经过排查和实验，关闭主机上相关vlan device的arp proxy后（如 /proc/sys/net/ipv4/conf/ens4.100/proxy_arp），环路问题消失。

Kubernetes的网络使用CNI模型，Rancher Macvlan功能基于CNI的Macvlan插件进行扩展而实现。而proxy_arp机制是CNI本身引入的，PR：containernetworking/cni#177(https://github.com/containernetworking/cni/pull/177） 。

这个PR是为了解决来自rkt的问题。rkt使用macvlan插件，当两个container先后使用同一个IP但是不同Mac时，外部交换机没有及时刷新arp mapping，可能导致新的容器无法访问。通过开启各个主机vlan device的proxy_arp，可以有效缓解这个问题。

从 macvlan cni 的源码看，proxy arp 只在 macvlan 设备中打开了，对应的 master 没有打开；但是在 static-macvlan-cni 里，新创建的主机上的 vlan 设备（master）和 pod 里的 macvlan 设备都打开了 proxy arp。


## 问题解决

临时解决：  
1、关闭主机上相关vlan device的arp proxy后（如/proc/sys/net/ipv4/conf/ens4.100/proxy_arp） 
长期解决  

2、升级到对应的Macvlan版本
