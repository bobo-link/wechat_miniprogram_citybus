// pages/transit_list/transit_list.js
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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    empty:{
      image:'network',
      desc:'Connection Lost',
    }

  },
  route_map(e){
    this.update_route(this.data.routes[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '/pages/route_map/route_map'
    })
  },
  tap(e) {
    this.update_route(this.data.routes[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '/pages/transit_detail/transit_detail?origin=' + this.data.origin.name + '&destination=' + this.data.destination.name,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      actions: ["update_route","update_collect"]
    });
    this.setData({
      origin: JSON.parse(options.origin),
      destination: JSON.parse(options.destination)
    })
    wx.showLoading({
      title: '加载中',
    })
    // const routes = wx.getStorageSync('routes')
    // if (routes){
    //   this.setData({
    //     routes:routes
    //   })
    //   wx.hideLoading()
    //   return
    // }
    BMap.transit_promisify({
      origin: JSON.parse(options.origin).location,
      destination: JSON.parse(options.destination).location,
    }).then((res) => {
      console.log(res)
      if(res.statusCode == -1){
        wx.hideLoading()
        return
      }
      if(res.statusCode == 1001 || res.result.routes.length < 1 ){
        this.setData({
          empty:Object.assign({},this.data.empty,{
            image:'search',
            desc:res.errMsg || '没有线路方案'
          })
        })
        wx.hideLoading()
        return
      }
      let transit = res.result
      for (let route in transit.routes) {
        let count = 0;
        let preview_info = {
          linename: [],
          swiper: [],
          flag: true
        }
        if (transit.origin.city_id != transit.destination.city_id) {
          preview_info.flag = false
        }
        let steps = transit.routes[route].steps;
        let i = 0;
        preview_info = Object.assign({},preview_info,{
          distance:transit.routes[route].distance,
          duration:transit.routes[route].duration,
          price:transit.routes[route].price
        })
        for (let step in steps) {
          for (let index in steps[step]) {
            if (steps[step].length > 1 && index == 0 && preview_info.flag) {
              preview_info.swiper[count++] = steps[step][0].distance
            }
            let item = steps[step][index]
            if (item.vehicle_info.type == 5) {
              preview_info.walking = (preview_info.walking || 0) + item['distance']
            }
            if (item.vehicle_info.type == 3) {
              let direction = '';
              let reg = /\((\S*)\)/
              let tmp = item.instructions.split('经过')[0].split('或');
              for (let i in tmp) {
                if (tmp[i].split('乘')[1] && tmp[i].split('乘')[1].match(reg)) {
                  direction = tmp[i].split('乘')[1].match(reg)[0]
                  break;
                }
              }
              // console.log(direction)
              item.name = ((item.vehicle_info.detail && item.vehicle_info.detail.name) || null) + direction
            }
            if (item.vehicle_info.type == 3 || item.vehicle_info.type == 1) {
              preview_info.linename[i++] = {
                name:(item.vehicle_info.detail && item.vehicle_info.detail.name) || null,
                type:item.vehicle_info.type
              }
            }
          }
        }
        transit.routes[route].preview_info = preview_info
      }
      wx.hideLoading()
      this.setData({
        routes: transit.routes
      })
      // wx.setStorageSync('routes', transit.routes)
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
    let route = wx.getStorageSync('route') || []
    let item = {
      origin: this.data.origin,
      destination: this.data.destination,
      type: 'route',
      uptime: new Date()
    }
    if (route.length < 10 && !tools.ifexist(item, route)) {
      BMap.collectSync({
        method: 'add',
        route: item,
      }).then(res => {
        console.log(res)
        if (res.statusCode == 0) {
          route.push(item)
          wx.setStorageSync('route', route)
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
      
    } else if (route.length >= 10) {
      Notify({
        type: 'danger',
        message: '收藏已达上限'
      });
    } else {
      Notify({ type: 'warning', message: '已存在' });
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