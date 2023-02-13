// pages/practice/shoplist/shoplist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    query:{},
    page:1,
    pagesize:10,
    total:0,
    shoplist:[],
    isloading: false,//节流阀,防止数据一次性多次加载
  },

  getshoplist(param){
    this.setData({
      isloading:true
    })
    wx.showLoading({
      title: '数据加载中',
    })
    wx.request({
      url: `https://applet-base-api-t.itheima.net/categories/${this.data.query.id}/shops`,
      method:"GET",
      data:{
        _page:this.data.page,
        _limit:this.data.pagesize,
      },
      success:(res)=>{
        //console.log(res)
        this.setData({
          shoplist:[...this.data.shoplist,...res.data],
          total:res.header["X-Total-Count"] - '0'
        })
      },
      complete:(res)=>{
        wx.hideLoading()
        this.setData({
          isloading:false
        })
        param &&param()
      }
    })
  },
  spd(){
    wx.stopPullDownRefresh()
    console.log("停止下拉刷新")
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      query:options
    })
    this.getshoplist()
  },

 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: this.data.query.title,
    })
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
    this.setData({
      page:1,
      total:0,
      shoplist:[]
    })
    this.getshoplist(this.spd)
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.page * this.data.pagesize >= this.data.total) {
      return wx.showToast({
        title: '数据加载完毕',
        icon:'none'
      })
    }
    if (this.data.isloading) return
    this.setData({
      page:this.data.page + 1,
    })
    this.getshoplist(this.pull)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})