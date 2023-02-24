// pages/forecasts/forecasts.js
var bmap = require('../../libs/bmap-wx.js');
var tools = require('~/utils/util.js')
import { createStoreBindings } from "mobx-miniprogram-bindings";
import { store } from "~/store/store";
const Bmap = new bmap.BMapWX({
  ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    now:{
      location: "Loading...",
      temp: 'N/A',
      text: 'NULL',
      weatherIcon:''
    },
    forecasts: [],
    adcode: null,  
    iconimageheight: 0,
  },
  formatforecasts(data) {
    let forecasts_info = data
    let that = this;
    let hour = new Date().getHours;  
    for ( let i = 0; i <forecasts_info.length; i++) {
      if (hour > 6 && hour < 18) {
        forecasts_info[i].weathericon = tools.getweather_icon(forecasts_info[i].text_day);
      } else {
        forecasts_info[i].weathericon = tools.getweather_icon((forecasts_info[i].text_night));
      }
    }
    return forecasts_info
  },
  
  calcscrollHeight() {
    let that = this
    let query = wx.createSelectorQuery().in(this)
    query.select('.top').boundingClientRect(function (res) {
      //得到.top组件的高度
      let topHeight = res.height
      //scroll-view的高度 = 屏幕高度- tab高(50) - 10 - 10 - titleHeight
      //获取屏幕可用高度
      let screenHeight = wx.getSystemInfoSync().windowHeight
      //计算 scroll-view 的高度
      let scrollHeight = screenHeight - topHeight - 70
      that.setData({
        scrollHeight: scrollHeight,
        //screenHeight: screenHeight, 
        iconimageheight: topHeight,
      })
    }).exec()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {   
    const that = this
    this.storeBindings = createStoreBindings(this, {
      store,
      fields:["adcode"],    
      actions: ["update_ad_lo"]
    });   
    this.storeBindings.updateStoreBindings()
    that.calcscrollHeight()
    var weather_success = function (res) {
      console.log(res)
      that.setData({
        'now.location': res.result.location.name,
        'now.temp': res.result.now.temp,
        'now.text': res.result.now.text,
        'now.weatherIcon': tools.getweather_icon(res.result.now.text),
        forecasts: that.formatforecasts(res.result.forecasts)
      })
    }
    var weather_fail = function (res) {}
    console.log(that.data.adcode)
    Bmap.weather({
      success: weather_success,
      fail: weather_fail,
      adcode: that.data.adcode
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