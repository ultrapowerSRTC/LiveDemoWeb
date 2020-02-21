
let {WebSDK,Live,Player}  = window.WEBSDK;
let user = {},live = {},url = null;

function login() {

    let uccId = document.getElementById('uccId').value;
    let mqtt = document.getElementById('mqtt').checked;

    let appKey = Config.appKey
    let appSecret = Config.appSecret;
    let nonce = uccId;
    let curTime = (Date.parse(new Date())).toString();
    let checkSum = SHA1(appSecret+nonce+curTime);
    let type = Config.loginMode;

    WebSDK.init({
        onSuccess:(code,desc) => {},
        onFailure:(code,desc) => {}
    });

    WebSDK.setRootServerUrl(Config.serverUrl);

    if (mqtt){
       _mqtt();
    }

    WebSDK.login({
        appKey:appKey,
        uccId:uccId,
        type:type,
        nonce:nonce,
        token:uccId,
        curTime:curTime,
        checkSum:checkSum,
        onSuccess: (code,res) => {
            console.log('login success !!');
            user.uccId = uccId;
            alert('登录成功')
        },
        onFailure: (code,err) => {
            console.error('login failure !!',err);
        }
    });
}

function _loginStatus (){
    return WebSDK.loginStatus()
}

function searchList(){
    Live.getLiveRoomListByType({
        types:Config.liveTypes,
        limit:Config.liveListLimit,
        index:Config.liveListIndex,
        onSuccess:(code,data) => {
            console.log('searchList success !!',data);
            let parent = document.getElementById('live-list');
            let _innerHtml = '';
            if(data.length === 0){
                _innerHtml = '暂无直播间'
            }else{
                for(let item of data){
                    let d = JSON.stringify(item);
                    _innerHtml += `<div class="live-list-item"><span>直播间：`+item.name+`</span><button id="enterLive" onclick='enterLive(`+d+`)'>进入直播间</button></div>`;
                }
            }
            parent.innerHTML = _innerHtml;

        },
        onFailure: (code,res) => {
            console.error('searchList failure !!',res);
        }
    })
}

function enterLive(data){
    console.log(data);
    live = data;
    Live.setLivePlayerAuthParams(_setAuth)
    Player.initPlayer('player',Config.playType,url,(code,desc) => {
        if(code != 200) {
            console.error('Player init failure !', desc)
            return;
        }
        this._listen();
    })
    Live.enterLiveRoom({
        channelName:live.channelName,
        password:live.password,
        nickName:'张'+user.uccId,
        elementId:'player',
        playType:Config.playType,
        onSuccess:(code,data) => {
            console.log('enterLive success !!',data);

        },
        onFailure: (code,res) => {
            console.error('enterLive failure !!',res);
        }
    })
}

function startPlayer(){
    let inputUrl = document.getElementById('url').value;
    if(inputUrl){
        url = inputUrl;
    }
    if(!url || url.length === 0){
        console.error('url is null')
        return;
    }
    Player.initPlayer('player',Config.playType,url,(code,desc) => {
        if(code != 200) {
            console.error('Player init failure !', desc)
            return;
        }
        Player.startPlayer(url,(c,d) => {
            if(c != 200) {
                console.error('Player play failure !', d)
                return;
            }
        })
    })
}

function _mqtt(){
    WebSDK.setImmediatelyConnectMqtt(true);
    WebSDK.onMqttConnect((status,desc) => {
        console.log(status);
        switch (status) {
            case 101:
                console.log('Mqtt正在连接')
                break;
            case 1011:
                console.warn('Mqtt正在重连')
                break;
            case 1:
                console.log('Mqtt连接成功')
                break;
            case -1:
                console.error('Mqtt连接失败')
                break;
            case 102:
                console.log('Mqtt正在关闭连接')
                break;
            case 2:
                console.log('Mqtt关闭连接')
                break;
            case 3:
                console.warn('Mqtt被动断开连接')
                break;
            case 0:
                console.error('Mqtt在连接时出现异常：',desc)
                break;
        }
    })
}

function _setAuth (params){
    console.log('auth params:',params);
    //观众防盗链参数设置
    let timestamp = Date.parse(new Date())/1000;
    let txTime = new Number(timestamp).toString(16);
    //为了兼容不通版本（1.4.3以下版本没有入参params）
    if(params){
        let name = params.getStream();
        let txSecretStr = '01234567899876543210abcd'+name+txTime;
        let txSecret = hex_md5(txSecretStr);
        params.addParameters({key:'txTime',value:txTime})
        params.addParameters({key:'txSecret',value:txSecret})
    }else{
        let txSecretStr = '01234567899876543210abcd'+this.state.room.channelName+txTime;
        let txSecret = md5.hex_md5(txSecretStr);
        return {txTime:txTime,txSecret:txSecret}
    }
}

function _listen (){
    Live.onAudience('error',(res) => {
        console.error('发生异常错误',res);
    })
    Live.onAudience('live-status',(status,elementId) => {
        console.log('live status >>>> ',status);
        // 0：加载中  1：拉流成功  2：主播暂停  3：主播恢复  4：直播结束  5:重连中  6：重连成功    -1：资源加载较慢或主播端连接暂时断开  -2：拉流失败  -3：重连失败
        switch (status) {
            case 0:
                break;
            case 1:
                console.log('拉流成功');
                break;
            case -2:
                console.error('拉流失败');
                break;
            case 2:
                console.log('主播暂停直播');
                break;
            case 3:
                console.log('主播恢复直播');
                break;
            case 4:
                console.warn('主播结束直播');
                break;
            case 5:
                console.log('正在重连');
                break;
            case 6:
                console.log('重连成功');
                break;
            case -3:
                console.error('重连失败');
                break;
            case -1:
                console.warn('资源加载较慢或主播端连接暂时断开，请耐心等待......');
                break;

        }
    })
    Live.onAudience('net-status',(code) => {
        if(code == 0){
            console.error('网络异常，请检查网络状况');
        }else if(code == 1){
            console.log('网络已连接');
        }
    })
}


document.getElementById('login').onclick = login;
document.getElementById('searchList').onclick = searchList;
document.getElementById('startPlayer').onclick = startPlayer;
