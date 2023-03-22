var bmap = require('../../libs/bmap-wx.js');
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
var wxMarkerData = [];
Page({
  data: {
    markers: [],
    location: '',
    latitude: '',
    longitude: '',
    placeData: {}
  },
  markertap: function (e) {
    var that = this;
    if (this.data.markers_douletap[e.detail.markerId]){
      console.log('触发双击')
      this.update_bus_station(this.data.searchinfo[e.detail.markerId])
      wx.navigateTo({
        url: '../../pages/buslinelist/buslinelist?referer=search'
      })
    }
    this.setData({
     [`markers_douletap[${e.detail.markerId}]`]:true
    })
    setTimeout(()=>{
      this.setData({
        [`markers_douletap[${e.detail.markerId}]`]:false
       })
    },1000)
   
   
    
  },
  onLoad: function () {
    var that = this;
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["position",'searchinfo'],
      actions: ["update_bus_station"]
    });
    
  },
  showSearchInfo: function (data, i) {
    var that = this;
    that.setData({
      placeData: {
        title: '名称：' + data[i].title + '\n',
        address: '地址：' + data[i].address + '\n',
        telephone: '电话：' + data[i].telephone
      }
    });
  },
  onShow(){
    const that = this
    this.storeBindings.updateStoreBindings();   
    if (this.data.searchinfo) {     
      let wxMarkerData = []
      let poiArr = this.data.searchinfo
      for (let i = 0; i < poiArr.length; i++) {
        wxMarkerData[i] = {
          id: i,
          latitude: poiArr[i]["location"]["lat"],
          longitude: poiArr[i]["location"]["lng"],
          title: poiArr[i]["name"],
          alpha: 1,    
        }
      }
      that.setData({
        markers: wxMarkerData,
        markers_douletap:Array(wxMarkerData.length).fill(false)
      });
      that.setData({
        latitude: this.data.position.location.split(',')[0]
      });
      that.setData({
        longitude: this.data.position.location.split(',')[1]
      });
    }
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  }
})