import { GamgeConstants } from "../util/constants";
import { dump } from "../util/common";
import assert = require("assert");
// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
const enum RoomStatus {
    INVALID = -1,//无效
    FREE = 0,//空闲，未开始
    WAITBEGIN = 1,//等待开始，人数够了倒计时
    PLAYING = 2,//正在游戏
    HANDLER = 3,//摆牌,闲家 庄家都摆好之后 方可操作。
    SHOW = 4,//比牌阶段,全部摆好庄家开始比牌
    SETTLEMENT = 5//结算
}
const enum ActionEnum {
    HANDLER = 0,//摆牌--求和
    BLINK = 1,//盖牌
    FORCE = 2,//强攻
    FOLD = 3,//投降
    REJECT = 4,//不喝
    BANKER_HANDLER = 5,//庄家求和
    BANKER_BLINK = 6,//庄家看盖牌
    BANKER_FORCE = 7,//庄家看强攻
    BANKER_FOLD = 8,//庄家不看盖牌
    SHOW = 9,//庄家亮牌
}
const enum PlayerStatus {
    INVALID = 0,//无效
    OFFLINE = 1,//掉线
    LOGINING = 2,//登陆中
    ONLINE = 4,//在线
    SITTING = 8,//坐下
    PLAYING = 16,//游戏中
    HANDLER = 32,//摆牌--求和
    BLINK = 64,//盖牌
    FORCE = 128,//强攻
    FOLD = 256,//投降
    REJECT = 512,//不喝
    SHOW = 1024,//亮牌，庄家可看 如果游戏结束 闲家也可看。 或者盖牌被庄家开。
}
var SceneComponent = require("../scene/SceneComponent")
@ccclass
export default class NewClass extends SceneComponent {

    @property(cc.Label)
    label: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:
    @property(Array)
    chairCamponents: any = new Array(4);
    @property(cc.Node)
    handler: cc.Node = null;
    roomInfo: any;
    players: any;
    tempTarget: any;
    chairMap: any = new Array(4);
    @property(cc.Node)
    actionBar: cc.Node = null;
    @property(cc.Node)
    bankerBar: cc.Node = null;
    @property(cc.Node)
    banker_handler: cc.Node = null;
    @property(cc.Node)
    blink: cc.Node = null;
    @property(cc.Node)
    force: cc.Node = null;
    @property(cc.Node)
    fold: cc.Node = null;
    @property(cc.Node)
    reject: cc.Node = null;
    @property(cc.Node)
    cancel: cc.Node = null;
    @property(cc.Label)
    rejectLabel: cc.Label = null;
    @property(cc.Label)
    cancelLabel: cc.Label = null;
    onLoad() {
        super.onLoad();
        this.handler.active = false;
        this.actionBar.active = false;
        this.bankerBar.active = false;
        this.handler.on(cc.Node.EventType.TOUCH_END, this.onHandler, this);
        this.banker_handler.on(cc.Node.EventType.TOUCH_END, this.onBankerHandler, this);
        this.blink.on(cc.Node.EventType.TOUCH_END, this.onBlink, this);
        this.force.on(cc.Node.EventType.TOUCH_END, this.onForce, this);
        this.fold.on(cc.Node.EventType.TOUCH_END, this.onFold, this);
        this.cancel.on(cc.Node.EventType.TOUCH_END, this.onCancel, this);
        this.reject.on(cc.Node.EventType.TOUCH_END, this.onReject, this);
    }
    start() {
        var self = this;
        self.players = [];
        self.roomInfo = cc.UserModel.getRoomInfo();
        for (let i = 0; i < self.roomInfo.players.length; i++) {
            var element = Object.create(self.roomInfo.players[i]);
            self.players[i] = element;
        }
        cc.loader.loadRes("ChairLayer", function (err, prefab) {
            if (err) { cc.log('初始化ChairLayer失败!, ' + err); return; }
            if (!(prefab instanceof cc.Prefab)) { cc.log('加載資源成功, 但該對象不是Prefab'); return; }
            for (let i = 0; i < 4; i++) {
                var chair = cc.instantiate(prefab);
                self.node.addChild(chair);
                var camponent = chair.getComponent("ChairLayer");
                //camponent.resetPos({ relateId: i },true);
                self.players[i].relateId = i;
                camponent.initView(self.players[i]);
                self.chairCamponents[i] = camponent;
                self.chairMap[i] = i;
            }
            self.onPlayersChange(self.players);
            /*dialog.getChildByName("bg").getChildByName("content").getComponent(cc.RichText).string = params.content;
            dialog.setPosition(cc.v2(0, 0));
            var camponent = dialog.getComponent("AlertDialog");
            camponent.callback = function () {
                params.callback && params.callback();
            }*/
        });
        cc.Notification.on(GamgeConstants.EVENT_PLAYER_CHANGE, this.onPlayersChange, this);
        cc.Notification.on(GamgeConstants.EVENT_SENDCARD, this.onSendCard, this);
        cc.Notification.on(GamgeConstants.EVENT_ACTION, this.onActionUpdate, this);
    }
    getMychairId = function (userId?) {
        var id = userId ? userId : cc.UserModel.getUserInfo().userId;
        for (let i = 0; i < this.chairCamponents.length; i++) {
            const element = this.chairCamponents[i];
            if (element.userInfo && element.userInfo.userId === id) {
                return this.players.indexOf(element.userInfo);
            }
        }
        return -1;
    }
    onPlayerClick(player) {
        ///
        cc.log("this.isBanker()==", this.isBanker(), "this.getRoomStatus()===", this.getRoomStatus(), player.userId, cc.UserModel.getUserInfo().userId
            , player.status & PlayerStatus.HANDLER);
        var b = (!this.isBanker()) || this.getRoomStatus() !== RoomStatus.SHOW || player.userId === cc.UserModel.getUserInfo().userId ||
            !(player.status & PlayerStatus.HANDLER) //|| (player.status & PlayerStatus.SHOW)
        if (b) return;

        if (player.status & PlayerStatus.BLINK) {
            this.tempTarget = player;
            this.rejectLabel.string = '开牌';
            this.cancelLabel.string = '不开';
            this.bankerBar.active = true;
        } else if (player.status & PlayerStatus.HANDLER) {
            this.tempTarget = player;
            this.rejectLabel.string = '喝酒';
            this.cancelLabel.string = '走水';
            this.bankerBar.active = true;
        }
    }
    onPlayersChange(players) {
        var self = this;
        cc.log("game----onPlayersChange");
        self.players = [];
        var preRelateId = -1;
        for (let i = 0; i < self.chairCamponents.length; i++) {
            var element = self.chairCamponents[i];
            self.players[i] = players[i]
            self.players[i]['relateId'] = self.chairMap[i];
            self.players[i]['chairId'] = i;
            cc.log("self.players[i].userId====", self.players[i].userId, "cc.UserModel.getUserInfo().userId===", cc.UserModel.getUserInfo().userId);
            if (self.players[i] && self.players[i].userId === cc.UserModel.getUserInfo().userId && self.players[i]['relateId'] !== 0) {//本人相对位置不是0 需要转换。
                preRelateId = i;
            }
            element.initView(self.players[i]);
            element.nickName.node.off(cc.Node.EventType.TOUCH_END);
            element.nickName.node.on(cc.Node.EventType.TOUCH_END, function () {
                self.onPlayerClick(self.players[i]);
            });
        }
        if (preRelateId > -1) {
            for (let i = 0; i < self.players.length; i++) {
                const element = self.players[i];
                if (element.relateId == preRelateId) {
                    element.relateId = 0;
                } else if (element.relateId > preRelateId) {
                    element.relateId = element.relateId - preRelateId
                } else if (element.relateId < preRelateId) {
                    element.relateId = element.relateId - preRelateId + self.players.length
                }
                self.chairMap[i] = element.relateId//chairId与relateId映射
                var view = self.chairCamponents[i];
                view.resetPos(self.players[i], true);
            }
        }
    }
    isBanker(userId?) {
        var id = userId ? userId : cc.UserModel.getUserInfo().userId;
        this.roomInfo = cc.UserModel.getRoomInfo();
        return (this.roomInfo.banker === this.getMychairId(id));
    }
    getRoomStatus() {
        this.roomInfo = cc.UserModel.getRoomInfo();
        return this.roomInfo.status;
    }
    onSendCard() {
        cc.log("game onSendCard()=======");
        for (let i = 0; i < this.chairCamponents.length; i++) {
            const element = this.chairCamponents[i];
            if (element.userInfo && element.userInfo.cards && element.userInfo.cards.length > 0) {
                cc.log("发牌=======");
                element.sendCards();
            }
        }
        if (this.isBanker()) {
            this.handler.active = true;
        } else {
            this.actionBar.active = true;
        }
    }
    //摆好牌,发给服务器。
    SendAction(type, target?) {
        cc.log("SendAction(type, target?)", target && target.userId);
        cc.NetManager.send("action", {
            type: type,
            reqId: cc.UserModel.getUserInfo().userId,
            targetId: target ? target.userId : this.players[this.roomInfo.banker].userId,
            player: this.players[this.getMychairId()],
        });
        this.actionBar.active = false;
        this.bankerBar.active = false;
        this.tempTarget = null;
    }
    onHandler() {//庄家摆牌
        this.SendAction(ActionEnum.HANDLER, cc.UserModel.getUserInfo().userId);
        this.handler.active = false;
    }
    onBankerHandler() {
        this.SendAction(ActionEnum.HANDLER);
    }
    onBlink() {
        this.SendAction(ActionEnum.BLINK);
    }
    onForce() {
        this.SendAction(ActionEnum.FORCE);
    }
    onFold() {
        this.SendAction(ActionEnum.FOLD);
    }
    onCancel() {//喝 走  走水 不开
        if (!this.isBanker()) {
            switch (this.cancelLabel.string) {
                case '走':
                    this.SendAction(ActionEnum.BANKER_HANDLER);
                    break;
                case '喝':
                    this.SendAction(ActionEnum.BANKER_FOLD);
                    break;
            }
        }
        //zhuang
        if (this.isBanker()) {
            assert(this.tempTarget, '目标不存在');
            switch (this.cancelLabel.string) {
                case '走水':
                    this.SendAction(ActionEnum.BANKER_HANDLER, this.tempTarget);
                    break;
                case '不开':
                    this.SendAction(ActionEnum.BANKER_FOLD, this.tempTarget);
                    break;
            }
        }

    }
    onReject() {//不喝 不走  喝酒 开牌
        if (!this.isBanker()) {
            switch (this.rejectLabel.string) {
                case '不走':
                    this.SendAction(ActionEnum.BANKER_FORCE);
                    break;
                case '不喝':
                    this.SendAction(ActionEnum.REJECT);
                    break;
            }
        }
        //zhuang
        if (this.isBanker()) {
            assert(this.tempTarget, '目标不存在');
            switch (this.rejectLabel.string) {
                case '喝酒':
                    this.SendAction(ActionEnum.BANKER_FORCE, this.tempTarget);
                    break;
                case '开牌':
                    this.SendAction(ActionEnum.BANKER_BLINK, this.tempTarget);
                    break;
            }
        }
    }
    onActionUpdate(msg) {
        var idx = this.getMychairId(msg.reqId);
        cc.log("onActionUpdate====", msg.type, msg.reqId, idx)
        var element = this.chairCamponents[idx]
        assert(element, 'onActionUpdate element is null!');
        switch (msg.type) {
            case ActionEnum.HANDLER:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('求和');
                }
                break;
            case ActionEnum.FORCE:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('强攻');
                }
                break;
            case ActionEnum.BLINK:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('盖牌');
                }
                break;
            case ActionEnum.FOLD:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('弃牌');
                }
                break;
            case ActionEnum.BANKER_HANDLER:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('走');
                } else {
                    element.showMessage('走水');
                }
                break;
            case ActionEnum.BANKER_BLINK:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('不喝');
                } else {
                    element.showMessage('开牌');
                }
                break;
            case ActionEnum.BANKER_FORCE:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('不走');
                } else {
                    element.showMessage('喝酒');
                }
                break;
            case ActionEnum.BANKER_FOLD:
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('喝');
                } else {
                    element.showMessage('不开');
                }
                break;
            case ActionEnum.REJECT://喝酒不服
                if (!this.isBanker(msg.reqId)) {
                    element.showMessage('不喝');
                }
                break;
            default: break;
        }
        if ((!this.isBanker()) && this.getRoomStatus() === RoomStatus.SHOW && msg.targetId === cc.UserModel.getUserInfo().userId) {//目标是自己 需要弹按钮 选择操作。
            if (msg.type === ActionEnum.BANKER_HANDLER) {//庄家 喊闲家走水
                this.rejectLabel.string = '不走';
                this.cancelLabel.string = '走';
                this.bankerBar.active = true;
            } else if (msg.type === ActionEnum.BANKER_FORCE) {//庄家 喊闲家喝酒
                this.rejectLabel.string = '不喝';
                this.cancelLabel.string = '喝';
                this.bankerBar.active = true;
            } else if (msg.type === ActionEnum.BANKER_BLINK) {

            } else if (msg.type === ActionEnum.BANKER_FOLD) {

            }
        }
    }
    onDestroy() {
        cc.Notification.off(GamgeConstants.EVENT_PLAYER_CHANGE, this.onPlayersChange, this);
        cc.Notification.off(GamgeConstants.EVENT_SENDCARD, this.onSendCard, this);
        cc.Notification.off(GamgeConstants.EVENT_ACTION, this.onActionUpdate, this);
    }
    // update (dt) {}
}
