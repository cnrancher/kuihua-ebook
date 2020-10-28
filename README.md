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