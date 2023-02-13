// index.js
// 获取应用实例
var bmap = require('../../libs/bmap-wx.js');
const app = getApp()

Page({
  data: {
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
  gotofrecasts(){
    url:'/pages/forecasts/forecasts'
  },
  onLoad() {
    const that = this
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    var BMap = new bmap.BMapWX({
      ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
    });
   BMap.reverse_geocoding({
     fail:function (res) {
       console.log(res)       
     },
     success:function (res) {
      that.setData({
        region:[res.origin_data.result.addressComponent.province,res.origin_data.result.addressComponent.city,res.origin_data.result.addressComponent.district]
      }) 
      console.log(that.data.region)
     }
   })

   
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
