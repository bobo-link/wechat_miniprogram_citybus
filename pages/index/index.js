// index.js
// 获取应用实例
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
var bmap = require('../../libs/bmap-wx.js');
const BMap = new bmap.BMapWX({
  ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
});
Page({
  data: {
    weather_info: {
      icon: 'error',
      text: '×',
      temp: '×'
    },
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })

  },
  gotofrecasts() {
    url: '/pages/forecasts/forecasts'
  },
  onLoad() {
    const that = this
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['adcode', 'init_adcode', 'location'],
      actions: ["update_ad_lo"]
    });
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    wx.getLocation({type:'gcj02'})
    .then((res)=>{
      let location =res.latitude + ',' + res.longitude
      BMap.regeocoding_promisify({location: location})
      .then((res)=>{
        that.setData({
          region: [res.result.addressComponent.province, res.result.addressComponent.city, res.result.addressComponent.district]
        })
        this.update_ad_lo({
          adcode: res.result.addressComponent.adcode,
          init_adcode: res.result.addressComponent.adcode,
          location: location,
        })
        this.storeBindings.updateStoreBindings()
      })
    },(res)=>{
      console.log('getlocation fail',res)
    })
    
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  },
  syncRegionChange(e) {
    console.log('change回调')

  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})