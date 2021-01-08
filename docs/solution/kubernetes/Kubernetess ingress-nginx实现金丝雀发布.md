# K8s 1.18.6版本基于 ingress-nginx 实现金丝雀发布（灰度发布）

|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/12/11
|类型|ingress相关解决方案

---
## 环境

| 软件                     | 版本    |
| ------------------------ | ------- |
| kubernetes               | v1.18.6 |
| nginx-ingress-controller | 0.32.0  |
| Rancher                  | v2.4.5  |

本次实验基于 Rancher-v2.4.5 部署了1.18.6版本的k8s集群，nginx-ingress 版本为0.32.0，理论上 ingress-nginx >= 0.21.0都是可以的。

以下所有的实验，都可以直接在rancher UI上直接配置。



## 介绍

金丝雀发布：又叫灰度发布，控制产品从A版本平滑的过度到B版本

ingress-nginx：k8s ingress工具，支持金丝雀发布，可以实现基于权重、请求头、请求头的值、cookie转发流量。

rancher：k8s集群管理工具，使用UI简化k8s相关操作

ingress-nginx canary官方说明：https://github.com/kubernetes/ingress-nginx/blob/master/docs/user-guide/nginx-configuration/annotations.md#canary



## 首先创建两个nginx应用

1. 部署两个deployment的http应用

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: appv1
  labels:
    app: v1
spec:
  replicas: 1
  selector:
    matchLabels:
      app: v1
  template:
    metadata:
      labels:
        app: v1
    spec:
      containers:
      - name: nginx
        image: zerchin/canary:v1
        ports:
        - containerPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: appv2
  labels:
    app: v2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: v2
  template:
    metadata:
      labels:
        app: v2
    spec:
      containers:
      - name: nginx
        image: zerchin/canary:v2
        ports:
        - containerPort: 80
```

kubectl查看pod

```powershell
# kubectl get pod -o wide |grep app
appv1-77655949f8-hx6nm   1/1     Running   0          44m   10.60.0.91   xie-node001   <none>           <none>
appv2-7b8659cd88-dgd5c   1/1     Running   0          44m   10.60.0.92   xie-node001   <none>           <none>
```

这两个应用输出以下内容

```powershell
# curl 10.60.0.91
v1
# curl 10.60.0.92
canary-v2
```



2. 分别为应用创建对应的service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: appv1
spec:
  selector:
    app: v1
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: appv2
spec:
  selector:
    app: v2
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

kubectl查看service

```
# kubectl get svc |grep app
appv1         ClusterIP   10.50.42.17    <none>        80/TCP    26m
appv2         ClusterIP   10.50.42.131   <none>        80/TCP    26m
```



## 部署一个正常的ingress

现在这个ingress能正常的将访问路由到appv1上

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: app
  namespace: default
spec:
  rules:
  - host: nginx.zerchin.xyz
    http:
      paths:
      - backend:
          serviceName: appv1
          servicePort: 80
        path: /
```

kubectl查看ingress

```powershell
# kubectl get ingress
NAME         CLASS    HOSTS               ADDRESS                     PORTS   AGE
app          <none>   nginx.zerchin.xyz   172.16.0.195,172.16.0.196   80      11m
```

访问nginx.zerchin.xyz

```bash
# curl nginx.zerchin.xyz
v1
```



## 基于权重转发流量

`nginx.ingress.kubernetes.io/canary-weight`：随机整数请求的整数百分比（0-100），应将其路由到canary Ingress中指定的服务。权重0表示此Canary规则不会在Canary入口中将任何请求发送到服务。权重为100表示所有请求都将发送到Ingress中指定的替代服务。

新建一个ingress，配置如下

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "30"
  name: app-canary
  namespace: default
spec:
  rules:
  - host: nginx.zerchin.xyz
    http:
      paths:
      - backend:
          serviceName: appv2
          servicePort: 80
        path: /
```

kubectl查看ingress

```powershell
# kubectl get ingress
NAME         CLASS    HOSTS               ADDRESS                     PORTS   AGE
app          <none>   nginx.zerchin.xyz   172.16.0.195,172.16.0.196   80      11m
app-canary   <none>   nginx.zerchin.xyz   172.16.0.195,172.16.0.196   80      7m13s
```

这时候再访问nginx.zerchin.xyz，会发现其中30%的流量会路由到v2版本上

```bash
# for i in `seq 1 10`;do curl nginx.zerchin.xyz;done
canary-v2
canary-v2
v1
v1
canary-v2
v1
v1
v1
v1
v1
```



## 基于请求头转发流量

`nginx.ingress.kubernetes.io/canary-by-header`：用于通知Ingress将请求路由到Canary Ingress中指定的服务的标头。当请求标头设置`always`为时，它将被路由到Canary。当标头设置`never`为时，它将永远不会路由到金丝雀。对于任何其他值，标头将被忽略，并且按优先级将请求与其他金丝雀规则进行比较。

修改app-canary的ingress配置，修改annotation，如下：

```yaml
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "canary"
```

测试结果

```powershell
# curl nginx.zerchin.xyz 
v1
# curl -H "canary:always" nginx.zerchin.xyz 
canary-v2
```



## 基于请求头和请求头的值转发流量

`nginx.ingress.kubernetes.io/canary-by-header-value`：匹配的报头值，用于通知Ingress将请求路由到Canary Ingress中指定的服务。当请求标头设置为此值时，它将被路由到Canary。对于任何其他标头值，标头将被忽略，并按优先级将请求与其他金丝雀规则进行比较。此注释必须与`nginx.ingress.kubernetes.io/canary-by-header`一起使用。

修改app-canary的ingress配置，修改annotation，如下：

```yaml
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "canary"
    nginx.ingress.kubernetes.io/canary-by-header-value: "haha"
```

测试结果

```powershell
# curl nginx.zerchin.xyz
v1
# curl -H "canary:haha" nginx.zerchin.xyz
canary-v2
# curl -H "canary:always" nginx.zerchin.xyz
v1
```



## 基于cookie转发流量

`nginx.ingress.kubernetes.io/canary-by-cookie`：用于通知Ingress将请求路由到Canary Ingress中指定的服务的cookie。当cookie值设置`always`为时，它将被路由到canary。当cookie设置`never`为时，它将永远不会路由到Canary。对于任何其他值，将忽略cookie，并按优先级将请求与其他canary规则进行比较。

修改app-canary的ingress配置，修改annotation，如下：

```yaml
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-cookie: "test"
```

测试结果

```powershell
# curl nginx.zerchin.xyz
v1
# curl -b "test=never" nginx.zerchin.xyz
v1
# curl -b "test=always" nginx.zerchin.xyz
canary-v2
# curl -b "test=1" nginx.zerchin.xyz
v1
```



## 总结

1. 金丝雀发布规则优先级：`canary-by-header` -> `canary-by-cookie `-> `canary-weight`

2. 目前，每个ingress规则最多可以应用一个canary ingress