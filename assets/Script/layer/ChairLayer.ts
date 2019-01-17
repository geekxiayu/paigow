import { dump } from "../util/common";
import { stringify } from "querystring";
import { format } from "util";

/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/layer/ChairLayer.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/layer
 * Created Date: Thursday, November 15th 2018, 11:02:47 am
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChairLayer extends cc.Component {

    @property(cc.Label)
    nickName: cc.Label = null;
    @property(cc.Node)
    icon: cc.Node = null;
    @property(cc.Node)
    action: cc.Node = null;
    @property(cc.Label)
    msg: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:
    @property(cc.Node)
    waitImg: cc.Node = null;
    @property
    userInfo: any = null;
    pokers: any = new Array(4);
    nodePos = [{ x: 0, y: 140 - cc.winSize.height / 2 }, { x: 240, y: 0 }, { x: 0, y: cc.winSize.height / 2 - 140 }, { x: -240, y: 0 }];
    pokerPos = [{ x: -60, y: 0 }, { x: -20, y: 0 }, { x: 20, y: 0 }, { x: 60, y: 0 }];
    minePos = [{ x: -156, y: 0 }, { x: -52, y: 0 }, { x: 52, y: 0 }, { x: 156, y: 0 }];
    pokerRects: any = new Array(4);
    onLoad() {
        var self = this;
    }

    start() {

    }
    initView(player: any) {
        this.userInfo = player || {};
        var relateId = this.userInfo.relateId || 0;
        cc.log("initView===", player.nickName, player.relateId);
        this.node.setPosition(this.nodePos[relateId].x, this.nodePos[relateId].y);
        this.nickName.string = player.nickName || "";
    }
    //转动位置 使自己处于 相对位置 0
    resetPos(player: any, anim) {
        this.userInfo = player || {};
        var relateId = this.userInfo.relateId || 0;
        //cc.log("cy=====", this.nodePos[this.relateId].y);
        if (anim) {
            this.node.runAction(cc.moveTo(0.5, this.nodePos[relateId].x, this.nodePos[relateId].y));
        }
    }
    sendCards() {
        var self = this;
        var cards = this.userInfo.cards || [];
        if (cards.length <= 0) return cc.log("玩家没牌---");

        cc.loader.loadRes("Poker", cc.SpriteAtlas, function (err, atlas) {
            if (err) { cc.log('加载card失败!, ' + err); return; }
            for (let i = 0; i < cards.length; i++) {
                var num = parseInt(cards[i]).toString(16);
                if (num.length < 2) num = "0" + num;
                var img = "Poker_" + num;
                var x = self.pokerPos[i].x;
                var y = self.pokerPos[i].y;
                if (self.isMe()) {
                    x = self.minePos[i].x;
                    y = self.minePos[i].y;
                }
                var fram = atlas.getSpriteFrame(img);
                var poker = self.pokers[i];
                if (!poker) {
                    poker = new cc.Node();
                    self.node.addChild(poker);
                    poker.setPosition(x, y);
                    poker.addComponent(cc.Sprite);
                }
                poker.getComponent(cc.Sprite).spriteFrame = fram;
                self.pokers[i] = poker;
                //poker.tag = parseInt(cards[i]);
                cc.log("====zindx=======", i, poker.zIndex);
                if (self.isMe()) {
                    poker.name = cards[i] + '';
                    self.pokerRects[i] = poker.getBoundingBoxToWorld();
                    self.pokers[i].on(cc.Node.EventType.TOUCH_START, self.onPokerStart, self);
                    self.pokers[i].on(cc.Node.EventType.TOUCH_MOVE, self.onPokerMove, self);
                    self.pokers[i].on(cc.Node.EventType.TOUCH_END, self.onPokerEnd, self);
                }
            }
        });
    }
    onPokerStart(event) {
        event.target.zIndex = 1;
        event.target.opacity = 192;
    }
    onPokerMove(event) {
        //cc.log("idx==move===>", this.pokers.indexOf(event.target));
        var delta = event.touch.getDelta();
        event.target.x += delta.x;
        event.target.y += delta.y;
    }
    onPokerEnd(event) {
        dump(event.touch._point);
        event.target.color = new cc.Color(255, 255, 255, 255);
        event.target.zIndex = 0;
        event.target.opacity = 255;
        var preIdx = this.pokers.indexOf(event.target);
        var targetIdx = preIdx;
        cc.log("preIdx==", preIdx);
        for (let i = 0; i < this.pokerRects.length; i++) {
            const element = this.pokerRects[i];
            cc.log(element.x, element.y, element.width, element.height);
            var b = element.contains(event.touch._point);
            if(b)targetIdx = i;
        }
        if(targetIdx !== preIdx){//交换位置
            var temp = this.pokers[targetIdx];
            this.pokers[targetIdx] = this.pokers[preIdx];
            this.pokers[preIdx] = temp;
            this.pokers[targetIdx].runAction(cc.moveTo(0.3, cc.v2(this.minePos[targetIdx].x, this.minePos[targetIdx].y)))
            this.pokers[preIdx].runAction(cc.moveTo(0.3, cc.v2(this.minePos[preIdx].x, this.minePos[preIdx].y)))
            //个人信息里面牌的数组交换。
            var num = this.userInfo.cards[targetIdx];
            this.userInfo.cards[targetIdx] = this.userInfo.cards[preIdx]
            this.userInfo.cards[preIdx] = num;
        }else{
            this.pokers[preIdx].runAction(cc.moveTo(0.3, cc.v2(this.minePos[preIdx].x, this.minePos[preIdx].y)))
        }
        for (let i = 0; i < this.pokers.length; i++) {
            const element = this.pokers[i];
            cc.log("name======>>>",element.name);
        }
    }
    showMessage(msg:any){
        cc.log("showMessage====",msg); 
        this.action.active = true;
        this.msg.string = msg;
        setTimeout(() => {
            this.action.active = false;
        }, 8000);
    }
    isMe() {
        if (!this.userInfo || !this.userInfo.userId) return false;
        return this.userInfo.userId === cc.UserModel.getUserInfo().userId;
    }
    // update (dt) {}
}
