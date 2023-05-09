// pages/feedback_history/feedback_history.js
import Dialog from '../../libs/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  reply(e){
    Dialog.confirm({
      title:'回复',
      message: this.data.feedback[e.currentTarget.dataset.index].reply,
      selector: '#cus-dialog',
      confirmCallback: function () {
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.p.request({
      url: wx.prefix + 'feedback' + '/' + wx.getStorageSync('usrinfo').openid,
      method:'GET',
      data:{action:'all'},
      header: {
       "content-type": "application/json"
     }
    }).then(({data:res})=>{
      if(res.statusCode == 0 && res.feedback){
        this.setData({
          feedback:res.feedback.content
        })
      }else{
        this.setData({
          feedback:null
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