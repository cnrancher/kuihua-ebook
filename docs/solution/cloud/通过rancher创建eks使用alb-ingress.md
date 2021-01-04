*Copyright  2020, [Rancher Labs (CN)](https://www.rancher.cn/). All Rights Reserved.*

|作者|袁振|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/09/22
|类型|监控解决方案


---

### 创建一个IAM OIDC与集群关联
```bash
# <region_code>  集群所在区域代码，更换为eks集群实际所在区域；
# <cluster_name> 创建的eks集群名称，更换为实际eks集群名称；

eksctl utils associate-iam-oidc-provider \
    --region <region_code> \
    --cluster <cluster_name> \
    --approve
```
### 创建IAM策略

```bash
# 下载IAM策略文件，该策略允许它代表您调用AWS API；

curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/iam-policy.json

#使用上一步中下载的策略创建一个名为ALBIngressControllerIAMPolicy的IAM的策略

aws iam create-policy \
    --policy-name ALBIngressControllerIAMPolicy \
    --policy-document file://iam-policy.json

```
* 创建完成后，记录返回值，主要是arn部分，返回结果如下示例：
```json
返回记录：

{
    "Policy": {
        "PolicyName": "ALBIngressControllerIAMPolicy",
        "PolicyId": "ANPAUVDFTSFAY367HBRMO",
        "Arn": "arn:aws-cn:iam::320188158273:policy/ALBIngressControllerIAMPolicy",
        "Path": "/",
        "DefaultVersionId": "v1",
        "AttachmentCount": 0,
        "PermissionsBoundaryUsageCount": 0,
        "IsAttachable": true,
        "CreateDate": "2020-09-22T12:35:44+00:00",
        "UpdateDate": "2020-09-22T12:35:44+00:00"
    }
}
```

### 集群中创建rbac规则

```bash
#在此步骤中会同时创建ClusterRole、ClusterRoleBinding和ServiceAccount；

kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/rbac-role.yaml
```


### 创建IAM角色
* 使用以下命令将您的AWS账户ID设置为环境变量。
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
```
* 使用以下命令将OIDC身份提供程序设置为环境变量

```bash
# <cluster_name> 创建的eks集群名称，更换为实际eks集群名称；

OIDC_PROVIDER=$(aws eks describe-cluster --name <cluster_name> --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")
```

* 复制以下内容，运行后生成trust.json文件，其中< namespace >为命名空间名称，< service-account-name >为serviceaccount名称，请根据实际需要更改；

```bash
# 注意：如果是aws中国，则为"Federated": "arn:aws-cn:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"

read -r -d '' TRUST_RELATIONSHIP <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER}:sub": "system:serviceaccount:<namespace>:<service-account-name>"
        }
      }
    }
  ]
}
EOF
echo "${TRUST_RELATIONSHIP}" > trust.json
```

* 创建角色
```bash
# <role_name> 替换为角色名称；
# <role_description> 替换为角色描述；

aws iam create-role --role-name <role_name> --assume-role-policy-document file://trust.json --description "<role_description>"
```


### 附加IAM策略到角色

```bash
# <role_name> 替换为角色名称;
# <policy_arn> 替换为策略arn，也就是上面记录的arn的值；

aws iam attach-role-policy --role-name <role_name> --policy-arn=<policy_arn>
```




### 将角色的ARN添加到注释到serviceaccount
```bash
# <role_arn> 替换为实际角色arn

kubectl annotate serviceaccount -n kube-system alb-ingress-controller \
eks.amazonaws.com/role-arn=<role_arn>
```

### 部署alb-ingress-controller

* 下载alb-ingress-controller.yaml
```bash
https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/alb-ingress-controller.yaml
```

* 修改alb-ingress-controller

```yaml
    spec:
      containers:
        - name: alb-ingress-controller
          args:
            # Limit the namespace where this ALB Ingress Controller deployment will
            # resolve ingress resources. If left commented, all namespaces are used.
            # - --watch-namespace=your-k8s-namespace

            # Setting the ingress-class flag below ensures that only ingress resources with the
            # annotation kubernetes.io/ingress.class: "alb" are respected by the controller. You may
            # choose any class you'd like for this controller to respect.
            - --ingress-class=alb

            # REQUIRED
            # Name of your cluster. Used when naming resources created
            # by the ALB Ingress Controller, providing distinction between
            # clusters.
            - --cluster-name= <cluster_name>  # 修改为eks集群名称 

            # AWS VPC ID this ingress controller will use to create AWS resources.
            # If unspecified, it will be discovered from ec2metadata.
            - --aws-vpc-id= <vpc ID>  # 修改为eks集群所在集群VPC_ID 

            # AWS region this ingress controller will operate in.
            # If unspecified, it will be discovered from ec2metadata.
            # List of regions: http://docs.aws.amazon.com/general/latest/gr/rande.html#vpc_region
            - --aws-region= <region_code> # 集群所在区域代码

            # Enables logging on all outbound requests sent to the AWS API.
            # If logging is desired, set to true.
            # - --aws-api-debug

            # Maximum number of times to retry the aws calls.
            # defaults to 10.
            # - --aws-max-retries=10

            - --feature-gates=waf=false,wafv2=false # 中国区域eks需要禁用

          env:
            - name: AWS_REGION
              value: <region_code> # 集群所在区域代码
            # AWS key id for authenticating with the AWS API.
            # This is only here for examples. It's recommended you instead use
            # a project like kube2iam for granting access.
            # - name: AWS_ACCESS_KEY_ID
            #   value: KEYVALUE

            # AWS key secret for authenticating with the AWS API.
            # This is only here for examples. It's recommended you instead use
            # a project like kube2iam for granting access.
            # - name: AWS_SECRET_ACCESS_KEY
            #   value: SECRETVALUE
          # Repository location of the ALB Ingress Controller.

```

* 部署alb-ingress-controller

```bash
kubectl apply -f alb-ingress-controller.yaml 
```

### 验证是否可用 
* 将以下内容保存为 nginx-alb-ingress.yaml

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment-ingress
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
     matchLabels:
        app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: "service-nginx-clusterip"
spec:
  selector:
    app: nginx
  type: ClusterIP
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: "alb-ingress"
  namespace: "default"
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
  labels:
    app: nginx
spec:
  rules:
    - http:
        paths:
          - path: /*
            backend:
              serviceName: "service-nginx-clusterip"
              servicePort: 80
```

* 部署nginx、service和ingress
```bash
kubectl apply -f nginx-alb-ingress.yaml
kubectl get ingress
```

* 添加vpc标签
```bash
#  此时如果vpc没有打标签，ingress是无法正常运行的，此时需要增加vpc标签如下：
kubernetes.io/role/elb
kubernetes.io/cluster/<cluster_name> = shared/owned
```

* 验证

```bash
ALB=$(kubectl get ingress -o json | jq -r '.items[0].status.loadBalancer.ingress[].hostname')
curl -v $ALB

# 如果遇到问题，请查看日志
kubectl logs -n kube-system $(kubectl get po -n kube-system | egrep -o alb-ingress[a-zA-Z0-9-]+)
```

* 清理测试应用
```bash
kubectl delete -f alb-ingress-controller/nginx-alb-ingress.yaml
```

