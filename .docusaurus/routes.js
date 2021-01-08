
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  
{
  path: '/',
  component: ComponentCreator('/'),
  exact: true,
  
},
{
  path: '/solution',
  component: ComponentCreator('/solution'),
  exact: true,
  
},
{
  path: '/tooluse',
  component: ComponentCreator('/tooluse'),
  exact: true,
  
},
{
  path: '/troubleshooting',
  component: ComponentCreator('/troubleshooting'),
  exact: true,
  
},
{
  path: '/docs/:route',
  component: ComponentCreator('/docs/:route'),
  
  routes: [
{
  path: '/docs/solution/Longging/RancherLogging收集日志进行外部二次处理',
  component: ComponentCreator('/docs/solution/Longging/RancherLogging收集日志进行外部二次处理'),
  exact: true,
  
},
{
  path: '/docs/solution/cloud/通过rancher创建eks使用alb-ingress',
  component: ComponentCreator('/docs/solution/cloud/通过rancher创建eks使用alb-ingress'),
  exact: true,
  
},
{
  path: '/docs/solution/docker/二进制方式升级containerd版本',
  component: ComponentCreator('/docs/solution/docker/二进制方式升级containerd版本'),
  exact: true,
  
},
{
  path: '/docs/solution/monitoring/Rancher-2.4.8-ent以上版本监控使用Nodeport暴露',
  component: ComponentCreator('/docs/solution/monitoring/Rancher-2.4.8-ent以上版本监控使用Nodeport暴露'),
  exact: true,
  
},
{
  path: '/docs/tooluse/kubernetes/kubeletCPU使用率过高问题排查',
  component: ComponentCreator('/docs/tooluse/kubernetes/kubeletCPU使用率过高问题排查'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Docker/大量runc不释放，导致节点负载高',
  component: ComponentCreator('/docs/troubleshooting/Docker/大量runc不释放，导致节点负载高'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/Network相关/Pod IP无法释放导致无法新建Workload',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/Network相关/Pod IP无法释放导致无法新建Workload'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/Network相关/Pod内无法访问api-server',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/Network相关/Pod内无法访问api-server'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/Network相关/canal网络MTU值设置不合理性能测试丢包率高',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/Network相关/canal网络MTU值设置不合理性能测试丢包率高'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/Network相关/双网卡网络Macvlan路由配置问题导致vxlan网卡访问丢包',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/Network相关/双网卡网络Macvlan路由配置问题导致vxlan网卡访问丢包'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/etcd相关/磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/etcd相关/磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/Kubernetes/存储相关/POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高',
  component: ComponentCreator('/docs/troubleshooting/Kubernetes/存储相关/POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/OS/Kernel/unregister_netdevice: waiting for eth0 to become free 报错',
  component: ComponentCreator('/docs/troubleshooting/OS/Kernel/unregister_netdevice: waiting for eth0 to become free 报错'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/OS/Kernel/内核arp_proxy参数配置不当导致Macvlan环路',
  component: ComponentCreator('/docs/troubleshooting/OS/Kernel/内核arp_proxy参数配置不当导致Macvlan环路'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/OS/Kernel/内核参数tcp_tw_recycle参数导致服务访问异常',
  component: ComponentCreator('/docs/troubleshooting/OS/Kernel/内核参数tcp_tw_recycle参数导致服务访问异常'),
  exact: true,
  
},
{
  path: '/docs/troubleshooting/application/JAVA应用，内存超出后没有进行OOMKILL',
  component: ComponentCreator('/docs/troubleshooting/application/JAVA应用，内存超出后没有进行OOMKILL'),
  exact: true,
  
}],
},
  
  {
    path: '*',
    component: ComponentCreator('*')
  }
];
