/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/layer/LayerBase.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/layer
 * Created Date: Saturday, November 10th 2018, 12:33:53 pm
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */


const { ccclass, property } = cc._decorator;

import { GamgeConstants } from "./../util/constants"
@ccclass
class LayerBase extends cc.Component {
    onLoad() {
        cc.Notification.on(GamgeConstants.EVENT_KEY_BACK, this.onKeyBack, this.node);
    }
    start() {
        require("./../util/common").hello();
    }
    onDestroy() {
        cc.log("LayerBase==onDestroy==",this.name);
        cc.Notification.off(GamgeConstants.EVENT_KEY_BACK, this.onKeyBack);
    }
    onKeyBack(params) {
        cc.log("LayerBase==onKeyBack==",params);
        this.destroy();
    }
    // update (dt) {}
}
