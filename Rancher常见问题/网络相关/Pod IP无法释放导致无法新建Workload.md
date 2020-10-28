# Pod IP无法释放导致无法新建Workload

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-网络相关

---

## 问题现象
创建POD时发现有部分副本启动很慢，需要等待很久，此时pod的事件如下图
![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%20IP%E6%97%A0%E6%B3%95%E9%87%8A%E6%94%BE%E5%AF%BC%E8%87%B4%E6%97%A0%E6%B3%95%E6%96%B0%E5%BB%BAWorkload/problem_1.png)

出问题都在固定的一个节点上，将POD强制调度到其他节点没有此问题。

查看pod的事件，发现卡在网络初始化阶段。
![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%20IP%E6%97%A0%E6%B3%95%E9%87%8A%E6%94%BE%E5%AF%BC%E8%87%B4%E6%97%A0%E6%B3%95%E6%96%B0%E5%BB%BAWorkload/problem_2.png)
![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%20IP%E6%97%A0%E6%B3%95%E9%87%8A%E6%94%BE%E5%AF%BC%E8%87%B4%E6%97%A0%E6%B3%95%E6%96%B0%E5%BB%BAWorkload/problem_3.png)

## 问题原因

- 这个问题是kubernetes的一个老问题了，与容器无法启动/失败时不清理容器ip有关
- 该问题的根本原因是由于pod生命周期的PodSync循环处理策略与cni插件的冲突导致的，即本应该作为GC goroutine(一个go语言的调度器，或者可以直接理解为kubelet)的一部分的cni delete没有被调用而导致了IP泄露。因此该问题并非是网络插件单方面问题，和k8s自身和docker都有所关联。
- 可以尝试通过手动删除IP池中没有被使用到的IP，但这种方式并不能根本性的解决，只能保证新起pod有IP可用。如果您现在的环境无法重启docker，可以先通过手动删除的方式来临时解决，等存在重启docker的窗口期时再去重启docker来修复。

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/Pod%20IP%E6%97%A0%E6%B3%95%E9%87%8A%E6%94%BE%E5%AF%BC%E8%87%B4%E6%97%A0%E6%B3%95%E6%96%B0%E5%BB%BAWorkload/problem_4.png)

## 问题解决

- 需要把/var/lib/cni/networks/default-cni-network这个目录mv一个bak出来，然后新建一个目录，重启docker
- 让这个主机上的pod全部重新分配IP

``` shell
systemctl stop docker
cp -r /var/lib/cni/network/default-cni-network/  /var/lib/cni/network/default-cni-network_bak/
cd /var/lib/cni/network/default-cni-network/ 
rm -f 10*
systemctl start docker
```

* 相关issues:

    https://github.com/kubernetes/kubernetes/issues/86944
https://github.com/kubernetes/kubernetes/pull/94624