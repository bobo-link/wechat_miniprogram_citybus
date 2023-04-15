// pages/buslinelist/buslinelist.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
import Notify from '@vant/weapp/notify/notify';
var bmap = require('../../libs/bmap-wx.js');
const tools = require('~/utils/util.js')
const BMap = new bmap.BMapWX();
const valid = ['search', 'index']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: []
  },

  busline_detail(e) {
    wx.navigateTo({
      url: '/pages/busline_detail/busline_detail?Referer=busline&name=' + this.data.bus_station.address.split(";")[e.currentTarget.dataset.index],
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["bus_station","if_login"],
      actions: ["update_bus_station","update_collect"]
    });
    this.storeBindings.updateStoreBindings()
    if (valid.includes(options.referer)) {
      wx.setNavigationBarTitle({
        title: this.data.bus_station.name || this.data.bus_station.title,
      })
      this.setData({
        address: this.data.bus_station.address
      })
    } else {
      BMap.detail_promisify({
        uid: options.uid
      }).then((res) => {
        console.log(res)
        if (res.errMsg) {
          return
        }
        this.update_bus_station(res.result)
        wx.setNavigationBarTitle({
          title: res.result.name
        })
        this.setData({
          address: res.result.address
        })
      })
    }
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
    this.storeBindings.destroyStoreBindings();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let station = wx.getStorageSync('station') || []
    let item = {
      name: this.data.bus_station.name,
      type: 'station',
      uid: this.data.bus_station.uid,
      uptime: new Date()
    }
    if(!this.data.if_login){
      Notify({
        type: 'warning',
        message: '请先登录'
      });
      wx.stopPullDownRefresh()
      return 
    }
    if (station.length < 10 && !tools.ifexist(item, station)) {
      BMap.collectSync({
        method: 'add',
        station: item,
      }).then(res => {
        console.log(res)
        if (res.statusCode == 0) {
          station.push(item)
          wx.setStorageSync('station', station)
          wx.setStorageSync('collect_time', new Date())
          this.update_collect()
          Notify({
            type: 'success',
            message: '成功收藏'
          });
        } else {
          Notify({
            type: 'danger',
            message: '收藏失败'
          });
        }
      })
    } else if (station.length >= 10) {
      Notify({
        type: 'danger',
        message: '收藏已达上限'
      });
    } else {
      Notify({
        type: 'warning',
        message: '已存在'
      });
    }
    wx.stopPullDownRefresh()
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