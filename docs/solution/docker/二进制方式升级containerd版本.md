
# 二进制方式升级containerd版本
> 当前环境版本信息
docker：19.03.9
升级containerd：1.3.9 —> 1.4.3

### 1. github下载二进制containerd
链接： https://github.com/containerd/containerd/releases/tag/v1.4.3
![](https://img-blog.csdnimg.cn/img_convert/d0b9ec25fe30c07395a45440b7189e67.png)

### 2.解压containerd

```bash
tar -zxvf containerd-1.4.3-linux-amd64.tar.gz 
```

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%96%B9%E5%BC%8F%E5%8D%87%E7%BA%A7containerd%E7%89%88%E6%9C%AC/2.jpg)

### 3.检查当前containerd版本
```bash
docker info 
containerd -v

```

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%96%B9%E5%BC%8F%E5%8D%87%E7%BA%A7containerd%E7%89%88%E6%9C%AC/3.jpg)

### 4.暂停docker
```bash
systemctl stop docker
```

### 5.替换containerd二进制文件

需要替换的二进制文件有5个

```bash
containerd  containerd-shim  containerd-shim-runc-v1  containerd-shim-runc-v2 ctr
```

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%96%B9%E5%BC%8F%E5%8D%87%E7%BA%A7containerd%E7%89%88%E6%9C%AC/4.jpg)

```bash
cp containerd /usr/bin/containerd
cp containerd-shim /usr/bin/containerd-shim
cp containerd-shim-runc-v1 /usr/bin/containerd-shim-runc-v1
cp containerd-shim-runc-v2 /usr/bin/containerd-shim-runc-v2
cp ctr /usr/bin/ctr
```

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%96%B9%E5%BC%8F%E5%8D%87%E7%BA%A7containerd%E7%89%88%E6%9C%AC/5.jpg)

### 6.重启docker 检查containerd版本是否替换成功

![](
https://ivanwz.oss-cn-shenzhen.aliyuncs.com/md/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%96%B9%E5%BC%8F%E5%8D%87%E7%BA%A7containerd%E7%89%88%E6%9C%AC/6.jpg)