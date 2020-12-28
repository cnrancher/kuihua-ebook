# JAVA应用，内存超出后没有进行OOMKILL

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|应用部署常见问题

---

## 问题现象
java应用上容器云后没有配置JVM MaxRAM，发现实际内存使用量早已超过配置的Limit限制制，但Kubernetes并没有oomkill掉这个应用

## 问题原因
首先Docker容器本质是是宿主机上的一个进程，与宿主机共享/proc目录，在容器内看到的/proc/meminfo，/proc/cpuinfo 与直接在宿主机上看到的一致，默认JVM的Max Heap Size是系统内存的1/4，这就导致此原因。

## 问题解决
新的Java版本（10及以上版本）已经内置了docker支持功能够读取到Kubernetes中配置的limit配置。对于旧版本jdk8的使用8u212或更新的版本即可。