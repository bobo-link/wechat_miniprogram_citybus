// pages/transit_list/transit_list.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
var bmap = require('../../libs/bmap-wx.js');
const BMap = new bmap.BMapWX();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  tap(e){
    console.log(e.currentTarget.dataset.index)
    this.update_route(this.data.routes[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '/pages/transit_detail/transit_detail?origin=' + this.data.origin.name + '&destination=' + this.data.destination.name ,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      actions: ["update_route"]
    });
    this.setData({
      origin:JSON.parse(options.origin),
      destination:JSON.parse(options.destination)
    })
    // BMap.transit_promisify({
    //     origin: JSON.parse(options.origin).location,
    //     destination: JSON.parse(options.destination).location,
    //   }).then((res) => {
    //     console.log(res)
        
    //   })
    let transit = wx.getStorageSync('route')
    console.log(transit)
    for (let route in transit.routes ){
      let count = 0;
      let preview_info ={linename:[],swiper:[]}
      let steps = transit.routes[route].steps;
      preview_info.distance = transit.routes[route].distance;
      preview_info.duration = transit.routes[route].duration;
      preview_info.price = transit.routes[route].price;
      for (let step in steps) {
        let i = 0;
        for (let index in steps[step]){
          if(steps[step].length > 1 && index == 0){
            preview_info.swiper[count++] = steps[step][0].distance
          }
          let item = steps[step][index]
          if(item.vehicle_info.type == 5) {
            preview_info.walking = (preview_info.walking || 0) + item['distance']
          }
          if (item.vehicle_info.type == 3){
            let reg=/\((\S*)\)/
            let tmp = item.instructions.split('或')[0]
            item.name = item.vehicle_info.detail.name + (tmp && tmp.match(reg)[0])
          }
          if (item.vehicle_info.type == 3 || item.vehicle_info.type == 1){
            preview_info.linename[i++] = item.vehicle_info.detail.name
          }
        }
      }
      transit.routes[route].preview_info =preview_info
    }
    
    this.setData({
      routes: transit.routes
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