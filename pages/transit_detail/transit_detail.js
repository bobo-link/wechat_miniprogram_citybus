// pages/transit_detail/transit_detail.js
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
    route:{},
    swiperHeight:{}
  },
  change(e){
    //获取内部元素高度动态改变swiper高度    
    let tmp = {}
    let _class = '.item_' + e.target.dataset.uid + '_' + e.detail.current
    wx.createSelectorQuery().select(_class).boundingClientRect(rect => {
      tmp[e.target.dataset.uid] = (++rect.height)+ 'px' 
      console.log(tmp)
      this.setData({ swiperHeight: Object.assign(this.data.swiperHeight,{...tmp})});    
    }).exec();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["route"]
    });
    this.setData({
      s_e:{
        origin:options.origin,
        destination:options.destination
      }
    })
    // let route = wx.getStorageSync('route')
    // let steps = route.routes[0].steps
    // let rail ;
    // var distance={
    //   data:[],
    //   sum:0
    // }
    // var i = 0
    // for (let step in steps) {
    //   for (let index in steps[step]){
    //     let item = steps[step][index]
    //     distance.sum = distance.sum + item.distance
    //     distance.data[i++] = {
    //       distance:item.distance,
    //       tpype:item.vehicle_info.type
    //     }
    //     if (item.vehicle_info.type == 3){
    //       let reg=/\((\S*)\)/
    //       let tmp = item.instructions.split('或')[0]
    //       item.name = item.vehicle_info.detail.name + (tmp && tmp.match(reg)[0])
    //       console.log(item.name)
    //     }
    //   }
    // }
    
    console.log(this.data.route)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let tmp = {}
    for (let swiper in this.data.route.preview_info.swiper ){
      let _class = '.item_' +  this.data.route.preview_info.swiper[swiper] +'_0'
      console.log(_class)      
      wx.createSelectorQuery().select(_class).boundingClientRect(rect => {
        tmp[this.data.route.preview_info.swiper[swiper]] = (++rect.height)+ 'px' 
        console.log(tmp)
        this.setData({ swiperHeight: Object.assign(this.data.swiperHeight,{...tmp})});    
      }).exec();
    }
   
    
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log(this.data.swiperHeight['7979'])
    console.log(this.data.swiperHeight)
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