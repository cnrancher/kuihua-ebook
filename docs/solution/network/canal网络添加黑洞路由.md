|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/12/31
|类型|存储相关解决方案

---


## 问题概述

由于canal是通过明细路由将数据转发到对应的pod容器网卡上，当访问的pod的IP不存在时，或者当pod访问外部服务在回包的过程中pod已经不存在没有对应的明细路由时，会导致该数据包进入到主机时，找不到对应的明细路由，最终通过默认网关转发到主机外部（交换机）。此时就会在交换机上可以看到源IP是pod IP、Mac地址是物理主机的Mac地址的数据包。



## 问题影响

正常情况下，该数据包通过默认路由走到网关后，网关会将该数据包丢弃。但是由于思科ACI网络的GARP学习机制，会导致交换机学习到错误的MAC-IP的地址，造成频繁的MAC-IP地址学习，影响交换机使用的性能，严重时会影响到整个ACI网络发送错误的数据包到错误的主机上。



## 解决思路

基于上述问题，我们可以通过添加黑洞路由来解决这个问题

先查看主机flannel.1网卡的IP

```bash
# ip a flannel.1
Command "flannel.1" is unknown, try "ip address help".
root@node01:~# ifconfig flannel.1
flannel.1: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1450
        inet 10.42.0.0  netmask 255.255.255.255  broadcast 0.0.0.0
        ether a2:a1:5d:bc:b8:0c  txqueuelen 0  (Ethernet)
        RX packets 14124739  bytes 15160299170 (15.1 GB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 12848009  bytes 4268398360 (4.2 GB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

添加黑洞路由

```bash
ip route add blackhole 10.42.0.0/24
```

![route-1](https://zerchin.gitee.io/picturebed/img/canal网络添加黑洞路由.assets/route-1.png)

上述操作在每个节点上都添加上对应的黑洞路由



## 效果验证

验证访问不存在的pod IP是否能在主机网卡上抓到目的IP为该pod IP的数据包

10.42.0.21 ping 一个不存在的pod IP：10.42.1.200

![ping-1](https://zerchin.gitee.io/picturebed/img/canal网络添加黑洞路由.assets/ping-1.png)

添加黑洞路由前抓包

![tcpdump-1](https://zerchin.gitee.io/picturebed/img/canal网络添加黑洞路由.assets/tcpdump-1.png)

添加黑洞路由

```
# ip route add blackhole 10.42.1.0/24
```

再次抓包

![tcpdump-2](https://zerchin.gitee.io/picturebed/img/canal网络添加黑洞路由.assets/tcpdump-2.png)

### 结论

添加黑洞路由可以禁止pod数据包通过默认路由发往外部交换机

## 最终版

通过如上方法在每个节点上添加黑洞路由的方式可以避免pod包路由到交换机上，但是因为每个主机的pod子网段是不同的，所以每次添加节点都得手动添加对应子网的黑洞路由，而且主机重启后路由就丢失了，需要重新添加，那有没有一劳永逸的方法呢？答案是肯定的。

直接添加B类子网的黑洞路由就可以了。也就是说，直接添加集群层面的pod网段的路由，并写入到网络配置文件中，这样每次重启主机或者重启网络都会自动加载黑洞路由，就不用去手动维护这个路由了。

参考CentOS7，方法如下：

1. 确认集群的pod CIDR，例如Rancher创建的集群默认pod的CIDR是`10.42.0.0/16`

2. 新建路由配置文件

```bash
vi /etc/sysconfig/network-scripts/route-eth0
```

键入如下路由规则

```bash
blackhole 10.42.0.0/16 
```

3. 保存后重启网络即可

```bash
systemctl restart network
```

查看路由

```bash
# ip route|grep blackhole
blackhole 10.42.0.0/16 
```

至此添加成功！

