// index.js
// 获取应用实例
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
var bmap = require('../../libs/bmap-wx.js');
const tools = require('~/utils/util.js')
const BMap = new bmap.BMapWX({
  ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
});
Page({
  data: {
    item: 0,
    tab: 0,
    actions: [{
        name: '喜欢',
        color: '#fff',
        fontsize: '20',
        width: 100,
        icon: 'like',
        background: '#ed3f14'
      },

    ],
    weather_info: {
      icon: 'error',
      text: '×',
      temp: '×'
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },

  onLoad() {
    const that = this
    that.calcscrollHeight();
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['adcode', 'init_adcode', 'location', 'searchinfo','weather_adcode'],
      actions: ["update_ad_lo", "update_searchinfo"]
    });
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.init_data();

  },
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  },
  onPullDownRefresh() {
    wx.showLoading({
      title: 'Loading...',
    })
    this.init_data(() => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })

  },
  i_tap(e) {
    wx.navigateTo({
      url: '../../pages/buslinelist/buslinelist' + '?uid=' + e.currentTarget.dataset.uid,
    })
  },
  i_change(e) {
    console.log(e)
  },
  //切换标签页函数
  changeItem: function (e) {
    this.setData({
      item: e.target.dataset.item
    })
  },
  changeTab: function (e) {
    this.setData({
      tab: e.detail.current
    })
  },
  //数据初始化的封装函数
  async init_data(param) {
    var fun = param || function () {};
    //微信获取当前位置信息    
    wx.getLocation({
        type: 'gcj02'
      })
      .then((res) => {
        let location = res.latitude + ',' + res.longitude
        //百度逆向地理转换，获取当前城市信息
        BMap.regeocoding_promisify({
            location: location
          })
          .then((res) => {
            console.log(res)
            if (res.errMsg) {
              wx.showToast({
                title: '无法连接到服务器',
                icon: 'none'
              })
              fun();
              return
            }
            this.setData({
              region: [res.result.addressComponent.province, res.result.addressComponent.city, res.result.addressComponent.district] || ['广东省', '广州市', '海珠区']
            })
            this.update_ad_lo({
              adcode: res.result.addressComponent.adcode,
              init_adcode: res.result.addressComponent.adcode,
              location: location,
            })
            //百度api获取附近站点信息
            let promiselist = [];
            promiselist[0] = BMap.search_promisify({
              location: location,
              query: '公交车站'
            }).then((res) => {              
              if (!res.errMsg) {
                let unique = tools.unique_list(res.results)
                this.update_searchinfo(unique)
              }
            })
            let adcode = res.result.addressComponent.adcode
            //百度api获取当前城市天气信息
            promiselist[1] = BMap.weather_promisify({
                adcode: adcode,
                data_type: 'now'
              })
              .then((res) => {
                if (res.statusCode && res.statusCode == 40) {
                  wx.showToast({
                    title: '该区域不支持天气模块，将返回上级市的天气',
                    icon: 'none'
                  })
                  promiselist[1] = BMap.weather_promisify({
                    adcode: tools.adcode_back(adcode),
                    data_type: 'now'
                  }).then((res)=>{
                    this.update_ad_lo({weather_adcode:tools.adcode_back(adcode)})
                    this.setData({
                      'weather_info.temp': res.result.now.temp + '℃',
                      'weather_info.text': res.result.now.text,
                      'weather_info.icon': tools.getweather_icon(res.result.now.text),
                    })
                  })
                }else{
                  this.update_ad_lo({weather_adcode:adcode})
                  this.setData({
                    'weather_info.temp': res.result.now.temp + '℃',
                    'weather_info.text': res.result.now.text,
                    'weather_info.icon': tools.getweather_icon(res.result.now.text),
                  })
                }   
              })
            Promise.all(promiselist).then((res) => {
              this.storeBindings.updateStoreBindings();
              fun()
            })
          })
      }, (res) => {
        console.log(res)
        fun(res)
      })

  },
  //滑动事件处理
  catchtouchmove: function (res) {

  },

  // 事件处理函数
  bindViewTap() {
    BMap.transit_promisify({
      origin: '29.24531281354,119.97543469878',
      origin_uid: 'fb272de57780c281a1d23033',
      destination: '29.265688874471,120.02401577939',
      destination_uid: '91d6a8b928cb32b69703195e'
    }).then((res) => {
      console.log(res)
    })

  },
  calcscrollHeight() {
    let that = this
    let query = wx.createSelectorQuery().in(this)
    query.select('.container').boundingClientRect(function (res) {
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
  gotofrecasts() {
    url: '/pages/forecasts/forecasts'
  },
  syncRegionChange(e) {
    console.log('change回调')
    this.storeBindings.updateStoreBindings();
    BMap.weather_promisify({
        adcode: e.detail.adcode,
        data_type: 'now'
      })
      .then((res) => {
        if (res.statusCode && res.statusCode == 40) {
          wx.showToast({
            title: '该区域不支持天气模块，将返回上级市的天气',
            icon: 'none'
          })
          BMap.weather_promisify({
            adcode: e.detail.adcode_up,
            data_type: 'now'
          }).then((res) => {
            this.update_ad_lo({weather_adcode:e.detail.adcode_up})
            this.setData({
              'weather_info.temp': res.result.now.temp + '℃',
              'weather_info.text': res.result.now.text,
              'weather_info.icon': tools.getweather_icon(res.result.now.text),
            })
          })
        } else {
          console.log(res)
          this.update_ad_lo({weather_adcode:e.detail.adcode})
          this.setData({
            'weather_info.temp': res.result.now.temp + '℃',
            'weather_info.text': res.result.now.text,
            'weather_info.icon': tools.getweather_icon(res.result.now.text),
          })          
        }
      })
    BMap.search_promisify({
      location: this.data.location,
      query: '公交车站'
    }).then((res) => {
      if (!res.errMsg) {
        let unique = tools.unique_list(res.results)
        this.update_searchinfo(unique)
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