# 大量runc不释放，导致节点负载高

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-Docker相关

---

## 问题现象
节点挂载分布式块存储的PVC，测试环境经常进行workload的创建和删除，PVC的创建和删除，运行一段时间后系统负载渐渐升高

## 问题原因

通过top命令查看后台进程情况，发现有大量的runc进程残留在后台没有进行释放。  

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/Docker%E7%9B%B8%E5%85%B3/%E5%A4%A7%E9%87%8Frunc%E4%B8%8D%E9%87%8A%E6%94%BE%EF%BC%8C%E5%AF%BC%E8%87%B4%E8%8A%82%E7%82%B9%E8%B4%9F%E8%BD%BD%E9%AB%98/problem_16.png)

## 问题解决

升级docker到新版本，此问题消失  
runc的BUG issue  

* https://github.com/opencontainers/runc/issues/1988
* https://github.com/containerd/containerd/issues/3027