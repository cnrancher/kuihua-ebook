# Centos默认3.10.x内核问题

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-操作系统

---

## 问题现象
1、节点hang死，无法操作，终端不停弹kernel的报错

## 问题原因
centos3.10.x内核对容器的兼容性问题和内核BUG

升级内核到4.4原因主要是因为之前centos7默认3.x内核几个问题：  
1、3.10 内核 kmem account 泄漏 bugs 导致节点 NotReady bug 导致节点 NotReady(https://support.d2iq.com/s/article/Critical-Issue-KMEM-MSPH-2018-0006)  
2、3.10 内核 Bugs，系统日志出现大量 kernel: unregister_netdevice: waiting for eth0 to become free 报错，节点 NotReady  

`
kernel: NMI watchdog: BUG soft lockup -CPU#9 stuck for 22s! [migration/9:54]”
`

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F/Centos%E9%BB%98%E8%AE%A43.10.x%E5%86%85%E6%A0%B8%E9%97%AE%E9%A2%98/problem_15.jpeg)

## 问题解决

升级4.x或5.x版本的内核可降低此类问题发生的概率。


