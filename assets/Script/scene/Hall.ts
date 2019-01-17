import ShaderComponent from "../../shader/ShaderComponent";
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
var SceneComponent = require("../scene/SceneComponent")
import { LayerFactory } from "../layer/LayerFactory";
import { GamgeConstants } from "../util/constants";
@ccclass
export default class NewClass extends SceneComponent {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Node)
    startBtn: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    dialog: cc.Node = null;
    onLoad() {
        super.onLoad();
        var w = cc.winSize.width;
        var h = cc.winSize.height;
        cc.log("w====",w,"h====",h);
        this.startBtn.on(cc.Node.EventType.TOUCH_END, this.onStartClick, this);
        this.label.node.setPosition(this.label.node.getPosition().x,this.label.node.getPosition().y + h/2 - 640);
        this.icon.node.setPosition(this.icon.node.getPosition().x,this.icon.node.getPosition().y + h/2 - 640);
        cc.Notification.on(GamgeConstants.EVENT_ENTER_ROOM,this.onEnterRoom,this);
    }
    start() {
        var self = this;
        cc.log("hall start========", cc.UserModel.getUserInfo().nickName);
        this.label.string = cc.UserModel.getUserInfo().nickName;
        if (!cc.sys.isBrowser) {
            var imageLoader = require("../util/imageLoad");
            imageLoader.imageLoadTool("http://10.1.4.92:9002/img/hall/home/game_3p_bkg.png", function (spriteFrame) {
                self.icon.spriteFrame = spriteFrame;
                self.icon.node.setContentSize(cc.size(128, 128));
                self.icon.getComponent(ShaderComponent).shader = 114;
            });

        } else {
            cc.log("web===========>")
            loadImg(self.icon, "http://10.1.4.92:9002/img/hall/home/game_3p_bkg.png");
        }
    }
    //
    onEnterRoom(data){
        cc.log("进入房间----->>>",data);
        cc.director.loadScene("game")
    }
    // update (dt) {}
    onStartClick() {
        let self = this;
        //LayerFactory.CreateAlertDialog({parent:self,content:'这是一个对话框',pos:cc.v2(0, 0)});
       /* */
        //cc.director.loadScene("game")
        cc.NetManager.send("enterRoom",{userId:cc.UserModel.getUserInfo().userId});
    }
    onDestroy(){
        cc.Notification.off(GamgeConstants.EVENT_ENTER_ROOM,this.onEnterRoom,this);
    }
}
function loadImg(container, url) {
    cc.loader.load(url, function (err, texture) {
        if (err) {
            cc.log("load error!", err);
            return;
        }
        var sprite = new cc.SpriteFrame(texture);
        container.spriteFrame = sprite;
        container.node.setContentSize(cc.size(128, 128));
    });
} 
