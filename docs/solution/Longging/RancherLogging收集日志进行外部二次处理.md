*Copyright  2020, [Rancher Labs (CN)](https://www.rancher.cn/). All Rights Reserved.*

|作者|袁振|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/19
|类型|日志解决方案

---


# 概述
&nbsp; &nbsp;在Rancher中可以很方便的使用内置的Logging功能对接Elasticsearch进行日志采集，但是在某些场景下，需要仅开启集群级别的监控，开启集群级别的日志后会采集所有项目中的应用日志并发送到下游，如果存在不需要采集日志的应用或者其他场景下不想采集部分的应用，这个时候Rancher Logging在产品设计上考虑到性能关系，默认不支持修改Fluentd中的filter配置。如果有这样的需求，可以参考这篇文章使用外部Fluentd进行不需要日志的过滤，然后发送到Elasticsearch。

<br/>

# 阅读本文前提条件
>* 对Rancher Logging功能有一定了解；
>* 对Fluentd的配置和使用有一定了解；
>* 对Elasticsearch和Kibana使用有一定了解；

<br/>

# 架构流程图
![avater](https://zknow-1256858200.cos.ap-guangzhou.myqcloud.com/%E6%96%87%E7%AB%A0%E5%9B%BE%E7%89%87/Logging/Logging001.jpg)

<br/>

&nbsp; &nbsp;Rancher Logging进行整个Kubernetes集群的日志采集，然后发送到集群外部或者是单独的Fluentd上，集群外部或者是单独的Fluentd做二次处理，匹配字段和日志过滤，然后发送到Elasticsearch中；

<br/>

# 正文内容
## 外部Fluentd的部署
>* 部署以Ubuntu为例，更多部署文档，[点击查看官方文档](https://www.fluentd.org/download);

* 执行下面命令，在Ubuntu Xenial上安装td-agent
```
命令：
$ sudo curl -L https://toolbelt.treasuredata.com/sh/install-ubuntu-xenial-td-agent3.sh | sh
```

>* 关于td-agent：
>>* Fluentd是由Ruby编写的，性能部分还有部分的C代码，某些情况下可能难以初始化环境信息，因此提供td-agent，td-agent自带了Ruby运行环境,[点击查看td-agent与Fluentd的区别](https://www.fluentd.org/faqs)；

* 部署完成后，td-agent配置文件在/etc/td-agent/td-agent.conf;

<br/>

## 插件安装
* 由于过滤和格式化Kubernetes日志，需要安装两个插件，命令如下：
```shell
$ sudo /usr/sbin/td-agent-gem install fluent-plugin-kubernetes_metadata_filter

$ sudo /usr/sbin/td-agent-gem install fluent-plugin-multi-format-parser
```

## 编辑td-agent.conf配置文件

* 配置文件主要由几部分组成，下面将分析配置文件的每个部分；
>* 注意，这里的配置文件只提供了处理Rancher Logging发出来的日志，并进行了过滤，如果由其他高级配置，请参考Fluentd官方文档；

<br/>

### source输入源配置
```xml
##配置24224端口上监听tcp类型的数据流

<source>
  @type forward  
  port 24224     
  bind 0.0.0.0   
</source>
```
### 消息格式化Kubernetes_metadata--[Kubernetes_metadata插件介绍](https://github.com/fabric8io/fluent-plugin-kubernetes_metadata_filter)
```xml
<filter  cluster.**>          
  @type  kubernetes_metadata   
</filter>
```

### 格式化日志流--[record_transformer插件介绍](https://docs.fluentd.org/filter/record_transformer)
```xml
<filter cluster.**>
  @type record_transformer
  <record>
    tag ${tag}
    log_type k8s_normal_container 
  </record>
</filter>
```

### 配置收集Prometheus日志流--[Prometheus日志收集介绍](https://docs.fluentd.org/deployment/monitoring-prometheus)
```xml
<filter cluster.**>
  @type prometheus
  <metric>
    name fluentd_input_status_num_records_total
    type counter
    desc The total number of incoming records
    <labels>
      tag ${tag}
      hostname ${hostname}
    </labels>
  </metric>
</filter>
```


### 对日志进行json格式化-[parser插件介绍](https://docs.fluentd.org/filter/parser)
```xml
<filter cluster.**>
  @type parser
  <parse>
    @type multi_format
    <pattern>
      format json
    </pattern>
    <pattern>
      format none
    </pattern>
  </parse>
  key_name log
  reserve_data true
</filter>
```

### 对日志进行过滤
>* 这里使用grep插件进行过滤，排除了系统namespaces字段下的日志，和kubernetes.container_name字段为apache-001的日志
>>* 这里可以使用正则匹配的方式进行过滤，并且支持表达式or/and，[点击查看详细说明](https://docs.fluentd.org/filter/grep#less-than-and-greater-than-directive)

```xml
<filter cluster.** cluster-custom.** rke.**>
  @type grep
  <and>
    <exclude> 
      key $.kubernetes.namespace_name 
      pattern ^cattle-logging$|^cattle-prometheus$|^cattle-system$|^ingress-nginx$|^istio-system$|^kube-node-lease$|^kube-public$|^kube-system$ 
    </exclude>
    <exclude>
      key $.kubernetes.container_name
      pattern ^apache-001$
    </exclude>
  </and>
</filter>
```

### 日志输出到Elasticsearch
```xml
<match cluster.** cluster-custom.** rke.**>
    @type elasticsearch
    host xx.xx.xx.xx           ##elasticsearch地址
    port xxxx                    ##elasticsearch端口
    request_timeout    30s
    index_name cluster-log-01     ##索引名称
</match>
```

### 启动td-agent
```
命令：
$ sudo /etc/init.d/td-agent start
```
>* 如果启动错误，td-agent错误日志默认在/var/log/td-agent/td-agent.log

## Rancher Logging对接
* 使用Rancher Logging对接外部Fluentd即可完成外部日志过滤并发送到elasticsearch

* 在集群中 --> 工具 --> 日志中选择Fluentd，输入外部Fluentd地址，保存即可；
![avater](https://zknow-1256858200.cos.ap-guangzhou.myqcloud.com/%E6%96%87%E7%AB%A0%E5%9B%BE%E7%89%87/Logging/Logging002.jpg)

# 外部Fluentd完整示例配置文件
```xml
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<filter  cluster.**>
  @type  kubernetes_metadata
</filter>

<filter cluster.**>
  @type record_transformer
  <record>
    tag ${tag}
    log_type k8s_normal_container 
  </record>
</filter>

<filter cluster.**>
  @type prometheus
  <metric>
    name fluentd_input_status_num_records_total
    type counter
    desc The total number of incoming records
    <labels>
      tag ${tag}
      hostname ${hostname}
    </labels>
  </metric>
</filter>

<filter cluster.**>
  @type parser
  <parse>
    @type multi_format
    <pattern>
      format json
    </pattern>
    <pattern>
      format none
    </pattern>
  </parse>
  key_name log
  reserve_data true
</filter>


<filter cluster.** cluster-custom.** rke.**>
  @type grep
  <and>
    <exclude>
      key $.kubernetes.namespace_name
      pattern ^cattle-logging$|^cattle-prometheus$|^cattle-system$|^ingress-nginx$|^istio-system$|^kube-node-lease$|^kube-public$|^kube-system$
    </exclude>
    <exclude>
      key $.kubernetes.container_name
      pattern ^apache-001$
    </exclude>
  </and>
</filter>

<match cluster.** cluster-custom.** rke.**>
    @type elasticsearch
    host xxx.xxx.xxx.xxx
    port xxxx
    request_timeout    30s
    index_name cluster-log-01
</match>
```

# 总结

&nbsp; &nbsp; 以上就是RancherLogging收集的日志使用外部Fluentd进行二次过滤、格式化、发送的全部过程。以上配置很多是默认配置，通过这样的流程，还可以更深入的自定义收集的日志内容。通过Rancher Logging可以免除配置收集集群、应用日志的繁琐配置。简化配置方法；
