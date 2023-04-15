// pages/busline_detail/busline_detail.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
import Notify from '@vant/weapp/notify/notify';
const tools = require('~/utils/util.js')
var bmap = require('../../libs/bmap-wx.js');
import Dialog from '../../libs/dialog';
const BMap = new bmap.BMapWX();
var location
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item_idx: 10

  },
  reverse_direction() {
    let direction = this.data.busline.direction
    let BusStations = this.data.busline.BusStations
    direction.reverse();
    BusStations.reverse();
    console.log(location)
    this.setData({
      busline: Object.assign({}, this.data.busline, {
        direction: direction,
        BusStations: BusStations,
      }),
      item_idx: BusStations.length - this.data.item_idx - 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["bus_station", "if_login"],
      actions: ["update_collect"]
    });
    this.storeBindings.updateStoreBindings()
    wx.p.request({
      url: wx.prefix + 'busline',
      data: {
        name: options.name
      },
      header: {
        "content-type": "application/json"
      },
      method: 'GET'
    }).then(({
      data: res
    }) => {
      console.log(res)
      if (res.statusCode == undefined || res.statusCode == 101){
        Dialog.confirm({
          message: res.errMsg || '该线路数据获取失败',
          selector: '#cus-dialog',
          confirmCallback: function () {
            wx.navigateBack()
          }
        });
        return
      } 
      let busline = res.busline
      let reg = /\((\S*)\)/
      let direction = busline.name.match(reg)[1]
      busline.direction = [direction.split('-')[0], direction.split('-')[1]]
      busline.name = busline.name.split('(')[0]
      location = {
        lat: busline.BusStations[0].position.lat,
        lng: busline.BusStations[0].position.lng,
      }
      this.setData({
        busline: busline
      })
      wx.setNavigationBarTitle({
        title: busline.name,
      })     
      let item_idx = busline.BusStations.findIndex((item) => {
        return item.name == this.data.bus_station.name
      })
      this.setData({
        item_idx: item_idx
      })
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
    this.storeBindings.destroyStoreBindings();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let busline = wx.getStorageSync('busline') || []
    let item = {
      name: this.data.busline.name,
      location: location,
      type: 'busline',
      uptime: new Date()
    }
    if (!this.data.if_login) {
      Notify({
        type: 'warning',
        message: '请先登录'
      });
      wx.stopPullDownRefresh()
      return
    }
    if (busline.length < 10 && !tools.ifexist(item, busline)) {
      BMap.collectSync({
        method: 'add',
        busline: item,
      }).then(res => {
        console.log(res)
        if (res.statusCode == 0) {
          busline.push(item)
          wx.setStorageSync('busline', busline)
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
    } else if (busline.length >= 10) {
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