*Copyright  2020, [Rancher Labs (CN)](https://www.rancher.cn/). All Rights Reserved.*

|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/05/29
|类型|升级相关

---

参考github：https://github.com/helm/helm/releases/tag/v3.4.1

可以从rancher国内仓库下载helm3工具

### 下载helm3最新版本

```
wget http://rancher-mirror.cnrancher.com/helm/v3.4.1/helm-v3.4.1-linux-amd64.tar.gz
tar -zxvf helm-v3.4.1-linux-amd64.tar.gz
cp linux-amd64/helm /usr/local/bin/helm3
```

确认helm版本

```bash
# helm3 version
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
version.BuildInfo{Version:"v3.4.1", GitCommit:"c4e74854886b2efe3321e185578e6db9be0a6e29", GitTreeState:"clean", GoVersion:"go1.14.11"}
```



### 安装helm-2to3插件

参考：https://helm.sh/blog/migrate-from-helm-v2-to-helm-v3/

```bash
helm3 plugin install https://github.com/helm/helm-2to3
```

输出如下结果则安装成功

```bash
Installed plugin: 2to3
```



### 查看helm3插件

```bash
# helm3 plugin list
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
NAME    VERSION DESCRIPTION                                                               
2to3    0.7.0   migrate and cleanup Helm v2 configuration and releases in-place to Helm v3
```



### 迁移helm2配置至helm3

这一步会将repos、plugins、Chart starters迁移到helm3中

```bash
# helm3 2to3 move config
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
2020/12/07 16:25:32 WARNING: Helm v3 configuration may be overwritten during this operation.
2020/12/07 16:25:32 
[Move config/confirm] Are you sure you want to move the v2 configuration? [y/N]: y
2020/12/07 16:25:35 
Helm v2 configuration will be moved to Helm v3 configuration.
2020/12/07 16:25:35 [Helm 2] Home directory: /root/.helm
2020/12/07 16:25:35 [Helm 3] Config directory: /root/.config/helm
2020/12/07 16:25:35 [Helm 3] Data directory: /root/.local/share/helm
2020/12/07 16:25:35 [Helm 3] Cache directory: /root/.cache/helm
2020/12/07 16:25:35 [Helm 3] Create config folder "/root/.config/helm" .
2020/12/07 16:25:35 [Helm 3] Config folder "/root/.config/helm" created.
2020/12/07 16:25:35 [Helm 2] repositories file "/root/.helm/repository/repositories.yaml" will copy to [Helm 3] config folder "/root/.config/helm/repositories.yaml" .
2020/12/07 16:25:35 [Helm 2] repositories file "/root/.helm/repository/repositories.yaml" copied successfully to [Helm 3] config folder "/root/.config/helm/repositories.yaml" .
2020/12/07 16:25:35 [Helm 3] Create cache folder "/root/.cache/helm" .
2020/12/07 16:25:35 [Helm 3] cache folder "/root/.cache/helm" created.
2020/12/07 16:25:35 [Helm 3] Create data folder "/root/.local/share/helm" .
2020/12/07 16:25:35 [Helm 3] data folder "/root/.local/share/helm" created.
2020/12/07 16:25:35 [Helm 2] starters "/root/.helm/starters" will copy to [Helm 3] data folder "/root/.local/share/helm/starters" .
2020/12/07 16:25:35 [Helm 2] starters "/root/.helm/starters" copied successfully to [Helm 3] data folder "/root/.local/share/helm/starters" .
2020/12/07 16:25:35 Helm v2 configuration was moved successfully to Helm v3 configuration.
```

看到`successfully`则说明迁移成功，使用`helm3`命令查看`repo`

```bash
# helm3 repo list
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
NAME          	URL                                              
local         	http://127.0.0.1:8879/charts                     
jetstack      	https://charts.jetstack.io                       
rancher-stable	https://releases.rancher.com/server-charts/stable
```

可以看到，repo已经迁移成功



### 迁移helm2 release到helm3

首先查看helm2中的release

```bash
# helm list
NAME            REVISION        UPDATED                         STATUS          CHART                   APP VERSION     NAMESPACE    
cert-manager    1               Mon Dec  7 14:49:16 2020        DEPLOYED        cert-manager-v0.8.1     v0.8.1          cert-manager 
rancher         1               Mon Dec  7 14:51:20 2020        DEPLOYED        rancher-2.2.9           v2.2.9          cattle-system
```

迁移rancher

```bash
# helm3 2to3 convert rancher
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
WARNING: "kubernetes-charts.storage.googleapis.com" is deprecated for "stable" and will be deleted Nov. 13, 2020.
WARNING: You should switch to "https://charts.helm.sh/stable" via:
WARNING: helm repo add "stable" "https://charts.helm.sh/stable" --force-update
2020/12/07 16:33:31 Release "rancher" will be converted from Helm v2 to Helm v3.
2020/12/07 16:33:31 [Helm 3] Release "rancher" will be created.
2020/12/07 16:33:31 [Helm 3] ReleaseVersion "rancher.v1" will be created.
2020/12/07 16:33:31 [Helm 3] ReleaseVersion "rancher.v1" created.
2020/12/07 16:33:31 [Helm 3] Release "rancher" created.
2020/12/07 16:33:31 Release "rancher" was converted successfully from Helm v2 to Helm v3.
2020/12/07 16:33:31 Note: The v2 release information still remains and should be removed to avoid conflicts with the migrated v3 release.
2020/12/07 16:33:31 v2 release information should only be removed using `helm 2to3` cleanup and when all releases have been migrated over.
```

使用helm3查看release list（helm3 需要设置命名空间）

```bash
# helm3 list -n cattle-system 
WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /root/.kube/config
NAME   	NAMESPACE    	REVISION	UPDATED                               	STATUS  	CHART        	APP VERSION
rancher	cattle-system	1       	2020-12-07 15:49:04.20697732 +0000 UTC	deployed	rancher-2.2.9	v2.2.9
```

如果还有其他应用，需要一个个迁移过来



### 清理helm2数据

**注意！！！**这一步将会**删除**tiller pod以及helm2在主机上相关文件，执行之后**无法还原**，如果不确定可以先不执行

```bash
helm3 2to3 cleanup
```
