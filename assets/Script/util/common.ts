/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/util/common.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/util
 * Created Date: Saturday, November 10th 2018, 2:37:59 pm
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */
// 全局通知
cc.Notification = {
    _eventMap: [],
    on: function (type, callback, target) {
        if (this._eventMap[type] === undefined) {
            this._eventMap[type] = [];
        }
        this._eventMap[type].push({ callback: callback, target: target });
    },

    emit: function (type, parameter) {
        var array = this._eventMap[type];
        if (array === undefined) return;

        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element) element.callback.call(element.target, parameter);
        }
    },
    off: function (type, callback) {
        var array = this._eventMap[type];
        if (array === undefined) return;

        for (var i = 0; i < array.length; i++) {
            var element = array[i];
            if (element && element.callback === callback) {
                array[i] = undefined;
                break;
            }
        }
    },
    offType: function (type) {
        this._eventMap[type] = undefined;
    },
};
export function dump(obj: any) {
    if (!obj) { cc.log("dump:" + null) };
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cc.log(key,":",obj[key]);
        }
    }
}