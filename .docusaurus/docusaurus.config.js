export default {
  "plugins": [
    "@docusaurus/plugin-baidu-analytics"
  ],
  "themes": [],
  "customFields": {
    "sidebars": {
      "troubleshooting": {
        "Docker相关": [
          "troubleshooting/Docker/大量runc不释放，导致节点负载高"
        ],
        "Kubernetes相关": [
          {
            "type": "category",
            "label": "etcd相关",
            "items": [
              "troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败",
              "troubleshooting/Kubernetes/etcd相关/磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障"
            ]
          },
          {
            "type": "category",
            "label": "存储相关",
            "items": [
              "troubleshooting/Kubernetes/存储相关/POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高"
            ]
          },
          {
            "type": "category",
            "label": "网络相关",
            "items": [
              "troubleshooting/Kubernetes/Network相关/canal网络MTU值设置不合理性能测试丢包率高",
              "troubleshooting/Kubernetes/Network相关/Pod IP无法释放导致无法新建Workload",
              "troubleshooting/Kubernetes/Network相关/Pod内无法访问api-server",
              "troubleshooting/Kubernetes/Network相关/双网卡网络Macvlan路由配置问题导致vxlan网卡访问丢包"
            ]
          }
        ],
        "操作系统相关": [
          {
            "type": "category",
            "label": "Kernel相关",
            "items": [
              "troubleshooting/OS/Kernel/unregister_netdevice: waiting for eth0 to become free 报错",
              "troubleshooting/OS/Kernel/内核arp_proxy参数配置不当导致Macvlan环路"
            ]
          }
        ],
        "应用问题相关": [
          {
            "type": "category",
            "label": "JAVA应用",
            "items": [
              "troubleshooting/application/JAVA应用，内存超出后没有进行OOMKILL"
            ]
          }
        ]
      },
      "solution": {
        "监控相关": [
          {
            "type": "category",
            "label": "监控相关",
            "items": [
              "solution/monitoring/Rancher-2.4.8-ent以上版本监控使用Nodeport暴露"
            ]
          }
        ],
        "公有云小技巧": [
          {
            "type": "category",
            "label": "公有云小技巧",
            "items": [
              "solution/cloud/通过rancher创建eks使用alb-ingress"
            ]
          }
        ]
      },
      "tooluse": {
        "Kubernenetes组件异常排查": [
          {
            "type": "category",
            "label": "Kubernenetes组件异常排查",
            "items": [
              "tooluse/kubernetes/kubeletCPU使用率过高问题排查"
            ]
          }
        ]
      }
    },
    "metadata": {
      "categories": {
        "troubleshooting": {
          "Docker相关": "一些Docker相关问题的处理排查解决手册",
          "Kubernetes相关": "一些Kubernetes相关问题的处理排查解决手册",
          "操作系统相关": "一些因为操作系统引起的问题处理排查解决手册",
          "应用问题相关": "一些应用无法启动/重启/非正常运行的处理排查解决手册"
        },
        "solution": {
          "监控相关": "一些跟监控相关的解决方案手册",
          "公有云小技巧": "一些跟公有云相关的解决方案手册"
        },
        "tooluse": {
          "Kubernenetes组件异常排查": "一些跟Kubernetes组件异常排场相关的手册"
        }
      },
      "docs": {
        "troubleshooting": {
          "troubleshooting/Docker/大量runc不释放，导致节点负载高": "大量runc不释放，导致节点负载高",
          "troubleshooting/Kubernetes/etcd相关/etcd集群中超过一半以上的节点故障导致leader选主失败": "etcd集群中超过一半以上的节点故障导致leader选主失败",
          "troubleshooting/Kubernetes/etcd相关/磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障": "磁盘IOPS不足，etcd出现大量慢日志，导致K8S集群使用缓慢甚至组件故障",
          "troubleshooting/Kubernetes/存储相关/POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高": "POD使用性能低的NAS导致节点大量僵尸进程，系统负载虚高",
          "troubleshooting/OS/Kernel/unregister_netdevice: waiting for eth0 to become free 报错": "Centos默认3.10.x waiting for eth0 to become free 报错",
          "troubleshooting/OS/Kernel/内核arp_proxy参数配置不当导致Macvlan环路": "内核arp_proxy参数配置不当导致Macvlan环路",
          "troubleshooting/Kubernetes/Network相关/canal网络MTU值设置不合理性能测试丢包率高": "canal网络MTU值设置不合理性能测试丢包率高",
          "troubleshooting/Kubernetes/Network相关/Pod IP无法释放导致无法新建Workload": "Pod IP无法释放导致无法新建Workload",
          "troubleshooting/Kubernetes/Network相关/Pod内无法访问api-server": "Pod内无法访问api-server",
          "troubleshooting/Kubernetes/Network相关/双网卡网络Macvlan路由配置问题导致vxlan网卡访问丢包": "双网卡网络Macvlan路由配置问题导致vxlan网卡访问丢包",
          "troubleshooting/application/JAVA应用，内存超出后没有进行OOMKILL": "JAVA应用，内存超出Limit后没有进行OOMKILL"
        },
        "solution": {
          "solution/monitoring/Rancher-2.4.8-ent以上版本监控使用Nodeport暴露": "Rancher-2.4.8-ent以上版本监控使用Nodeport暴露",
          "solution/cloud/通过rancher创建eks使用alb-ingress": "通过rancher创建eks使用alb-ingress"
        },
        "tooluse": {
          "tooluse/kubernetes/kubeletCPU使用率过高问题排查": "kubeletCPU使用率过高问题排查"
        }
      }
    },
    "stable": "版本说明 - v2.4.7",
    "baseCommit": "9844eb315ee788efa011e5776b3dcba5b9411a10 - Sept 21, 2020",
    "k3sBaseCommit": "241066ade0d1800af1bd9781d0783973bfc2b01f - Nov 11, 2020"
  },
  "themeConfig": {
    "baiduAnalytics": {
      "trackingID": "692a488c8d0d137240f1a940bde32441"
    },
    "navbar": {
      "title": "Rancher",
      "logo": {
        "alt": "Rancher Logo",
        "src": "img/rancher-logo-cow-white.svg"
      },
      "links": [
        {
          "href": "https://docs.rancher.cn/",
          "label": "文档中心",
          "position": "left"
        },
        {
          "href": "https://www.rancher.cn/",
          "label": "中国官网",
          "position": "right"
        },
        {
          "href": "https://rancher.com/support-maintenance-terms/all-supported-versions/",
          "label": "支持矩阵",
          "position": "right"
        },
        {
          "href": "https://github.com/rancher/rancher",
          "label": "GitHub",
          "position": "right"
        }
      ]
    },
    "algolia": {
      "apiKey": "f790c2168867f49bb212aee8c224116d",
      "indexName": "rancher"
    },
    "footer": {
      "style": "dark",
      "copyright": "Copyright © 2021 Rancher Labs, Inc. All Rights Reserved."
    }
  },
  "title": "Rancher内部知识库",
  "tagline": "Run Kubernetes Everywhere",
  "baseUrl": "/",
  "url": "https://www.rancher.cn",
  "favicon": "img/favicon.ico",
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "sidebarPath": "/Users/zhen/Documents/doc-zhen/kuihua-ebook/sidebars.js",
          "editUrl": "https://github.com/cnrancher/docs-rancher2/edit/master/",
          "showLastUpdateAuthor": true,
          "showLastUpdateTime": true
        },
        "theme": {
          "customCss": "/Users/zhen/Documents/doc-zhen/kuihua-ebook/src/css/custom.css"
        }
      }
    ]
  ]
};