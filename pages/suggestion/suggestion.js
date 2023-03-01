var bmap = require('../../libs/bmap-wx.js');
Page({
  data: {
    sugData: [],
  },
  bindKeyInput: function (e) {
    var that = this;
    if (e.detail.value === '') {
      that.setData({
        sugData: []
      });
      return;
    }
    var BMap = new bmap.BMapWX({
      ak: 'Q5Q7pGs2SltrQaC2HjEWxOgFiBR1xVFM'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      console.log(data)
      var tmp_data = [];
      for (var i = 0; i < data.result.length; i++) {

        tmp_data[i] = {
          name: data.result[i].name,
          uid: data.result[i].uid,
          location: data.result[i].lat + ',' + data.result[i].lng,
          adcode: data.result[i].adcode,
          tag: data.result[i].tag,
        }
      }
      console.log(tmp_data)
      that.setData({
        sugData: tmp_data
      });
    }
    BMap.suggestion({
      query: e.detail.value,
      region: '北京',
      city_limit: true,
      fail: fail,
      success: success
    });
  },
  
})