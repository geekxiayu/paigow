/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/scene/SceneComponent.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/scene
 * Created Date: Saturday, November 10th 2018, 11:49:17 am
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */
const { ccclass, property } = cc._decorator;
import { GamgeConstants } from "./../util/constants"
@ccclass
class SceneComponent extends cc.Component {
    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }
    onKeyDown(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.back:
            case cc.macro.KEY.escape:
                cc.Notification.emit(GamgeConstants.EVENT_KEY_BACK);
                break;
            default:
                break;
        }
    }
    onKeyUp(event) {
        switch (event.keyCode) {
            case cc.macro.KEY.back:
            case cc.macro.KEY.escape:
                break;
            default:
                break;
        }
    }
}
