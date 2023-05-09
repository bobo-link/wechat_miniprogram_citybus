// pages/feedback/feedback.js
import Notify from '@vant/weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  submit() {
    let _this = this
    if(!_this.data.text || !this.data.contact){
      Notify({
        type: 'warning',
        message: '请完整填写内容'
      });
      return
    }
    if (_this.data.limit == 0){
      Notify({
        type: 'danger',
        message: '反馈失败，反馈次数不足'
      });
      return
    }
    wx.request({
      url: wx.prefix + '/feedback' + '/' + wx.getStorageSync('usrinfo').openid,
      data:{
       uptime:new Date(),
       text:_this.data.text,
       contact:_this.data.contact
     },
      method:'POST',
      header: {
       "content-type": "application/json"
     },
      success:function({data:res}){
        if (res.statusCode == 0){
          Notify({
            type: 'success',
            message: '反馈成功'
          });
          _this.setData({
            limit:_this.data.limit -1
          })
        }
      },
      complete:function(res){
        console.log(res)
      }
    })
  },
  contact_input(e){
    this.setData({
      contact: e.detail.value
    })
  },
  textblur(e) {
    this.setData({
      text: e.detail.value
    })
  },
  textinput(e) {
    /* let intLength = 0
    let fData = e.detail.value
    for (var i = 0; i < fData.length; i++) {
      if ((fData.charCodeAt(i) < 0) || (fData.charCodeAt(i) > 255))
       intLength = intLength + 2
     else
       intLength = intLength + 1
  } */
    this.setData({
      text: e.detail.value
    })
    this.setData({
      currentWordNumber: e.detail.value.length
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.p.request({
      url: wx.prefix + '/feedback' + '/' + wx.getStorageSync('usrinfo').openid,
       method:'GET',
       data:{action:'limit'},
       header: {
        "content-type": "application/json"
      },
    }).then(({data:res})=>{
      if (res.statusCode == 0){
        this.setData({
          limit:res.limit
        })
      }else{
        this.setData({
          limit:0
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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