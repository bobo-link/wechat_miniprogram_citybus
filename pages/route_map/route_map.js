// pages/route_map/route_map.js
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["position","route"],
    });
    this.storeBindings.updateStoreBindings()
   
    let polyline = []
    let markers = []
    let marker_id = 0
    const route = this.data.route
    const config =  [{},
      {
        color: "#188BF8",
        width: 4,
      },
      {},
      {
        color: "#71C425",
        width: 4,
        arrowLine:true
      },
      {
        color: "#F83D18",
        width: 4,
      },
      {
        color: "#F83D18",
        width: 4,
        dottedLine:true,
    }]
    for (let j in route.steps){
      for (let x in route.steps[j]){
        let  points = (route.steps[j][x].path).split(';')
        for (let i in points){
          points[i] = {
            latitude: points[i].split(',')[1],
            longitude:points[i].split(',')[0],
          }
        }
        if (route.steps[j][x].vehicle_info.type ==3 || route.steps[j][x].vehicle_info.type ==1){
          markers.push({
            id: marker_id++,
            latitude: route.steps[j][x].start_location.lat,
            longitude: route.steps[j][x].start_location.lng,
            title: route.steps[j][x].vehicle_info.detail.start_info.start_name,
            uid: route.steps[j][x].vehicle_info.detail.start_info.start_uid || '',
            type:route.steps[j][x].vehicle_info.type
          })
          markers.push({
            id: marker_id++,
            latitude: route.steps[j][x].end_location.lat,
            longitude: route.steps[j][x].end_location.lng,
            title: route.steps[j][x].vehicle_info.detail.end_info.end_name,
            uid: route.steps[j][x].vehicle_info.detail.end_info.end_uid || '',
            type:route.steps[j][x].vehicle_info.type
          })
        }
        points.unshift({
          latitude:route.steps[j][x].start_location.lat,
          longitude:route.steps[j][x].start_location.lng
        })
        points.push({
          latitude:route.steps[j][x].end_location.lat,
          longitude:route.steps[j][x].end_location.lng
        })
        polyline.push(Object.assign({points:points},config[route.steps[j][x].vehicle_info.type])) 
      }
    }
    this.setData({
      polyline:polyline,
      markers:markers
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