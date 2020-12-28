kuihua-ebook
===========================
该仓库直接翻译成中文就是“葵花宝典”，顾名思义，该仓库中存放了包括但是不限于Rancher或者相关云原生的常见问题处理方法、奇巧淫技等等一系列的内容，在提交PR的时候，请遵循该仓库文档的创建规范、格式，并按照相关大类型文件夹分类，为了使葵花宝典完善，欢迎大家踊跃提交PR。

****

|作者|Rancher中国全体大佬|
|---|---

****

## 文档格式示范
所有文档都需要以Markdown文档上传，文档格式需要遵循《基本法》，以下为文档示例：

****

标题
---
|作者|作者姓名|
|---|---
|团队|作者团队
|编写时间|时间
|类型|文档类型

****
## 目录

---
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题


文本
------
### 普通文本
这是一段普通的文本
### 单行文本
    Hello,Rancher。
在一行开头加入1个Tab或者4个空格。
### 文本块
#### 语法1
在连续几行的文本开头加入1个Tab或者4个空格。

    欢迎到访
    很高兴见到您
    祝您，早上好，中午好，下午好，晚安


代码高亮
----------

### 语法
在三个反引号后面加上编程语言的名字，另起一行开始写代码，最后一行再加上三个反引号。

### 效果
```Java
public static void main(String[]args){} //Java
```
```c
int main(int argc, char *argv[]) //C
```
```Bash
echo "hello GitHub" #Bash
```
```javascript
document.getElementById("myH1").innerHTML="Welcome to my Homepage"; //javascipt
```
```cpp
string &operator+(const string& A,const string& B) //cpp
```

以上是部分规范要求，总之就是代码要用代码块，标题清楚，格式规范，清晰好看；

***

# 模版

# JAVA应用，内存超出后没有进行OOMKILL

|作者|万绍远|
|---|---
|团队|Filed&&Suppoort
|编写时间|2020/10/28
|类型|应用部署常见问题

---

## 问题现象
java应用上容器云后没有配置JVM MaxRAM，发现实际内存使用量早已超过配置的Limit限制制，但Kubernetes并没有oomkill掉这个应用

## 问题原因
首先Docker容器本质是是宿主机上的一个进程，与宿主机共享/proc目录，在容器内看到的/proc/meminfo，/proc/cpuinfo 与直接在宿主机上看到的一致，默认JVM的Max Heap Size是系统内存的1/4，这就导致此原因。

## 问题解决
新的Java版本（10及以上版本）已经内置了docker支持功能够读取到Kubernetes中配置的limit配置。对于旧版本jdk8的使用8u212或更新的版本即可。


---
## 图片怎么办？
emmmm.....图片是个问题，不过没关系，我们准备了专业的对象存储桶，具体操作方式如下：

    1、下载腾讯云对象存储客户端，[MAC下载](https://cosbrowser-1253960454.cos.ap-shanghai.myqcloud.com/releases/cosbrowser-2.3.1.dmg)，[Windows下载](https://cosbrowser-1253960454.cos.ap-shanghai.myqcloud.com/releases/cosbrowser-setup-2.3.1.exe)；
    2、使用以下API KEY进行登陆；
        1）SecretId: AKID95lTy84H6k9MK3JsKMCmAKSM1d2F2zf9
        2) SecretKey:PYdVAakgPuLiiU0FF1WkuugCRQBhzC9r
        3) 存储桶名称：rancher-support-1256858200


---

## 以上
感谢大家的贡献，这也是我们KB走上高大上道路的一条羊肠小道，另外请尊重别人的劳动成功，大佬整理的文档在没有经过大佬同意的情况下，禁止转载到私人博客上。感谢，鞠躬！

---

## 如何开发？

### 准备

确保您的开发环境有如下软件：

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) 10.9.0+ (with NPM)
* [Yarn](https://yarnpkg.com/en/docs/install) 1.5+

### 安装

如果yarn install的速度很慢，可以尝试配置淘宝Registry。

```bash
$ yarn config set registry https://registry.npm.taobao.org -g
```

安装初始化

```bash
$ git clone 'https://github.com/cnrancher/docs-rancher2'
$ cd 'docs-rancher2'
$ yarn install
```

### 本地启动

```bash
$ yarn start
```

将在浏览器中自动打开http://localhost:3000/

### 构建

```bash
$ yarn build
```



