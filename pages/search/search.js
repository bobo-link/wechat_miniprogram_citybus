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
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
    var wxMarkerData = this.data.markers
    console.log(e);
    console.log(wxMarkerData)
    that.showSearchInfo(wxMarkerData, id);
    that.changeMarkerColor(wxMarkerData, id);
  },
  onLoad: function () {
    var that = this;
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ['adcode', 'init_adcode', 'location','searchinfo'],
      actions: ["update_ad_lo"]
    });
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
          iconPath: '../../img/marker_active.png',
          iconTapPath: '../../img/marker_active.png',
          address: poiArr[i]["address"],
          telephone: poiArr[i]["telephone"],
          alpha: 1,        
        }
      }
      that.setData({
        markers: wxMarkerData
      });
      that.setData({
        latitude: this.data.location.split(',')[0]
      });
      that.setData({
        longitude: this.data.location.split(',')[1]
      });
    }
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
  changeMarkerColor: function (data, id) {
    var that = this;
    var markersTemp = [];
    for (var i = 0; i < data.length; i++) {
      if (i === id) {
        data[i].iconPath = "../../img/marker.png";
      } else {
        data[i].iconPath = "../../img/marker_active.png";
      }
      markersTemp[i] = data[i];
    }
    that.setData({
      markers: markersTemp
    });
  },
  onUnload() {
    this.storeBindings.destroyStoreBindings();
  }
})