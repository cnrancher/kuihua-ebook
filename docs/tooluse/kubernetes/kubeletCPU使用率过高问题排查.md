# kubeletCPU使用率过高问题排查


|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/19
|类型|Kubernenetes组件异常排查

---

## 问题背景

客户的k8s集群环境，发现所有的worker节点的kubelet进程的CPU使用率长时间占用过高，通过pidstat可以看到CPU使用率高达100%。针对此问题，客户在Rancher客户门户系统进行工单提问，请求Rancher工程师对kubelet进程的异常进行问题排查。

![image-20201128234823968](https://zerchin.gitee.io/picturebed/img/kubelet%20cpu%E4%BD%BF%E7%94%A8%E7%8E%87%E8%BF%87%E9%AB%98/kubelet-cpu-used.png)


## 集群环境

| 软件       | 版本                        |
| ---------- | --------------------------- |
| kubernetes | v1.18.8                     |
| docker     | 18.09.9                     |
| rancher    | v2.4.8-ent                  |
| CentOS     | 7.6                         |
| kernel     | 4.4.227-1.el7.elrepo.x86_64 |



## 排查过程

### 使用strace工具对kubelet进程进行跟踪

1. 由于kubelet进程CPU使用率异常，可以使用strace工具对kubelet进程动态跟踪进程的调用情况，首先使用`strace -cp <PID>`命令统计kubelet进程在某段时间内的每个系统调用的时间、调用和错误情况.

![kubelet_futex_error](https://zerchin.gitee.io/picturebed/img/kubelet%20cpu%E4%BD%BF%E7%94%A8%E7%8E%87%E8%BF%87%E9%AB%98/kubelet-futex-error.png)

从上图可以看到，执行系统调用过程中，futex抛出了五千多个errors，这肯定是不正常的，而且这个函数占用的时间也达到了99%，所以需要更深层次的查看kubelet进程相关的调用。



2. 由于`strace -cp`命令只能查看进程的整体调用情况，所以我们可以通过`strace -tt -p <PID>`命令打印每个系统调用的时间戳，如下：

![kubelet_strace.png](https://zerchin.gitee.io/picturebed/img/kubelet%20cpu%E4%BD%BF%E7%94%A8%E7%8E%87%E8%BF%87%E9%AB%98/kubelet_strace.png)

从strace输出的结果来看，在执行futex相关的系统调用时，有大量的Connect timed out，并返回了`-1 `和`ETIMEDOUT`的error，所以才会在`strace -cp`中看到了那么多的error。

futex是一种用户态和内核态混合的同步机制，当futex变量告诉进程有竞争发生时，会执行系统调用去完成相应的处理，例如wait或者wake up，从官方的文档了解到，futex有这么几个参数：

```c
futex(uint32_t *uaddr, int futex_op, uint32_t val,
                 const struct timespec *timeout,   /* or: uint32_t val2 */
                 uint32_t *uaddr2, uint32_t val3);
```

官方文档给出`ETIMEDOUT`的解释：

```
ETIMEDOUT
       The operation in futex_op employed the timeout specified in
       timeout, and the timeout expired before the operation
       completed.
```

意思就是在指定的timeout时间中，未能完成相应的操作，其中`futex_op`对应上述输出结果的`FUTEX_WAIT_PRIVATE`和`FUTEX_WAIT_PRIVATE`，可以看到基本都是发生在`FUTEX_WAIT_PRIVATE`时发生的超时。

从目前的系统调用层面可以判断，futex无法顺利进入睡眠状态，但是futex做了哪些操作还是不清楚，还无法判断kubeletCPU飙高的原因，所以我们需要进一步从kubelet的函数调用中去看到底是执行了卡在了哪个地方。



> FUTEX_PRIVATE_FLAG：这个参数告诉内核futex是进程专用的，不与其他进程共享，这里的FUTEX_WAIT_PRIVATE和FUTEX_WAKE_PRIVATE就是其中的两种FLAG；
>
> futex相关说明1：https://man7.org/linux/man-pages/man7/futex.7.html 
>
> fuex相关说明2： https://man7.org/linux/man-pages/man2/futex.2.html



### 使用go pprof工具对kubelet函数调用进行分析

早期的k8s版本，可以直接通过`debug/pprof` 接口获取debug数据，后面考虑到相关安全性的问题，取消了这个接口，参考[CVE-2019-11248](https://github.com/kubernetes/kubernetes/issues/81023)，我们可以通过kubectl开启proxy进行相关数据指标的获取

1. 首先使用`kubectl proxy`命令启动API server代理

```bash
kubectl proxy --address='0.0.0.0'  --accept-hosts='^*$'
```

这里需要注意，如果使用的是Rancher UI上copy的kubeconfig文件，则需要使用指定了master IP的context，如果是RKE或者其他工具安装则可以忽略

2. 构建golang环境。go pprof需要在golang环境下使用，本地如果没有安装golang，则可以通过docker快速构建golang环境

```bash
docker run -itd --name golang-env --net host golang bash
```

3. 使用go pprof工具导出采集的指标，这里替换127.0.0.1为apiserver节点的IP，默认端口是8001，如果docker run的环境跑在apiserver所在的节点上，可以使用127.0.0.1。另外，还要替换NODENAME为对应的节点名称。

```bash
docker exec -it golang-env bash
go tool pprof -seconds=60 -raw -output=kubelet.pprof http://127.0.0.1:8001/api/v1/nodes/${NODENAME}/proxy/debug/pprof/profile
```

这里等待60s后，会将这60s内相关的函数调用输出到当前目录的kubelet.pprof文件中。

4. 输出好的pprof文件不方便查看，需要转换成火焰图，推荐使用FlameGraph工具生成svg图

```bash
git clone https://github.com/brendangregg/FlameGraph.git
cd FlameGraph/
./stackcollapse-go.pl kubelet.pprof > kubelet.out
./flamegraph.pl kubelet.out > kubelet.svg
```

转换成火焰图后，就可以在浏览器很直观的看到函数相关调用和具体调用时间比了。

5. 分析火焰图

![image-20201129033348406](https://zerchin.gitee.io/picturebed/img/kubelet%20cpu%E4%BD%BF%E7%94%A8%E7%8E%87%E8%BF%87%E9%AB%98/kubelet_flame2.png)

 从kubelet的火焰图可以看到，调用时间最长的函数是`k8s.io/kubernetes/vendor/github.com/google/cadvisor/manager.(*containerData).housekeeping`，其中cAdvisor是kubelet内置的指标采集工具，主要是负责对节点机器上的资源及容器进行实时监控和性能数据采集，包括CPU使用情况、内存使用情况、网络吞吐量及文件系统使用情况。

​    深入函数调用可以发现`k8s.io/kubernetes/vendor/github.com/opencontainers/runc/libcontainer/cgroups/fs.(*Manager).GetStats`这个函数占用`k8s.io/kubernetes/vendor/github.com/google/cadvisor/manager.(*containerData).housekeeping`这个函数的时间是最长的，说明在获取容器CGroup相关状态时占用了较多的时间。

6. 既然这个函数占用时间长，那么我们就分析一下这个函数具体干了什么事儿

查看源代码：https://github.com/kubernetes/kubernetes/blob/ded8a1e2853aef374fc93300fe1b225f38f19d9d/vendor/github.com/opencontainers/runc/libcontainer/cgroups/fs/memory.go#L162

```go
func (s *MemoryGroup) GetStats(path string, stats *cgroups.Stats) error {
	// Set stats from memory.stat.
	statsFile, err := os.Open(filepath.Join(path, "memory.stat"))
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	defer statsFile.Close()

	sc := bufio.NewScanner(statsFile)
	for sc.Scan() {
		t, v, err := fscommon.GetCgroupParamKeyValue(sc.Text())
		if err != nil {
			return fmt.Errorf("failed to parse memory.stat (%q) - %v", sc.Text(), err)
		}
		stats.MemoryStats.Stats[t] = v
	}
	stats.MemoryStats.Cache = stats.MemoryStats.Stats["cache"]

	memoryUsage, err := getMemoryData(path, "")
	if err != nil {
		return err
	}
	stats.MemoryStats.Usage = memoryUsage
	swapUsage, err := getMemoryData(path, "memsw")
	if err != nil {
		return err
	}
	stats.MemoryStats.SwapUsage = swapUsage
	kernelUsage, err := getMemoryData(path, "kmem")
	if err != nil {
		return err
	}
	stats.MemoryStats.KernelUsage = kernelUsage
	kernelTCPUsage, err := getMemoryData(path, "kmem.tcp")
	if err != nil {
		return err
	}
	stats.MemoryStats.KernelTCPUsage = kernelTCPUsage

	useHierarchy := strings.Join([]string{"memory", "use_hierarchy"}, ".")
	value, err := fscommon.GetCgroupParamUint(path, useHierarchy)
	if err != nil {
		return err
	}
	if value == 1 {
		stats.MemoryStats.UseHierarchy = true
	}

	pagesByNUMA, err := getPageUsageByNUMA(path)
	if err != nil {
		return err
	}
	stats.MemoryStats.PageUsageByNUMA = pagesByNUMA

	return nil
}
```

从代码中可以看到，进程会去读取`memory.stat`这个文件，这个文件存放了cgroup内存使用情况。也就是说，在读取这个文件花费了大量的时间。这时候，如果我们手动去查看这个文件，会是什么效果？

```bash
# time cat /sys/fs/cgroup/memory/memory.stat >/dev/null
real 0m9.065s
user 0m0.000s
sys 0m9.064s
```

从这里可以看出端倪了，读取这个文件花费了9s，显然是不正常的，难怪kubeletCPU使用飙高，原来是堵在这里了。

基于上述结果，我们在cAdvisor的GitHub上查找到一个[issue](https://github.com/google/cadvisor/issues/1774)，从该issue中可以得知，该问题跟slab memory 缓存有一定的关系。从该issue中得知，受影响的机器的内存会逐渐被使用，通过/proc/meminfo看到使用的内存是slab memory，该内存是内核缓存的内存页，并且其中绝大部分都是dentry缓存。从这里我们可以判断出，当CGroup中的进程生命周期结束后，由于缓存的原因，还存留在slab memory中，导致其类似僵尸CGroup一样无法被释放。

也就是每当创建一个memory CGroup，在内核内存空间中，就会为其创建分配一份内存空间，该内存包含当前CGroup相关的cache（dentry、inode），也就是目录和文件索引的缓存，该缓存本质上是为了提高读取的效率。但是当CGroup中的所有进程都退出时，存在内核内存空间的缓存并没有清理掉。

内核通过伙伴算法进行内存分配，每当有进程申请内存空间时，会为其分配至少一个内存页面，也就是最少会分配4k内存，每次释放内存，也是按照最少一个页面来进行释放。当请求分配的内存大小为几十个字节或几百个字节时，4k对其来说是一个巨大的内存空间，在Linux中，为了解决这个问题，引入了slab内存分配管理机制，用来处理这种小量的内存请求，这就会导致，当CGroup中的所有进程都退出时，不会轻易回收这部分的内存，而这部分内存中的缓存数据，还会被读取到stats中，从而导致影响读取的性能。



## 解决方法

1. 清理节点缓存，这是一个临时的解决方法，暂时清空节点内存缓存，能够缓解kubelet CPU使用率，但是后面缓存上来了，CPU使用率又会升上来。

```bash
echo 2 > /proc/sys/vm/drop_caches
```

2. 升级内核版本

   2.1. 其实这个主要还是内核的问题，在GitHub上这个[commit](https://github.com/torvalds/linux/commit/205b20cc5a99cdf197c32f4dbee2b09c699477f0)中有提到，在5.2+以上的内核版本中，优化了CGroup stats相关的查询性能，如果想要更好的解决该问题，建议可以参考自己操作系统和环境，合理的升级内核版本。

   2.2. 另外Redhat在[kernel-4.18.0-176](https://bugzilla.redhat.com/show_bug.cgi?id=1795049)版本中也优化了相关CGroup的性能问题，而CentOS 8/RHEL 8默认使用的内核版本就是4.18，如果目前您使用的操作系统是RHEL7/CentOS7，则可以尝试逐渐替换新的操作系统，使用这个4.18.0-176版本以上的内核，毕竟新版本内核总归是对容器相关的体验会好很多。

> kernel相关commit：https://github.com/torvalds/linux/commit/205b20cc5a99cdf197c32f4dbee2b09c699477f0
>
> redhat kernel bug fix：https://bugzilla.redhat.com/show_bug.cgi?id=1795049