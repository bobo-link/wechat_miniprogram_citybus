var bmap = require('../../libs/bmap-wx.js');
Page({
    data: {
        weatherData: '',
        adcode:''
    },
    
    onLoad: function() {
        var that = this;
        var BMap = new bmap.BMapWX({
            ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
        });
        var fail = function(data) {
            console.log(data)
            wx.getLocation({
              type: "wgs84",
              success: (res) => {
                console.log(res)
              }
            })
        };
        var success = function(data) {
            var weatherData = data.currentWeather[0];
            weatherData = '城市：' + weatherData.currentCity + '\n' + '体感温度：' + weatherData.feels_like + '\n' +'日期：' + weatherData.date + '\n' + '温度：' + weatherData.temperature + '\n' +'天气：' + weatherData.weatherDesc + '\n' +'风力：' + weatherData.wind + '\n';
            console.log(data.originalData)
            that.setData({
                weatherData: weatherData,
                adcode:data.originalData.result.location.id

            });
        }

        BMap.weather({
            fail: fail,
            success: success
        });
         
    },
    onPullDownRefresh: function() {
      wx.getLocation({
        type: "gcj02",
        success: (res) => {
          console.log(res);
        }
      })      
    },
    test_1: function(e){
      var BMap = new bmap.BMapWX({
        ak: 'ReGm8Iydv1TqNTg9uddG2RAfqQ8GZYrL'
      });
      BMap.reverse_geocoding({
        fail : null
      })
    },
    gotologs:function(){
      wx.navigateTo({
        url: '/pages/logs/logs',
      })
    },
    gotogeocoding:function(){
      wx.navigateTo({
        url: '/pages/geocoding/geocoding', 
      })
    },
    gotoregeocoding:function(){
      wx.navigateTo({
        url: '/pages/regeocoding/regeocoding',
      })
    },
    gotocontact:function(){
      wx.navigateTo({
        url:'/pages/practice/contact/contact'
      })
    },
    gotolocal:function(){
      wx.navigateTo({
        url: '/pages/practice/local_life/local_life',
      })
    },
    gotoforecasts:function(){
      wx.navigateTo({
        url: '/pages/forecasts/forecasts?adcode='+this.data.adcode,
      })
    }
})