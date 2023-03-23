// index.js
// 获取应用实例
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
var bmap = require('../../libs/bmap-wx.js');
const BMap = new bmap.BMapWX();
const tools = require('~/utils/util.js')

Page({
  data: {
    item: 0,
    tab: 0,
    item_idx: '',
    actions: [{
        name: '删除',
        color: '#fff',
        fontsize: '20',
        width: 100,
        background: '#ed3f14'
      },

    ],
    weather_info: {
      icon: 'error',
      text: '×',
      temp: '×'
    },
    sign_A: {
      flag: true,
      image: 'network',
      description: 'Connection Lost'
    },
  },

  onLoad() {
    const that = this
    that.calcscrollHeight();
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["position", "searchinfo", "if_login", "collect"],
      actions: ["update_position", "update_searchinfo", "switch_init_sign", "update_bus_station", "update_collect"]
    });
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    this.update_collect()
    this.init_data();

  },
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  },
  onPullDownRefresh() {
    this.reset_sign('sign_A')
    wx.showLoading({
      title: 'Loading...',
    })
    this.init_data(() => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })

  },
  collect_init() {
    const a1 = wx.getStorageSync('station')
    const a2 = wx.getStorageSync('buslines')
    const a3 = wx.getStorageSync('route')
    let collect_all = []
    collect_all.push(...a1, ...a2, ...a3)
    collect_all.sort((a, b) => {
      return (a.uptime > b.uptime ? 1 : -1) || 0
    })
    this.setData({
      collect: collect_all
    })
  },
  i_tap(e) {
    this.update_bus_station(this.data.searchinfo[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '../../pages/buslinelist/buslinelist?referer=index&uid=' + this.data.searchinfo[e.currentTarget.dataset.index].uid
    })
  },
  swaech_change(e) {
    BMap.suggestion_promisify({
      query: e.detail,
      region: "335"
    }).then(res => {
      var reg = RegExp(/公交车站/);
      let valid_data = []
      if (res.result && res.result.length > 0) {
        res.result.forEach(item => {
          if (item.name.match(reg)) {
            valid_data.push(item)
          }
        })
      }
      console.log(res)
      console.log(valid_data)
    })
  },
  collect_del(e) {
    let index = e.currentTarget.dataset.index
    let param = {
      method: 'del'
    }
    let type = this.data.collect[index].type
    let item = {
      uptime: this.data.collect[index].uptime
    }
    param[type] = item
    console.log(param)
    BMap.collectSync(param).then((res) => {
      console.log(res)
      if (res.statusCode != undefined && res.statusCode == 0 && res.db_data.nModified > 0) {
        let array = this.data.collect
        array.splice(index, 1)
        wx.setStorageSync(type, array.filter(x => {
          return x.type == type
        }))
        this.update_collect()
        this.storeBindings.updateStoreBindings()
      }
    })
  },
  collect_todetail(e) {
    let index = e.currentTarget.dataset.index
    let type = this.data.collect[index].type
    switch (type) {
      case 'station':
        wx.navigateTo({
          url: '/pages/buslinelist/buslinelist?referer=collect&uid=' + this.data.collect[index].uid,
        })
        break;
      case "route":
        wx.navigateTo({
          url: '/pages/transit_list/transit_list?origin=' + JSON.stringify(this.data.collect[index].origin) + '&destination=' + JSON.stringify(this.data.collect[index].destination),
        });
        break;
      default:
        break;
    }
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
              region: [res.result.addressComponent.province, res.result.addressComponent.city, res.result.addressComponent.district]
            })
            this.update_position({
              adcode: res.result.addressComponent.adcode,
              init_adcode: res.result.addressComponent.adcode,
              cityCode: res.result.cityCode,
              location: location,
              desc: res.result.addressComponent.district + res.result.addressComponent.town + res.result.addressComponent.street + res.result.addressComponent.street_number
            })
            this.switch_init_sign()
            this.storeBindings.updateStoreBindings()
            //百度api获取附近站点信息
            let promiselist = [];
            promiselist[0] = BMap.search_promisify({
              location: location,
              query: '公交车站',
            }).then((res) => {
              if (!res.errMsg) {
                let unique = tools.unique_list(res.results)
                this.update_searchinfo(unique)
                this.setData({
                  'sign_A.flag': false
                })
                if (unique.length == 0) {
                  this.setData({
                    sign_A: Object.assign(sign_A, {
                      flag: true,
                      description: '附近没有站点',
                      image: 'default'
                    })
                  })
                }
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
                  }).then((res) => {
                    this.update_position({
                      weather_adcode: tools.adcode_back(adcode)
                    })
                    this.setData({
                      'weather_info.temp': res.result.now.temp + '℃',
                      'weather_info.text': res.result.now.text,
                      'weather_info.icon': tools.getweather_icon(res.result.now.text),
                    })
                  })
                } else {
                  this.update_position({
                    weather_adcode: adcode
                  })
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
  login() {
    wx.switchTab({
      url: '/pages/setting/setting',
    })
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
      let scrollHeight = screenHeight - topHeight - wx.getStorageSync('navigationBarHeight') - wx.getStorageSync('statusBarHeight')
      that.setData({
        scrollHeight: scrollHeight,
        screenHeight: screenHeight,
        topHeight: topHeight,
      })
    }).exec()
  },
  gotofrecasts() {
    url: '/pages/forecasts/forecasts'
  },
  syncRegionChange(e) {
    console.log('change回调')
    this.reset_sign('sign_A')
    this.switch_init_sign()
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
            this.update_position({
              weather_adcode: e.detail.adcode_up
            })
            this.setData({
              'weather_info.temp': res.result.now.temp + '℃',
              'weather_info.text': res.result.now.text,
              'weather_info.icon': tools.getweather_icon(res.result.now.text),
            })
          })
        } else {
          console.log(res)
          this.update_position({
            weather_adcode: e.detail.adcode
          })
          this.setData({
            'weather_info.temp': res.result.now.temp + '℃',
            'weather_info.text': res.result.now.text,
            'weather_info.icon': tools.getweather_icon(res.result.now.text),
          })
        }
      })
    BMap.search_promisify({
      location: this.data.position.location,
      query: '公交车站'
    }).then((res) => {
      console.log(res)
      if (!res.errMsg) {
        let unique = tools.unique_list(res.results)
        this.update_searchinfo(unique)
        this.setData({
          'sign_A.flag': false
        })
        if (unique.length === 0) {
          this.setData({
            sign_A: Object.assign(sign_A, {
              flag: true,
              description: '附近没有站点',
              image: 'default'
            })
          })
        }
      }
    })
  },
  reset_sign(sign) {
    switch (sign) {
      case 'sign_A':
        this.setData({
          sign_A: {
            flag: true,
            image: 'network',
            description: 'Connection Lost'
          }
        });
        break;
      case 'sign_B':
        this.setData({
          sign_B: {
            flag: true,
            image: 'network',
            description: 'Connection Lost'
          }
        });
        break;
    }
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