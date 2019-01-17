/*
 * Filename: /Users/geekxiayu/NewProject/assets/Script/model/UserModel.ts
 * Path: /Users/geekxiayu/NewProject/assets/Script/model
 * Created Date: Wednesday, November 7th 2018, 5:44:12 pm
 * Author: geekxiayu
 * 
 * Copyright (c) 2018 Your Company
 */
cc.UserModel = {
    setUserInfo: function (user) {
        this.user = user;
    },
    getUserInfo: function () {
        return this.user;
    },
    setRoomInfo: function (room) {
        this.room = room;
    },
    getRoomInfo: function () {
        return this.room;
    }
}