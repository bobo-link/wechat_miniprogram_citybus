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
      this.update_bus_station(this.data.markers[e.detail.markerId])
      wx.navigateTo({
        url: '../../pages/buslinelist/buslinelist',
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
   
    var id = e.markerId;
    var wxMarkerData = this.data.markers
    console.log(e);
    console.log(wxMarkerData[e.detail.markerId])
    that.showSearchInfo(wxMarkerData, id);
    
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
    const routes =  wx.getStorageSync('routes')
    let polyline = []
    let z = 0
    const config =  [{},
      {
        color: "#188BF8",
        width: 4,
      },
      {},
      {
        color: "#71C425",
        width: 4,
      },
      {
        color: "#71C425",
        width: 4,
      },
      {
        color: "#F83D18",
        width: 4,
        dottedLine:true
    }]
    for (let j in routes[0].steps){
      for (let x in routes[0].steps[j]){
        let  points = (routes[0].steps[j][x].path).split(';')
        for (let i in points){
          points[i] = {
            latitude: points[i].split(',')[1],
            longitude:points[i].split(',')[0],
          }
        }
        points.unshift({
          latitude:routes[0].steps[j][x].start_location.lat,
          longitude:routes[0].steps[j][x].start_location.lng
        })
        points.push({
          latitude:routes[0].steps[j][x].end_location.lat,
          longitude:routes[0].steps[j][x].end_location.lng
        })
        polyline[z++] =Object.assign({points:points},config[routes[0].steps[j][x].vehicle_info.type]) 
      }
    }
    
    
    if (this.data.searchinfo) {     
      let wxMarkerData = []
      let poiArr = this.data.searchinfo
      for (let i = 0; i < poiArr.length; i++) {
        wxMarkerData[i] = {
          id: i,
          latitude: poiArr[i]["location"]["lat"],
          longitude: poiArr[i]["location"]["lng"],
          title: poiArr[i]["name"],
          // iconPath: '../../img/marker_active.png',
          // iconTapPath: '../../img/marker_active.png',
          address: poiArr[i]["address"],
          telephone: poiArr[i]["telephone"],
          alpha: 1,    
        }
      }
      that.setData({
        markers: wxMarkerData,
        polyline:polyline,
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