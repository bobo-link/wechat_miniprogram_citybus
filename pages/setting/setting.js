// pages/setting/setting.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    if_login: false // 如需尝试获取用户信息可改为false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["if_login","usrinfo"],
      actions: ["login_switch","update_usr"]
    });
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
    console.log('onshow')    
    this.storeBindings.updateStoreBindings();
    this.setData({
      'usrinfo.avatarUrl' : this.data.usrinfo.avatarUrl
    })
    console.log(this.data.usrinfo)
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
    this.storeBindings.destroyStoreBindings();
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.storeBindings.updateStoreBindings();
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
    return {
      title: '自定义转发标题',
      path: '/pages/index/index',

    }
  },
  getUserProfile(e) {
    const that = this
    wx.p.login().
    then((res)=>{
      wx.p.request({
        url: wx.prefix + 'login_check',
        data:{js_code: res.code},
        header: {
          "content-type": "application/json"
        },
        method: 'GET',
      }).then(({data:res})=>{
        console.log(res)
        let data = res
        if (res.status == undefined){
          console.log(!res.status)
          wx.showToast({
            title: '无法连接服务器',
            icon:'none'
          })
          return
        }
        if(res.status == 0){
          wx.p.showModal({
            title: '提示',
            content: '是否修改个人信息',   
            confirmText:'是',
            cancelText: '否'        
          }).then((res)=>{
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            } else if (res.cancel) {
              // 从服务器拉取个人信息并持久化存储，切换登入状态
              let usrinfo = {...data.usrinfo}
              usrinfo['avatarUrl'] = wx.env.USER_DATA_PATH + '/' +usrinfo.avatarUrl;
              wx.setStorageSync('usrinfo',usrinfo)
              this.update_usr(wx.getStorageSync('usrinfo'))
              let file = wx.getFileSystemManager()
              this.storeBindings.updateStoreBindings()
              
              try {               
                file.accessSync(usrinfo['avatarUrl'])
              } catch (error) {
                console.log(error)
                wx.downloadFile({
                  url: wx.prefix + 'download_avatar'+'?openid='+ data.usrinfo.openid,
                  filePath:wx.env.USER_DATA_PATH +'/'+ data.usrinfo.avatarUrl,
                  success(res){
                    console.log(res)
                    that.login_switch()
                  },
                  fail(res){
                    console.log(res)
                  }
                })
              }
            }
          })
        }else if(res.status === 101){
          wx.showToast({
            title: '无法连接服务器',
            icon:'none'
          })  
        }else{
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      },(res)=>{
        wx.showToast({
          title: '无法连接服务器',
          icon:'none'
        })
      })
    })
    
  },
  logout(e){
    wx.p.showModal({
      title: '提示',
      content: '确认注销',
      
    }).then((res)=>{
      if (res.confirm) {
        this.login_switch()
        this.storeBindings.updateStoreBindings()
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    })
    
  },
  bindViewTap(e) {
    this.setData({
      if_login: true
    })
  }
})