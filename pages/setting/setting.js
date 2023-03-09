// pages/setting/setting.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    usr_info:{},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    if_login: false // 如需尝试获取用户信息可改为false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["if_login","usr_info"],
      actions: ["login_switch"]
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('onshow')
    this.storeBindings.updateStoreBindings();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.storeBindings.destroyStoreBindings();
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.storeBindings.updateStoreBindings();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '自定义转发标题',
      path: '/pages/index/index',

    }
  },
  getUserProfile(e) {
 
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  logout(e){
    this.login_switch()
    this.storeBindings.updateStoreBindings()
  },
  bindViewTap(e) {
    this.setData({
      if_login: true
    })
  }
})