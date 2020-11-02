# POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-存储相关

---

## 问题现象
1、top和uptime命令查看系统负载很高  
![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E5%AD%98%E5%82%A8%E9%85%8D%E7%BD%AE/POD%E4%BD%BF%E7%94%A8%E6%80%A7%E8%83%BD%E4%BD%8E%E7%9A%84NAS%E5%AF%BC%E8%87%B4%E8%8A%82%E7%82%B9%E5%A4%A7%E9%87%8F%E5%83%B5%E5%B0%B8%E8%BF%9B%E7%A8%8B%EF%BC%8C%E7%B3%BB%E7%BB%9F%E8%B4%9F%E8%BD%BD%E8%99%9A%E9%AB%98/problem_14.jpeg)

2、查看内核空间和用户空间cpu实际使用率都不高。  
3、查看IO和内存使用率不高。  
4、大量僵尸状态进程和D状态进程。  
5、检查D状态进程对应的都是挂载了NAS存储的应用。  

## 问题原因
集群有workload挂载了NAS存储，但存储性能太差，造成应用在等待IO，所以就变成D状态了，系统负载虚高。

D状态的原因出现uninterruptible sleep状态的进程一般是因为在等待IO，例如磁盘IO、网络IO等。在发出的IO请求得不到相应之后，进程一般就会转入uninterruptible sleep状态，例如若NFS服务端关闭时，如果没有事先amount相关目录。在客户端执行df的话就会挂住整个会话，再用ps axf查看的话会发现df进程状态位已经变成D。”


D状态进程不受9和15信号支配，要想干掉处在 D 状态进程就只能重启整个 Linux 系统了。

## 问题解决

1、此问题一般出现在自建的NFS或NAS系统，对存储和网络性能进行测试看是否满足需求。  

