/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    troubleshooting: {
        Docker相关: ["troubleshooting/Docker/大量runc不释放，导致节点负载高",
                    "troubleshooting/Docker/selinux引起的docker容器无法启动的问题",
                    "troubleshooting/Docker/kubectl的top命令与docker的stats命令显示内存不一致问题"
                ],
        Kubernetes相关: [
            {
                type: "category",
                label: "etcd相关",
                items: [
                    "troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败",
                    "troubleshooting/Kubernetes/etcd相关/磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障",
                    "troubleshooting/Kubernetes/etcd相关/在没有快照的情况下恢复etcd集群",
                    "troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败"
                ],
            },
            {
                type: "category",
                label: "存储相关",
                items: [
                    "troubleshooting/Kubernetes/存储相关/POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高",
                ],
            },
            {
                type: "category",
                label: "网络相关",
                items: [
                    "troubleshooting/Kubernetes/Network相关/canal网络MTU值设置不合理性能测试丢包率高",
                    "troubleshooting/Kubernetes/Network相关/Pod IP无法释放导致无法新建Workload",
                    "troubleshooting/Kubernetes/Network相关/Pod内无法访问api-server",
                    "troubleshooting/Kubernetes/Network相关/双网卡网络Macvlan路由配置问题导致vxlan网卡访问丢包",
                ],
            },
            {
                type: "category",
                label: "Istio相关",
                items: [
                    "tooluse/kubernetes/kubeletCPU使用率过高问题排查",
                ],
            },
        ],
        操作系统相关: [
            {
                type: "category",
                label: "Kernel相关",
                items: [
                    "troubleshooting/OS/Kernel/unregister_netdevice: waiting for eth0 to become free 报错",
                    "troubleshooting/OS/Kernel/内核arp_proxy参数配置不当导致Macvlan环路",
                    "troubleshooting/OS/Kernel/内核参数tcp_tw_recycle参数导致服务访问异常",
                ],
            },
        ],
        应用问题相关: [
            {
                type: "category",
                label: "JAVA应用",
                items: [
                    "troubleshooting/application/JAVA应用，内存超出后没有进行OOMKILL",
                ],
            },
        ],
    },
    solution: {
        Kubernetes相关: [
            {
                type: "category",
                label: "Kubernetes与周边组件相关解决方案",
                items: [
                    "solution/kubernetes/nginx-ingress基于gRPC协议通信",
                    "solution/kubernetes/Kubernetess ingress-nginx实现金丝雀发布",
                ],
            },
           ],
       监控相关: [
        {
            type: "category",
            label: "Prometheus相关",
            items: [
                "solution/monitoring/Rancher-2.4.8-ent以上版本监控使用Nodeport暴露",
                "solution/monitoring/在2.5dashhboard启动监控grafana对接ldap"
            ],
        },
       ],
       网络相关: [
        {
            type: "category",
            label: "容器网络相关",
            items: [
                "solution/network/canal网络添加黑洞路由"
            ],
        },
       ],
       存储相关: [
        {
            type: "category",
            label: "存储对接相关",
            items: [
                "solution/storage/ceph对接kubernetes storage class",
            ],
        },
       ],
       公有云小技巧: [
        {
            type: "category",
            label: "EKS小技巧",
            items: [
                "solution/cloud/通过rancher创建eks使用alb-ingress",
            ],
        },
       ],
       日志相关: [
        {
            type: "category",
            label: "Logging相关",
            items: [
                "solution/Longging/RancherLogging收集日志进行外部二次处理",
            ],
        },
       ],
       升级相关: [
        {
            type: "category",
            label: "各种乱七八糟的东西升级手册",
            items: [
                "solution/docker/二进制方式升级containerd版本",
                "solution/helm/helm2升级至helm3"
            ],
        },
       ],
    },
    tooluse: {
        Kubernenetes组件异常排查: [
         {
             type: "category",
             label: "Kubernenetes组件异常排查",
             items: [
                 "tooluse/kubernetes/kubeletCPU使用率过高问题排查",
             ],
         },
        ],
        工具安装部署: [
            {
                type: "category",
                label: "工具安装部署",
                items: [
                    "tooluse/toolsinstall/安装kubectl ingress-nginx",
                ],
            },
           ],
     },
};
