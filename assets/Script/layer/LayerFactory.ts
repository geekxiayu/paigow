/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/layer/LayerFactory.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/layer
 * Created Date: Saturday, November 10th 2018, 10:46:59 am
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */
export module LayerFactory {
    export function CreateAlertDialog(params: any) {
        cc.log("CreateAlertDialog==========>",params);
        cc.loader.loadRes("AlertDialog", function (err, prefab) {
            //加入下面這兩行進行判斷
            if (err) { cc.log('初始化失败!, ' + err); return; }
            if (!(prefab instanceof cc.Prefab)) { cc.log('加載資源成功, 但該對象不是Prefab'); return; }
            var dialog = cc.instantiate(prefab);
            cc.director.getScene().addChild(dialog);
            dialog.getChildByName("bg").getChildByName("content").getComponent(cc.RichText).string = params.content;
            dialog.setPosition(cc.v2(0, 0));
            var camponent = dialog.getComponent("AlertDialog");
            camponent.callback = function(){
                params.callback && params.callback();
            }
        });
    }
}