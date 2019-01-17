// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
var LayerBase = require("../layer/LayerBase")
@ccclass
export default class AlertDialog extends LayerBase {

    @property(cc.RichText)
    label: cc.RichText = null;
    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.Layout)
    maskLayout :cc.Layout = null;
   
    // LIFE-CYCLE CALLBACKS:
    private callback;
    onLoad () {
        super.onLoad();
        var time = Date.parse(new Date().toString()) / 1000;
        this.label.string = "text:" + time;
        this.button.node.on(cc.Node.EventType.TOUCH_END, this.onButtonClick, this);
        this.maskLayout.node.on(cc.Node.EventType.TOUCH_END, this.onBgClick, this);
    }

    start () {
        super.start();
    }
    onButtonClick(){
        this.node.destroy();
       //this.node.removeFromParent();
       if (this.callback){ this.callback() }
    }
    onBgClick(){
        this.node.destroy();
        //this.node.removeFromParent();
     }
    // update (dt) {}
}
