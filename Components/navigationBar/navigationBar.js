// Components/navigationBar/navigationBar.js
import {
  storeBindingsBehavior
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
var bmap = require('../../libs/bmap-wx.js');
const BMap = new bmap.BMapWX({
  ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
});
Component({
  behaviors: [storeBindingsBehavior],
  storeBindings: {
    store,
    fields: ["adcode", "location", "init_adcode"],
    actions: ["update_ad_lo", "check_status"]
  },
  /**
   * 组件的属性列表
   */
  properties: {
    weather_info: {},
    region: { // 属性名
      type: Array,
      value: []
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    ifhidden: false,
    customItem: '全部',
    // 状态栏高度
    statusBarHeight: wx.getStorageSync('statusBarHeight') + 'px',
    // 导航栏高度
    navigationBarHeight: wx.getStorageSync('navigationBarHeight') + 'px',
    // 胶囊按钮高度
    menuButtonHeight: wx.getStorageSync('menuButtonHeight') + 'px',
    // 导航栏和状态栏高度
    navigationBarAndStatusBarHeight: wx.getStorageSync('statusBarHeight') +
      wx.getStorageSync('navigationBarHeight') +
      'px'
  },
  lifetimes: {


  },
  pageLifetimes: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    printComponet() {
      console.log(this)
    },
    gotofrecasts(e) {
      wx.navigateTo({
        url: '/pages/forecasts/forecasts?adcode=' + getApp().globalData.adcode,

      })
    },
    bindRegionChange(e) {
      console.log('picker发送选择改变，携带值为', e.detail)
      this.setData({
        ifhidden: !this.data.ifhidden
      })
      if (e.detail.code[2] == this.data.adcode) {
        return
      }
      if (!e.detail.code[2]) {
        wx.showToast({
          title: '请选择具体城市',
          icon: 'none'
        });
        return
      }
      this.setData({
        region: [e.detail.value[0], e.detail.value[1], e.detail.value[2]]
      })
      const check_init = this.check_status(e.detail.code[2]);
      let promise_item = null;
      let location = null;
      check_init && (promise_item = wx.getLocation({
          type: 'gcj02'
        })
        .then((res) => {
          location = res.latitude + ',' + res.longitude;
          this.update_ad_lo({
            adcode: e.detail.code[2],
            location: location
          })
        }, (res) => {
          console.log('getlocation fail', res)
          wx.showToast({
            title: '请开启位置权限',
            icon: 'none'
          });
          return
        }))
      check_init || (promise_item = BMap.geocoding_promisify({
          address: e.detail.value[2],
          city: e.detail.value[1]
        })
        .then((res) => {
          console.log(res)
          location = res.result.location.lat + ',' + res.result.location.lng;
          this.update_ad_lo({
            adcode: e.detail.code[2],
            location: location
          })
        }))
      promise_item.finally((res) => {
        this.triggerEvent('sync', {
          adcode: e.detail.code[2]
        })
      })

    },
    bindRegionCancel(e) {
      this.setData({
        ifhidden: !this.data.ifhidden
      })
      console.log(this.data.ifhidden)
    },
    bindRegionTap(e) {
      this.setData({
        ifhidden: !this.data.ifhidden
      })
    }

  }
})