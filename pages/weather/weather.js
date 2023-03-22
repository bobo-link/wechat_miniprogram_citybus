var bmap = require('../../libs/bmap-wx.js');
const BMap = new bmap.BMapWX();
Page({
  data: {
    weatherData: '',
    adcode: ''
  },

  onLoad: function () {
    var that = this;


  },

  onPullDownRefresh: function () {
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        console.log(res);
      }
    })
  },
  station() {
    wx.p.request({
      url: wx.prefix + 'collectsync',
      data: {
        openid: wx.getStorageSync('usrinfo').openid,
        method: 'del',
        station: {uid:'6d706b478491bda208f5ebfe'},
      },
      header: {
        "content-type": "application/json"
      },
      method: 'GET'
    }).then((res)=>{
      console.log(res)
    })
  },
  busline(){
    BMap.collectSync({
      method: 'ver',
    }).then(res => {
      console.log(res)
      let local_time = wx.getStorageSync('collect_time')
      let server_time = (new Date(res.db_data.uptime))
      console.log(local_time)
      console.log(server_time)
    })
  },
  route(){
    BMap.collectSync({
      method: 'get',
    }).then(res=>{
      console.log(res)
    })
  },
  gotologs: function () {
    wx.navigateTo({
      url: '/pages/logs/logs',
    })
  },
  gototransit: function () {
    let reg = /\((\S*)\)/
    // let resultArr=str.match(reg)
    // const route = wx.getStorageSync('route')
    // console.log(route.routes[0].steps[1][0].instructions.match(reg)[1])
    // wx.p.request({
    //   url: 'http://172.20.10.4:59/echo',
    //   method: 'POST',
    //   data: wx.getStorageSync('routes')
    // }).then(({
    //   data: res
    // }) => {
    //   console.log('success', res)
    // }, (res) => {
    //   console.log('fail', res)
    // })

  },
  gotoregeocoding: function () {

  },
  gotocontact: function () {
    wx.navigateTo({
      url: '/pages/practice/contact/contact'
    })
  },
  gotolocal: function () {
    wx.navigateTo({
      url: '/pages/practice/local_life/local_life',
    })
  },
  gotoforecasts: function () {
    try {
      wx.getFileSystemManager().accessSync('wxfile://usr/tmp_4048b3efb7027bed5faefa25ebb2a86f.jpg')
      wx.getFileSystemManager().unlinkSync('wxfile://usr/tmp_4048b3efb7027bed5faefa25ebb2a86f.jpg')
      console.log('存在')
    } catch (e) {
      console.log('不存在')
    }
    // wx.navigateTo({
    //   url: '/pages/forecasts/forecasts?adcode='+this.data.adcode,
    // })
  }
})