
# canal网络MTU值设置不合理性能测试丢包率高

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|常见问题-网络相关

---

## 问题现象
使用iperf3测试pod之间udp的丢包率和延时，发现在非最大带宽情况下进行测试丢包率能达到百分之60左右

## 问题原因
Canal默认给POD网卡配置的MTU值是1500，导致数据包传输过程会切片，丢包率大于60%。为了保证业务的性能，对Rancher容器云平台Canal网络进行调优，因此需要将MTU值设置为1450。

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/canal%E7%BD%91%E7%BB%9CMTU%E5%80%BC%E8%AE%BE%E7%BD%AE%E4%B8%8D%E5%90%88%E7%90%86%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95%E4%B8%A2%E5%8C%85%E7%8E%87%E9%AB%98/problem_10.png)


## 问题解决

进入【cluster】-【System】，进入【资源】-【配置映射】，在canal-config配置中点击升级


修改cni_network_config

在cni_network_config键值对中，添加"mtu":1450  

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/canal%E7%BD%91%E7%BB%9CMTU%E5%80%BC%E8%AE%BE%E7%BD%AE%E4%B8%8D%E5%90%88%E7%90%86%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95%E4%B8%A2%E5%8C%85%E7%8E%87%E9%AB%98/problem_11.png)

进入【资源】-【工作负载】，点击canal的重新部署按钮

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/canal%E7%BD%91%E7%BB%9CMTU%E5%80%BC%E8%AE%BE%E7%BD%AE%E4%B8%8D%E5%90%88%E7%90%86%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95%E4%B8%A2%E5%8C%85%E7%8E%87%E9%AB%98/problem_12.png)

查看网卡MTU

![](https://rancher-support-1256858200.cos.ap-shenzhen-fsi.myqcloud.com/Rancher%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98/%E7%BD%91%E7%BB%9C%E7%9B%B8%E5%85%B3/canal%E7%BD%91%E7%BB%9CMTU%E5%80%BC%E8%AE%BE%E7%BD%AE%E4%B8%8D%E5%90%88%E7%90%86%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95%E4%B8%A2%E5%8C%85%E7%8E%87%E9%AB%98/problem_13.png)

