// Components/navigationBar/navigationBar.js
var bmap = require('../../libs/bmap-wx.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    region: { // 属性名
      type: Array,
      value: ['广东省', '广州市', '海珠区']
    },

  },

  /**
   * 组件的初始数据
   */
  data: {

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
    show: function (params) {
      const picker = this.selectComponent(".region")
      console.log(picker)
    }
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
      const appInstance = getApp()
      appInstance.globalData.adcode = e.detail.code[2]
      this.setData({
        region: [e.detail.value[0], e.detail.value[1], e.detail.value[2]]
      })
    },

  }
})