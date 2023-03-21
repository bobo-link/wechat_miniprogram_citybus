var bmap = require('../../libs/bmap-wx.js');
var BM = require('../../libs/bmap-wx.js');
Page({
  data: {
    weatherData: '',
    adcode: ''
  },

  onLoad: function () {
    var that = this;
    var BMap = new bmap.BMapWX();
    var fail = function (data) {
      console.log(data)
      wx.getLocation({
        type: "wgs84",
        success: (res) => {
          console.log(res)
        }
      })
    };
    var success = function (data) {
      console.log(data)
      var res = data.result;
      var weatherData = '城市：' + res.location.name + '\n' + '体感温度：' + res.now.feels_like + '\n' + '日期：' + 'null' + '\n' + '温度：' + res.now.temp + '\n' + '天气：' + res.now.text + '\n' + '风力：' + res.now.wind_class + '\n';
      that.setData({
        weatherData: weatherData,
        adcode: res.location.id

      });
    }

    BMap.weather({
      fail: fail,
      success: success,
      adcode: getApp().globalData.adcode
    });

  },
  getBusStation() {
    var map = new BM.BMapGL.Map("container"); // 创建Map实例
    

    var busline = new BMapGL.BusLineSearch(map, {
      renderOptions: {
        map: map,
        panel: "r-result"
      },
      onGetBusListComplete: function (result) {
        if (result) {
          var fstLine = result.getBusListItem(0); //获取第一个公交列表显示到map上
          busline.getBusLine(fstLine);
        }
      },
      onGetBusLineComplete: function (result) {
        if (result) {
          let array = []
          for (let i = 0; i < result.getNumBusStations(); i++) {
            let BusStation = result.getBusStation(i);
            array.push({
              name: BusStation.name,
              position: {
                lat: BusStation.position.lat,
                lng: BusStation.position.lng
              },
              uid: BusStation._uid
            })
          }
          console.log(array)
          appPost({
            'BusStation': array
          })
        }
      }
    });

    var busName = 107;
    busline.getBusList(busName);

  },
  onPullDownRefresh: function () {
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        console.log(res);
      }
    })
  },
  test_1: function (e) {


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