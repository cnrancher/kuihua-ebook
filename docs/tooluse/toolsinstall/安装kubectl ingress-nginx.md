# 安装kubectl ingress-nginx

|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/11/11
|类型|Kubernenetes组件异常排查

---

> 参考官网：https://kubernetes.github.io/ingress-nginx/kubectl-plugin/

## 前提

软件 | 版本
---|---
k8s | 不限制
ingress-nginx | 不限制



## 安装
### 1、安装krew
ingress-nginx插件需要通过krew安装，首先需要安装krew工具

执行以下脚本安装krew

```bash
(
  set -x; cd "$(mktemp -d)" &&
  curl -fsSLO "https://github.com/kubernetes-sigs/krew/releases/latest/download/krew.tar.gz" &&
  tar zxvf krew.tar.gz &&
  KREW=./krew-"$(uname | tr '[:upper:]' '[:lower:]')_$(uname -m | sed -e 's/x86_64/amd64/' -e 's/arm.*$/arm/')" &&
  "$KREW" install krew
)
```
/etc/profile 设置PATH
```bash
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
```

> 参考：https://krew.sigs.k8s.io/docs/user-guide/setup/install/

### 2、krew安装ingress-nginx插件
```bash
kubectl krew install ingress-nginx
```

### 3、验证
```bash
kubectl ingress-nginx --help
```


## 使用
默认是在default命名空间下查找`ingress-nginx-controller` deployment，Rancher安装的ingress-nginx是使用daemonset部署的，不知道通过daemonset查找，但是可以通过pod或者标签选择器查找，例如：
```bash
kubectl ingress-nginx backends -n ingress-nginx --pod nginx-ingress-controller-rplw2  --list
## 或者
kubectl ingress-nginx backends -n ingress-nginx -l app=ingress-nginx  --list
```

### backends
```bash
## 只列出backends
kubectl ingress-nginx backends -n ingress-nginx -l app=ingress-nginx  --list

## 查看某个backend的详细信息
kubectl ingress-nginx backends -n ingress-nginx -l app=ingress-nginx  --backend default-nginx-test-http-nginx-test

## 查看所有backends
kubectl ingress-nginx backends -n ingress-nginx -l app=ingress-nginx

```

### cert 查看证书
如果ingress设置了ssl，可以通过cert命令查看证书，例如：
```bash
kubectl ingress-nginx certs -l app=ingress-nginx  -n ingress-nginx --host test3.zerchin.xyz
```
> 这里的--host指定的是域名，不是backend list的名字

### conf 查看配置
```bash
### 默认不带参数，查看所有配置，等同于进入pod查看/etc/nginx/nginx.conf
kubectl ingress-nginx conf -l app=ingress-nginx  -n ingress-nginx

### 查看单个ingress的配置，这里查看的是server下的配置
kubectl ingress-nginx conf -l app=ingress-nginx  -n ingress-nginx --host nginx.zerchin.xyz

```

### exec 执行命令
默认带有一个exec参数，可以执行相关命令，但是这个感觉没有自带的`kubectl exec` 好用
```bash
kubectl ingress-nginx exec -l app=ingress-nginx  -n ingress-nginx  pwd
/etc/nginx
```


### service
由于Rancher部署的ingress-nginx没有对应service，暂时看不到

### ingresses
提供所有入口定义的简短摘要，类似kubectl get ingress
```bash
kubectl ingress-nginx ingresses --all-namespaces --host nginx.zerchin.xyz
NAMESPACE   INGRESS NAME   HOST+PATH            ADDRESSES      TLS   SERVICE      SERVICE PORT      ENDPOINTS
default     nginx          nginx.zerchin.xyz/   47.242.45.56   NO    nginx-test   http-nginx-test   4
```

### lint
检查kubernetes资源中可能存在的问题
```bash
kubectl ingress-nginx lint --all-namespaces --show-all -v
Checking ingresses...
✓ default/nginx
✓ default/test
✓ default/test3-ssl
Checking deployments...
✓ cattle-prometheus/exporter-kube-state-cluster-monitoring
✓ cattle-prometheus/grafana-cluster-monitoring
✓ cattle-prometheus/prometheus-operator-monitoring-operator
✓ cattle-system/cattle-cluster-agent
✓ default/busybox
✓ default/nginx-test
✓ default/proxy-nginx
✓ default/test
✓ ingress-nginx/default-http-backend
✓ kube-system/coredns
✓ kube-system/coredns-autoscaler
✓ kube-system/metrics-server
✓ local-path-storage/local-path-provisioner
✓ nfs-client-provisioner/nfs-client-provisioner
✓ p-6bwf5-pipeline/docker-registry
✓ p-6bwf5-pipeline/example-helloserver
✓ p-6bwf5-pipeline/jenkins
✓ p-6bwf5-pipeline/minio
✓ p-x25kp-pipeline/docker-registry
✓ p-x25kp-pipeline/example-nginx
✓ p-x25kp-pipeline/jenkins
✓ p-x25kp-pipeline/minio
```

### logs
查看日志，等同于kubectl logs命令
```bash
## 常用这个
kubectl ingress-nginx  logs -n ingress-nginx -l app=ingress-nginx --tail 100 -f

## 其他参数
## 返回特定时间
--since
--since-time
```

### ssh
等同于`kubectl exec -it xxx -- bash`
```bash
kubectl ingress-nginx  ssh -n ingress-nginx -l app=ingress-nginx
bash-5.0$ 
```