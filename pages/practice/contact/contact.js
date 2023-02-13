// pages/practice/contact/contact.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorList:[],
    isloading: false,//节流阀,防止数据一次性多次加载
  },
  getcolor(){
    this.setData({
      isloading:true
    })
    wx.showLoading({
      title: '数据加载...',
    })
    wx.request({
      url:'https://www.escook.cn/api/color',
      method:'GET',
      success:({data:res})=>{
        //console.log(res)
        this.setData({
            colorList:[...this.data.colorList,...res.data],
        })
      },
      complete:(res)=>{
        //console.log(res)
        wx.hideLoading()
        this.setData({
          isloading:false
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getcolor()
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
    if(this.data.isloading) return
    console.log("上拉触底")
    this.getcolor()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})