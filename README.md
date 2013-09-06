Apple TV Media Explorer
=====


1. 升级您的 AppleTV 到最新版本固件。

2. 在设置中把区域改成香港（或美国），这样主页上你可以看到好些图标。

3. 劫持DNS，有两种方法，请任选其一：
1).如果您的路由器支持DNSMasQ，可以在路由器上配置DNS劫持（192.168.1.9 换成你的 HTTP 服务器的 IP 地址，IP 地址仅举例，自行替换）：

* address=/trailers.apple.com/192.168.1.9

如果想同时与TT服务器兼容（TT服务器强制写死了绑定预告片），则可以劫持Qello的图标：

* address=/atv.qello.com/192.168.1.9
* address=/trailers.apple.com/180.153.225.136

2).如果你不会弄DNS服务器，可以用我提供的，在AppleTV上设置DNS为117.41.182.103，这样的话http服务器地址必须是 192.168.1.9。

4. 搭建HTTP服务，确保 http://192.168.1.9 能访问；HTTP 弄好后，需要开启文件列表功能（dir listing），这样我们才能以让ATV把上面的媒体文件列出来播放。
1). Tomato 能用的lighttpd精简版可以从我这里自行提取：http://hdweb.googlecode.com/svn/ROUTER，已开启dir listing）
2). My Book Live 开启dir listing，参考TT的帖子：http://bbs.weiphone.com/read-htm-tid-5484774.html，其实可以改进一下，编辑 wdnas文件，里面var/www的-Indexes前面的减号去掉，全局都支持dir listing了，不用创建.htaccess文件了。
3). 其他NAS请自行想办法搭建http服务器。

5. 把附件下载下来，解压放到http服务器根目录下（注意是http://192.168.1.9/api-video，目录不要多了，也不要少了）。源代码在 https://github.com/Yonsm/ATVME 上，需要尝鲜的可以去哪里随时看看有什么更新。

6. 修改里面的index.xml文件，指向把url指向你的媒体文件的http url（能列出你的媒体文件的），目前index.xml是TAB页面，有5个版面：照片、视频、音乐、下载、设置。如果你也正好用我的文件路径（比如/media/Pictures）那就不用改了。注意每个URL最后的“/”是必须的，不要省略。

7. 打开ATV，进入“预告片”，把你的文件都列出来了。

0). 常规使用：视频、音乐直接点击播放，照片文件夹则以平铺方式呈现，支持幻灯片显示，非常完美。

1). 支持缩略图：如果有“文件或文件夹名称.thumb.jpg”（或“.thumb.文件或文件夹名称.jpg”）存在，则会自动用作缩略图。

2). 外挂SRT字幕：如果有“文件名.srt”存在（注意扩展名也需要，如“A.mp4.srt”），则会显示外挂字幕。

3). 支持连续播放：播放视频和音乐时如果按播放键（Play），完成后会自动播放下一个；如果按选择键（Select/Enter），则播放完成后不会自动播放下一个。

4). 显示简要信息：播放过程中按向上方向键两次，则会显示URL信息和播放列表剩余的项目数。（BTW：播放过程中按向下一次可以分段Seek，ATV内置的功能）。


更新历史：
  1.0  第一个实现版本。
  
  1.2  支持SRT外挂字幕和连续播放。
  
  1.3  支持文件夹优先显示；缩略图url不再要求前置。
  
  2.0 支持TT的MKV播放方案，支持自动生成缩略图（需要ffmpeg最新版，需要开启任意目录cgi支持，步骤稍复杂，教程后面再整理），代码在SVN上。

2013.08.12 跟进 WSJ Live 失效，改成劫持预告片。

持续更新中，详细步骤和说明请移步看2楼的详细帖子。：http://bbs.weiphone.com/read-htm-tid-5460032.html

*** 注意，目前ATV的在线内容入口已经全部改成HTTPS，自己必须搭建HTTPS服务器，伪造证书，然后用 iPhone Configuration Utility 写入为看的证书到 ATV 上，才能正常劫持进入了。
