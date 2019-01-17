/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/scene/Loading.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/scene
 * Created Date: Tuesday, September 25th 2018, 7:09:36 pm
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */

import { md5 } from "./../util/md5"
import { GamgeConstants } from "./../util/constants"
import { stringify } from "querystring";
import { format } from "util";
var SceneComponent = require("../scene/SceneComponent")
const { ccclass, property } = cc._decorator;
@ccclass
export default class Loading extends SceneComponent {

    @property(cc.Node)
    fb_button: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    sio: any;
    message: any;
    onLoad() {
        super.onLoad();
        if (cc.sys.isBrowser) {
            document.title = "Geekxiayu";
        }
        if (cc.sys.isMobile) {
            cc.find("Canvas").getComponent(cc.Canvas).fitHeight = false;
            cc.find("Canvas").getComponent(cc.Canvas).fitWidth = true;
        }
    }
    start() {
        this.addListeners();
    }
    onFbClick() {
        var deviceId = cc.sys.localStorage.getItem("deviceId");
        cc.log("deviceId====", deviceId);
        if (!deviceId) {
            var seed = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'];
            deviceId = "";
            for (let i = 0; i < 31; i++) {
                deviceId += seed[Math.floor(Math.random() * seed.length)];
            }
            cc.log("重新生成设备号:", deviceId);
            cc.sys.localStorage.setItem("deviceId", deviceId);
        }
        //cc.find("Canvas/logo").active = !cc.find("Canvas/logo").active;
        var host = GamgeConstants.httpHost;//"http://localhost:9002/login";
        var url = host + "/login"
        var time = Date.parse(new Date().toString()) / 1000//
        let params = {
            device_name: "iphoneX",
            device_os_version: "11.4",
            build: "399",
            lang: "CN",
            device_type: 2,
            device_id: deviceId || "01234567890123",
            ip: "192.168.1.1",
            game_id: 20101,
            application_id: "com.qiji.superdurak",
            application_version: "2.3.0",
            game_version: "2.3.0",
            user_id: "0",
            user_name: "nick" + cc.sys.now() % 10000000,
            mobileCountryCode: "",
            mobileNetworkCode: "",
            isoCountryCode: "",
            timestamp: time,
            channel: 10000,
            sign: md5("super->druak" + time),
            token: 0,
        }
        var data = ""
        for (var key in params) {
            data = data + "&" + key + "=" + params[key]
        }

        //cc.log("sign======>>>", params.sign, data)
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                var response = xhr.responseText;
                cc.log("登陆http回调=====", response);
                cc.UserModel.setUserInfo(JSON.parse(response));
                cc.NetManager.init(cc.UserModel.getUserInfo().serverUrl, function () {
                    cc.NetManager.connect(function (code) {
                        cc.log("连接socket code===", code);
                    });
                });
            } else {
                cc.log("xhr.status===", xhr.status);
            }
        };
        xhr.open("POST", url, true);
        xhr.send(JSON.stringify(params).replace(/%/g, '%25'));
    }
    onLoginSucc() {
        cc.Notification.off(GamgeConstants.EVENT_LOGIN_SUCC, this.onLoginSucc, this);
        cc.director.loadScene("hall");
    }
    onEnterRoom(data) {
        cc.log("进入房间----->>>", data);
        cc.director.loadScene("game")
    }
    addListeners() {
        this.fb_button.on(cc.Node.EventType.TOUCH_END, this.onFbClick, this);
        cc.Notification.on(GamgeConstants.EVENT_LOGIN_SUCC, this.onLoginSucc, this);
        cc.Notification.on(GamgeConstants.EVENT_ENTER_ROOM, this.onEnterRoom, this);
    }
    onDestroy() {
        cc.log(this.name, "==onDestroy==");
        cc.Notification.off(GamgeConstants.EVENT_ENTER_ROOM, this.onEnterRoom, this);
    }
    // update (dt) {}
}