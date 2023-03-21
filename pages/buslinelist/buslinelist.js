// pages/buslinelist/buslinelist.js
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

  },

  busline_detail(e){
    wx.navigateTo({
      url: '/pages/busline_detail/busline_detail?Referer=busline&name='+this.data.bus_station.address.split(";")[e.currentTarget.dataset.index],
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["bus_station"],
    });

    this.storeBindings.updateStoreBindings()
    wx.setNavigationBarTitle({
      title: this.data.bus_station.name,
    })
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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

  }
})