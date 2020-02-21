### LiveDemoWeb

> sdk

sdk可在 src/lib 中替换，替换后需要在index.html中修改引入的sdk名称

> 参数说明

1. AppKey,AppSecret值可在 src/config.js 文件中修改
2. 登录时使用的服务器地址可以在 src/config.js 文件中修改（serverUrl）
3. 登录默认使用游客模式登录
4. demo使用时建议修改用户id，防止冲突。
5. 需要先点击【登录】之后再执行【查询直播间列表】操作
6. 查询列表时直播类型默认为[1,1]，可在src/config.j中修改值（liveTypes）
7. 直播间列表默认查询10条数据
8. 拉流播放器默认播放httpflv协议的流(playType=flv)，可支持hls(playType=hls)；rtmp协议需要将flash权限设置为允许,本地文件无法设置flash权限，当前demo无法进行播放
9. 可以在拉流地址的输入框中直接输入url进行拉流，支持flv和hls