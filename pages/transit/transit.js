// pages/transit/transit.js
var animation
import Dialog from '../../libs/dialog';
var bmap = require('../../libs/bmap-wx.js');
const tools = require('~/utils/util.js')
const BMap = new bmap.BMapWX();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startpoint:{
      name:'输入起点'
    },
    endpoint:{
      name:'输入终点'
    },
    animation: '',
    flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.animation = wx.createAnimation({
      // 动画持续时间，单位ms，默认值 400
      duration: 200,
      timingFunction: 'linear',
      // 延迟多长时间开始
      delay: 100,
    })
  },
  switch_wrap() {
    if (this.animation == undefined) {
      this.animation = wx.createAnimation({
        // 动画持续时间，单位ms，默认值 400
        duration: 200,
        timingFunction: 'linear',
        // 延迟多长时间开始
        delay: 100,
      })
    }
    if (this.data.flag) {
      this.animation.rotateZ(180).step()
    } else {
      this.animation.rotateZ(0).step()
    }
    let tmp = {
      ...this.data.startpoint
    }
    this.setData({
      //输出动画
      flag: !this.data.flag,
      animation: this.animation.export(),
      startpoint: {
        ...this.data.endpoint
      },
      endpoint: {
        ...tmp
      }
    })
  },
  get_StartPoint() {
    wx.p.chooseLocation()
      .then((res) => {
        console.log(res)
        this.setData({
          startpoint: {
            location: res.latitude + ',' + res.longitude,
            name: res.name || '我的位置',
            address: res.address
          }
        })
      },(res)=>{
        console.log(res)
      })
  },
  get_EndPoint() {
    wx.p.chooseLocation().then((res) => {
      this.setData({
        endpoint: {
          location: res.latitude + ',' + res.longitude,
          name: res.name || '我的位置',
          address: res.address
        }
      })
    })
  },
  search() {
    const that = this
    let message = undefined
    if (!this.data.endpoint.location) {
      message = "请输入终点";      
    } else if (this.data.endpoint.location == this.data.startpoint.location) {
      message = "起点与终点不能相同"
    }
    if (message) {
      Dialog.confirm({
        message: message,
        selector: '#cus-dialog',
        confirmCallback: function () {
          console.log('确认啦');
        }
      });
    } else {
      BMap.transit_promisify({
        origin: this.data.startpoint.location,
        destination: this.data.endpoint.location,
      }).then((res) => {
        console.log(res)
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})