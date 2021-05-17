|作者|谢泽钦|
|---|---|
|团队|Filed&&Suppoort|
|编写时间|2021/05/17|
|类型|常见问题-Docker相关|

## 问题现象

主机重启后，docker上的容器无法启动，报错如下

```bash
# docker restart nginx-proxy
Error response from daemon: Cannot restart container nginx-proxy: error creating overlay mount to /var/lib/docker/overlay2/7431ad53435c5cb52cc24ecc7263b580d4087e2c25e0d4c4c14c577a32ad3607/merged: invalid argument
```

## 问题原因
通过系统日志可以看到如下报错：
![message-log](https://zerchin.gitee.io/picturebed/img/selinux踩坑篇-docker容器无法启动.assets/message-log.png)


该问题的主要原因是操作系统之前开启过selinux，在此前提下启动docker并创建了该容器，于是docker的启动参数中会携带某些selinux配置，随后又修改了/etc/selinux/config的配置，将selinux设置为disabled的状态，但是此时selinux的disabled还未生效，而要使selinux的disabled生效，需要重启主机。所以在重启主机前，selinux的状态还是开启的，容器都是能够正常运行。

当重启主机后，/etc/selinux/config下的配置就开始生效，selinux就会被设置为disabled的状态，此时容器的配置中还携带有selinux的配置，当启动容器时，会携带这些配置去访问selinux服务，此时selinux是不可用的状态，所以容器就会抛出异常无法启动。


## 问题解决
1. 重新启用selinux，然后重启主机即可。
```bash
> cat /etc/selinux/config 

# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of disabled.
#     disabled - No SELinux policy is loaded.
SELINUX=enforcing
# SELINUXTYPE= can take one of three values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected. 
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted

> reboot
```
selinux 主要作用就是最大限度地减小系统中服务进程可访问的资源，但是如果对selinux不是很懂的情况下，开启selinux可能还会引起其他问题，此时建议采用第二种方法


2. 修改容器的配置，将 MountLabel 和 ProcessLabel 两个参数的值设置为空`"MountLabel":"","ProcessLabel":""`，然后重启docker服务，容器即可修复
```bash
cd /var/lib/docker/containers/<container_id>/
cat config.v2.json
```

![docker-config](https://zerchin.gitee.io/picturebed/img/selinux踩坑篇-docker容器无法启动.assets/docker-config-2.png)

从上图中可以发现， MountLabel和ProcessLabel中都携带了selinux的参数，于是将这两个参数的值都设置为空，然后重启docker（直接修改配置无法生效，需要重启docker才能生效），容器启动成功

```bash
> vi config.v2.json
...
...
"MountLabel":"","ProcessLabel":""
...
...

> systemctl restart docker
> docker ps |grep nginx
037bd8327183        nginx:1.14                      "nginx -g 'daemon of…"   About 18 hour ago   Up 11 seconds                           nginx-proxy
```

