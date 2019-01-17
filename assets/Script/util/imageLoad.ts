/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/util/imageLoad.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/util
 * Created Date: Wednesday, November 7th 2018, 6:38:49 pm
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */
/*
 * @Author: Damo 
 * @Date: 2018-06-08 09:56:20 
 * @Last Modified by: Damo
 * @Last Modified time: 2018-06-10 13:29:52
 */
import{md5}from"../util/md5";
cc.Class({
    extends: cc.Component,
    statics: {

        loadImage: function (url, callback) {
            cc.loader.load(url, function (err, tex) {
                var spriteFrame = new cc.SpriteFrame(tex, cc.rect(0, 0, tex.width, tex.height));
                callback(spriteFrame);
            });
        },
        imageLoadTool(url, callback) {
            var dirpath = jsb.fileUtils.getWritablePath() + 'customHeadImage/';
            console.log("dirpath ->", dirpath);
            let md5URL = md5(url);
            var filepath = dirpath + md5URL + '.png';
            console.log("filepath ->", filepath);
            function loadEnd() {
                cc.loader.load(filepath, function (err, tex) {
                    if (err) {
                        cc.error(err);
                    } else {
                        var spriteFrame = new cc.SpriteFrame(tex);
                        if (spriteFrame) {
                            callback(spriteFrame);
                        }
                    }
                });

            }
            if (jsb.fileUtils.isFileExist(filepath)) {
                cc.log('Remote is find' + filepath);
                loadEnd();
                return;
            }
            var saveFile = function (data) {
                if (typeof data !== 'undefined') {

                    if (!jsb.fileUtils.isDirectoryExist(dirpath)) {

                        jsb.fileUtils.createDirectory(dirpath);
                    } else {
                        console.log("路径exist");
                    }

                    // new Uint8Array(data) writeDataToFile  writeStringToFile
                    if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), filepath)) {
                        cc.log('Remote write file succeed.',filepath);
                        loadEnd();
                    } else {
                        cc.log('Remote write file failed.');
                    }
                } else {
                    cc.log('Remote download file failed.');
                }
            };
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                cc.log("xhr.readyState  " + xhr.readyState);
                cc.log("xhr.status  " + xhr.status);
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        //responseType一定要在外面设置
                        // xhr.responseType = 'arraybuffer'; 
                        saveFile(xhr.response);
                    } else {
                        saveFile(null);
                    }
                }
            }.bind(this);
            //responseType一定要在外面设置
            xhr.responseType = 'arraybuffer';
            xhr.open("GET", url, true);
            xhr.send();
        },
    },
});