# nginx-ingress基于gRPC协议通信


|作者|谢泽钦|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/12/11
|类型|ingress相关解决方案

---
此文档演示如何通过nginx-ingress将流量路由到gRPC服务上。



## 环境

| 环境          | 版本   |
| ------------- | ------ |
| kubernetes    | 1.17.4 |
| Rancher       | v2.4.5 |
| nginx-ingress | 0.25.1 |



## 示例

以下gRPC应用基于ingress自带的示例，您也可以使用自己的gRPC应用进行测试

地址：https://github.com/kubernetes/ingress-nginx/tree/master/docs/examples/grpc



1. 部署一个gRPC应用

该应用程序通过go实现gRPC服务，并监听50051端口

```yaml
# cat  app.yaml 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fortune-teller-app
  labels:
    k8s-app: fortune-teller-app
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      k8s-app: fortune-teller-app
  template:
    metadata:
      labels:
        k8s-app: fortune-teller-app
    spec:
      containers:
      - name: fortune-teller-app
        image: quay.io/kubernetes-ingress-controller/grpc-fortune-teller:0.1
        ports:
        - containerPort: 50051
          name: grpc
```



2. 部署service，通过selector选择对应label的pod

```yaml
# cat svc.yaml 
apiVersion: v1
kind: Service
metadata:
  name: fortune-teller-service
  namespace: default
spec:
  selector:
    k8s-app: fortune-teller-app
  ports:
  - port: 50051
    targetPort: 50051
    name: grpc
```



3. 部署ingress

这里主要设置这个参数来使用gRPC协议：`nginx.ingress.kubernetes.io/backend-protocol: "GRPC"` 

还配置了SSL证书，默认使用ingress颁发的证书

```yaml
# cat ingress.yaml 
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "GRPC"
  name: fortune-ingress
  namespace: default
spec:
  rules:
  - host: fortune-teller.stack.build
    http:
      paths:
      - backend:
          serviceName: fortune-teller-service
          servicePort: grpc
  tls:
  - secretName: fortune-teller.stack.build
    hosts:
      - fortune-teller.stack.build
```



4. kubectl执行以上文件

```bash
# kubectl apply -f app.yaml 

# kubectl apply -f svc.yaml 

# kubectl apply -f ingress.yaml 
```



4. 使用grpcurl测试应用

grpcurl命令下载地址如下：https://github.com/fullstorydev/grpcurl/releases

例如下载 grpcurl_1.6.1_linux_x86_64.tar.gz

```bash
# wget https://github.com/fullstorydev/grpcurl/releases/download/v1.6.1/grpcurl_1.6.1_linux_x86_64.tar.gz

# tar -zxvf grpcurl_1.6.1_linux_x86_64.tar.gz

# cp grpcurl /usr/local/bin/grpcurl
```

测试基于ingress访问gRPC应用（示例中，message的值会不一样）

```bash
# grpcurl -insecure fortune-teller.stack.build:443 build.stack.fortune.FortuneTeller/Predict
{
  "message": "[We] use bad software and bad machines for the wrong things.\n\t\t-- R. W. Hamming"
}
```