
*Copyright  2020, [Rancher Labs (CN)](https://www.rancher.cn/). All Rights Reserved.*

|作者|王哲|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/12/31
|类型|常见问题-操作系统

---

## 一、问题背景

近期我们发现客户生产环境出现了偶发性的502报错，表现为点击浏览器或APP页面时会出现502错误，复现概率不高无明显规律。

通过分析问题表现我们判断可能是以下几个问题导致：
- 容器ip重复导致的网络时通时不通
- iptables规则中存在reject规则,导致部分nat过程被拒绝
- 内核参数tcp_tw_recycle开启导致的tcp time-wait sockets快速回收

根据以上思路进行了问题排查，发现容器ip不存在重复现象，对比查看多主机iptables规则后并无异常，因此我们需要继续验证是否是由于生产环境物理机中开启内核参数tcp_tw_recycle而导致的此问题。

我们在测试环境的虚拟机上同样开启了tcp_tw_recycle内核参数以求复现问题。开启该内核参数后，进行了页面访问测试，并未复现502报错异常。**但通过对比开启前的情况，我们发现开启该参数后界面加载速度明显变慢**但可以正常访问。因此我们认为该参数在开启后对TCP网络连接产生了影响，但由于测试环境与生产环境还是存在一定差异且该参数的开启与关闭并不是一定会触发网络问题。随后我们在生产环境中进行抓包，发现只有SYN包没有回SYN和ACK包。这一抓包现象与开启该参数会产生的现象吻合度非常高。因此建议关闭tcp_tw_recycle内核参数以避免此网络问题的复现，并提供该内核参数的技术原理以供参考。

## 二、优化分析

### 1.参数解释

这里我们引用[linux手册TCP协议](https://linux.die.net/man/7/tcp)的官方解释。

原文：

> tcp_tw_recycle (Boolean; default: disabled; since Linux 2.4)
>
> Enable fast recycling of TIME_WAIT sockets. Enabling this option is not recommended since this causes problems when working with NAT (Network Address Translation).


直译：
> tcp_tw_recycle
> 
> 启用TIME-WAIT状态sockets的快速回收，这个选项不推荐启用。在NAT(Network Address Translation)网络下，会导致大量的TCP连接建立错误。


### 2.原理分析及优化建议

#### (1)什么是TCP TIME-WAIT状态:

首先我们需要理解什么是tcp time-wait状态。简单来讲通信双方建立TCP连接后，主动关闭连接的一方就会进入TIME_WAIT状态，是在closed前的一个等待状态，需要的等待时长为2MSL（max segment lifetime）,目的是为了可靠且正常的关闭连接。

**tcp连接状态转换图：**

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%B9%BF%E5%8F%91%E7%94%B5%E5%95%86%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E5%86%85%E6%A0%B8%E5%8F%82%E6%95%B0%E4%BC%98%E5%8C%96%E5%BB%BA%E8%AE%AE/tcp-state.jpg?x-oss-process=image/resize,h_450,m_lfit
)

#### (2)TIME-WAIT存在的作用及原因：
- 为实现TCP全双工连接的可靠释放，防止上一个TCP连接的延迟的数据包（发起关闭，但关闭没完成），被接收后影响到新的TCP连接。
- 当最后一个ACK丢失时，远程连接进入LAST-ACK状态，它可以确保远程已经关闭当前TCP连接。如果没有TIME-WAIT状态，当远程仍认为这个连接是有效的，则会继续与其通讯，导致这个连接会被重新打开。当远程收到一个SYN 时，会回复一个RST包，因为这SEQ不对，那么新的连接将无法建立成功，报错终止。


#### (3)开启tcp_tw_recycle后为什么会造成网络问题:

根据官方解释中一个简短的描述：“Enabling this option is not recommended since this causes problems when working with NAT (Network Address Translation).”当中重点提示了如果在网络链路中存在nat网络不推荐启用。

我们继续分析开启该参数会导致的网络现象和原因：

##### 现象一：延迟的出现

还是说回TIME-WAIT的作用，第一个作用是避免新的连接（不相关的）接收到重复的数据包。由于使用了时间戳，重复的数据包会因为timestamp过期而丢弃。第二个作用是确保远程端是不是在LAST-ACK状态，因为有可能丢ACK包丢。远程端会重发FIN包，直到放弃（连接断开），等到ACK包，收到RST包。如果 FIN包接及时收到，本地端依然是TIME-WAIT状态，同时，ACK包也会发送出去。

当新的连接替换了TIME-WAIT的entry，新连接的SYN包会被忽略掉（得益于timestramps），也不会应答RST包，但会重传FIN包。 FIN包将会收到一个RST包的应答（因为本地连接是SYN-SENT状态），这会让远程端跳过LAST-ACK状态。 **最初的SYN包将会在1秒后重新发送，然后完成连接的建立。看起来没有错误发生，只是延迟了一下。**

现象状态分析图如下：

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E5%B9%BF%E5%8F%91%E7%94%B5%E5%95%86%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E5%86%85%E6%A0%B8%E5%8F%82%E6%95%B0%E4%BC%98%E5%8C%96%E5%BB%BA%E8%AE%AE/3.jpg?x-oss-process=image/resize,h_300,m_lfit
)

##### 现象二：没有ACK回包

TIME-WAIT的回收机制依赖于时间戳TIMESTAMP，这会影响到所有连接进来和连接出去的连接。Linux将会放弃所有来自远程端的timestramp时间戳小于上次记录的时间戳**也是远程端发来的**的任何数据包。除非TIME-WAIT状态已经过期。

当远程端主机HOST处于NAT网络中时，时间戳在一分钟之内（MSL时间间隔）将禁止了NAT网络后面，除了这台主机以外的其他任何主机连接，因为他们都有各自CPU CLOCK，各自的时间戳。无法保证经过 NAT 转换后的客户端 TCP 请求 Header 中的 Timestamp 值严格递增；（因为各客户端时间可能不同步，很难保证他们的 TCP 请求的 timestamp 严格递增）
而 kernel 的 PASW 机制要求所有来自同一个 Host IP 的 TCP 包 timestamp 必须是递增的，当收到的 timestamp 变小时，会认为这是一个过期的数据包，将其丢弃。这会导致很多疑难杂症，很难去排查。

同时在nat环境中会出现时间戳错乱的情况，后面的数据包就被丢弃了，**具体的表现通常是客户端明明发送的SYN，但服务端就是不响应ACK（与生产环境中抓包现象一致）**。因为NAT设备将数据包的源IP地址都改成了一个地址(或者少量的IP地址)，但是却基本上不修改TCP包的时间戳，则会导致时间戳混乱。建议：如果网络链路中存在nat，尽量关闭快速回收，以免发生由于时间戳混乱导致的SYN拒绝问题。


#### (4) tcp_tw_recycle参数的移除

根据linux内核源代码树的一个commit,可以看到tcp_tw_recycle参数已经在linux 4.12移除。

原文及链接：[net.ipv4.tcp_tw_recycle has been removed from Linux 4.12.](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=4396e46187ca5070219b81773c4e65088dac50cc)

```txt
The tcp_tw_recycle was already broken for connections
behind NAT, since the per-destination timestamp is not
monotonically increasing for multiple machines behind
a single destination address.

After the randomization of TCP timestamp offsets
in commit 8a5bd45f6616 (tcp: randomize tcp timestamp offsets
for each connection), the tcp_tw_recycle is broken for all
types of connections for the same reason: the timestamps
received from a single machine is not monotonically increasing,
anymore.

Remove tcp_tw_recycle, since it is not functional. Also, remove
the PAWSPassive SNMP counter since it is only used for
tcp_tw_recycle, and simplify tcp_v4_route_req and tcp_v6_route_req
since the strict argument is only set when tcp_tw_recycle is
enabled.
```


## 三、操作步骤


```bash
#查询内核参数值
sysctl -a --pattern=tcp_tw_recycle
#设置内核参数
sysctl -w net.ipv4.tcp_tw_recycle=0
```


> 参考链接：
https://imroc.io/posts/kubernetes/lost-packets-once-enable-tcp-tw-recycle/
https://support.hpe.com/hpesc/public/docDisplay?docId=emr_na-c00782457
https://coolshell.cn/articles/18654.html
https://www.cnblogs.com/sunsky303/p/12818009.html
