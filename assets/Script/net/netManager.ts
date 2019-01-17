import { LayerFactory } from "../layer/LayerFactory";
import { GamgeConstants } from "../util/constants";

/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/net/netManager.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/net
 * Created Date: Friday, November 9th 2018, 5:34:41 pm
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */
var loginMessage;
var loginResMessage;
var playerMessage;
var roomMessage;
var enterRoomMsg;
var enterRoomResMsg
var roomStatusEnum;
var playerStatusEnum;
var PlayersChangeMsg;
var ActionMsg;
var ActionEnum;
cc.NetManager = {
    //初始化消息
    init: function (url, callback) {
        let context = this;
        context.url = url;
        if (cc.sys.isNative) {
            jsb.fileUtils.addSearchPath("res/raw-assets/resources", true);//坑太多了。。没办法
        }
        var protobufHere = protobuf;////导入为插件，直接使用 
        var total = 2;
        var done = 0;
        var tryDone = function () {
            done += 1;
            if (done >= total) {
                context.inited = true;
                callback && callback(0);
            }
        }
        var filename = "Lobby";
        protobufHere.load(filename, function (err, root) {//Data/PbLobby.proto
            if (err) {
                throw err;
            }
            for (var i in root) {
                //cc.log("root." + i + "=" + root[i]);
            }
            loginMessage = root.lookupType("PbLobby.LoginHall");
            loginResMessage = root.lookupType("PbLobby.LoginRes");
            tryDone();
        });
        var filename = "Game";
        protobufHere.load(filename, function (err, root) {//Data/game.proto
            if (err) {
                throw err;
                return;
            }
            for (var i in root) {
                //cc.log("root." + i + "=" + root[i]);
            }
            playerMessage = root.lookupType("PbGame.Player");
            roomMessage = root.lookupType("PbGame.RoomInfo");
            enterRoomMsg = root.lookupType("PbGame.EnterReq");
            enterRoomResMsg = root.lookupType("PbGame.EnterRes");
            roomStatusEnum = root.lookupEnum("PbGame.RoomStatus").values;
            playerStatusEnum = root.lookupEnum("PbGame.PlayerStatus").values;
            PlayersChangeMsg = root.lookupType("PbGame.PlayersChange");
            ActionMsg = root.lookupType("PbGame.Action");
            ActionEnum = root.lookupEnum("PbGame.ActionEnum").values;
            tryDone();
        });
    },
    connect: function (callback) {
        let context = this;
        var callbackConnect = function () {
            callback && callback(0);
            context.isConected = true;
            cc.NetManager.send("loginHall", { userId: cc.UserModel.getUserInfo().userId });
        }
        if (context.isConected) {
            callbackConnect();
            return;
        }
        context.retry = true;
        let url = context.url;
        //context.url = "wss://www.geekxiayu.top:9001";//"wss://localhost:9001";
        //create a client by using this static method, url does not need to contain the protocol
        cc.log("NetManager.connect----->>", url);
        var sioclient = io.connect(url, {//www.geekxiayu.top
            "force new connection": false,
            "reconnect": false,
            //'reconnection delay': 200,
            //'max reconnection attempts': 15
        });
        //cc.log("sioclient===========>", sioclient)
        this.sio = sioclient;
        sioclient.binaryType = 'arraybuffer';
        //register event callbacks
        //this is an example of a handler declared inline
        sioclient.on("connect", function () {
            cc.log("连接成功==============>");
            callbackConnect();
            var tips = cc.director.getScene().getChildByName("reconnectTips");
            if (tips) {
                cc.director.getScene().removeChild(tips);
            }
        });
        sioclient.on("reconnect", function () {
            cc.log("重连成功==============>");
        });
        //example of a handler that is shared between multiple clients
        sioclient.on("c_hi", function (data) {
            var b = data.replace(/"/g, '').split(',');
            //var msg = context.message.decode(b);
            //cc.log("c_hi==============>>>", `message = ${JSON.stringify(msg)}`);
            //cc.director.loadScene("home")
        });
        sioclient.on("error", function (msg) {
            cc.log("sioclient error=====>>>>>", msg);
        });
        sioclient.on("disconnect", function () {
            cc.log("sioclient disconnect=====>>>>>");
            callback && callback(-1);
            context.isConected = false;
            if (context.retry && !cc.director.getScene().getChildByName("reconnectTips")) {
                var node = new cc.Node("reconnectTips");
                node.setPosition(360, 1160);
                var text = node.addComponent(cc.Label);
                text.string = "正在重连....";
                node.parent = cc.director.getScene();
            }
            if (context.retry) {
                setTimeout(function () {
                    cc.NetManager.connect();
                }, 3000)
            }
        });
        sioclient.on("otherLogin", function (data) {
            cc.log("帐号在其它地方登陆----", context.timeOut);
            context.retry = false;
            sioclient.disconnect();
            LayerFactory.CreateAlertDialog({
                content: data, pos: cc.v2(0, 0), callback: function () {
                    cc.director.loadScene("loading")
                }
            })
        });
        sioclient.on("loginHall", function (data) {
            //cc.log("登陆大厅--.....", data);
            var b = data.replace(/"/g, '').split(',');
            var msg = loginResMessage.decode(b);
            cc.log("登陆大厅回调==============>>>", `message = ${JSON.stringify(msg)}`);
            if (msg.code === 0) {
                cc.Notification.emit(GamgeConstants.EVENT_LOGIN_SUCC);
            } else if (msg.code > 0) {
                cc.NetManager.send("enterRoom", { userId: cc.UserModel.getUserInfo().userId, roomId: msg.code });
            }
        });
        sioclient.on("enterRoom", function (data) {
            var b = data.replace(/"/g, '').split(',');
            var msg = enterRoomResMsg.decode(b);
            cc.log("进入房间回调==============>>>", `message = ${JSON.stringify(msg)}`);
            cc.UserModel.setRoomInfo(msg.info);
            cc.Notification.emit(GamgeConstants.EVENT_ENTER_ROOM, msg.info);
        });
        //
        sioclient.on("playersChange", function (data) {
            var b = data.replace(/"/g, '').split(',');
            var msg = PlayersChangeMsg.decode(b);
            cc.log("桌子玩家信息更新==============>>>", `message = ${JSON.stringify(msg)}`);
            cc.Notification.emit(GamgeConstants.EVENT_PLAYER_CHANGE, msg.players);
        });
        sioclient.on("action", function (data) {
            var b = data.replace(/"/g, '').split(',');
            var msg = ActionMsg.decode(b);
            cc.log("玩家操作==============>>>", `message = ${JSON.stringify(msg)}`);
            cc.Notification.emit(GamgeConstants.EVENT_ACTION, msg);
        });
        //
        sioclient.on("roomStatus", function (data) {
            var b = data.replace(/"/g, '').split(',');
            var msg = roomMessage.decode(b);
            cc.UserModel.setRoomInfo(msg);
            cc.log("房间状态更新==============>>>", `message = ${JSON.stringify(msg)}`);
            if (msg.status === roomStatusEnum.PLAYING) {
                cc.log("通知发牌==============>>>");
                cc.Notification.emit(GamgeConstants.EVENT_SENDCARD, msg.players);
            }
        });
    },
    send: function (what, msg) {
        let context = this;
        //var time = Date.parse(new Date().toString()) / 1000;
        // var payload = { userId: UserModel.info.userId || 0 };
        //cc.log(`payload = ${JSON.stringify(payload)}`);
        //检查数据格式，测试了下发现没什么卵用
        // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
        // var errMsg = Test1Message.verify(payload);
        // if (errMsg){
        //     cc.log("errMsg = "+errMsg);
        //     throw Error(errMsg);
        // }
        var mMessage;
        var payload = msg;
        switch (what) {
            case "loginHall":
                mMessage = loginMessage;
                break;
            case "enterRoom":
                mMessage = enterRoomMsg;
                break;
            case "action":
                mMessage = ActionMsg;
                break;
            default: break;
        }
        if (!mMessage) {
            cc.log("消息未初始化")
            return;
        }
        // Create a new message
        // cc.log("context.message===", mMessage);
        var message = mMessage.create(payload); // or use .fromObject if conversion is necessary
        cc.log(`message = ${JSON.stringify(message)}`);
        // Encode a message to an Uint8Array (browser) or Buffer (node)
        var buffer = mMessage.encode(message).finish();
        //cc.log("buffer1 = " + buffer);
        //cc.log(`buffer2 = ${Array.prototype.toString.call(buffer)}`);
        // ... do something with buffer
        context.sio.emit(what, buffer.toString());
    }
};