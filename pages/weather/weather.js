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
            console.log(data)
            var res = data.result;
            var weatherData = '城市：' + res.location.name + '\n' + '体感温度：' + res.now.feels_like + '\n' +'日期：' + 'null' + '\n' + '温度：' + res.now.temp + '\n' +'天气：' + res.now.text + '\n' +'风力：' + res.now.wind_class + '\n';           
            that.setData({
                weatherData: weatherData,
                adcode:res.location.id

            });
        }

        BMap.weather({
            fail: fail,
            success: success,
            adcode: getApp().globalData.adcode
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
      wx.navigateTo({
        url: '/pages/suggestion/suggestion',
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
      try{
        wx.getFileSystemManager().accessSync('wxfile://usr/tmp_4048b3efb7027bed5faefa25ebb2a86f.jpg')
        wx.getFileSystemManager().unlinkSync('wxfile://usr/tmp_4048b3efb7027bed5faefa25ebb2a86f.jpg')
        console.log('存在')      
      }
      catch(e){
        console.log('不存在')  
      }
      // wx.navigateTo({
      //   url: '/pages/forecasts/forecasts?adcode='+this.data.adcode,
      // })
    }
})