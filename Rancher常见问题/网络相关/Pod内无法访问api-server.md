
# Pod内无法访问Api-server

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-网络相关

---

## 问题现象
部署集群后发现集群内部分系统组件无法正常启动，查看日志报错如下
![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%E5%86%85%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AEApi-server/problem_5.png)

10.43.0.1对应的是连接集群Api-server的地址，此Service记录默认创建在default命名空间中

在集群内启动Buybox:1.28进行测试验证，副本数为2,分布到不同的节点

测试方法:  
1、POD之间进行跨主机网络通信（pass)  
2、在POD内telnet 10.43.0.1的443端口（不可通信）  
3、在POD内ping非本POD所在宿主机的IP（不可通信）  

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%E5%86%85%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AEApi-server/problem_6.png)

## 问题原因
canal网络整体转发路径
![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%E5%86%85%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AEApi-server/problem_9.png)

问题原因主要是因为在POD内无法与Master节点的所在宿主机IP进行通信，因为10.43.0.1最终是会通过iptables DNAT到master节点的443端口

在master节点抓包分析

通过抓包可以看见在对应网卡上有收到pod发送过来的icmp的Request包

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%E5%86%85%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AEApi-server/problem_7.png)

1、发现源IP还是POD的IP，正常情况下canal访问非集群内网络地址ip会进行SNAT成宿主机的IP。  

查看master节点路由

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%E5%86%85%E6%97%A0%E6%B3%95%E8%AE%BF%E9%97%AEApi-server/problem_8.png)

路由走的flannel.1网卡，另外发包的源IP使用的是本机的flannel.1 ip，造成的问题就是默认情况下Linux是开启了反向路径过滤功能，如果一个数据包出入非同一块网卡会被Linux进行反向过滤掉。  

主要原因是因为发出来的数据包没有进行SNAT成宿主机的IP，通过排除，发现是canal配置文件内定义的pod-cidr与实际在controller-manager内的配置冲突，导致POD实际上分配的是controller-manager内配置的所以POD-ip访问外部网络没有自动进行SNAT和flannel.1不进行转发

## 问题解决
将canal配置文件中的POD-cidr范围修改与controller-manager中一致。
