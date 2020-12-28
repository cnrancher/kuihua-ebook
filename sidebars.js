/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    troubleshooting: {
        Docker相关: ["troubleshooting/Docker/大量runc不释放，导致节点负载高"],
        Kubernetes相关: [
            {
                type: "category",
                label: "etcd相关",
                items: [
                    "troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败",
                    "troubleshooting/Kubernetes/etcd相关/磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障",
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
        ],
        操作系统相关: [
            {
                type: "category",
                label: "Kernel相关",
                items: [
                    "troubleshooting/OS/Kernel/unregister_netdevice: waiting for eth0 to become free 报错",
                    "troubleshooting/OS/Kernel/内核arp_proxy参数配置不当导致Macvlan环路",
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
};
