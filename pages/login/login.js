// pages/login/login.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    nickname: ''
  },

  onChooseAvatar(e) {
    const that = this
    const avatarUrl = wx.env.USER_DATA_PATH + '/' + e.detail.avatarUrl.split('/').pop()
    wx.getFileSystemManager().copyFile({
      srcPath:e.detail.avatarUrl,
      destPath:avatarUrl,
      success(res){
        console.log("success",res)
        that.setData({
          avatarUrl,
        })
      },
      fail(res){
        console.log("fail",res)
      }
    })
    
  },
  bindblur(e) {
    this.setData({
      nickname: e.detail.value,
    })
  },

  login_action() {
    const that = this
    console.log('data is', this.data)
    wx.p.login()
      .then((res) => {
        let data = {
          js_code: res.code,
          nickname: that.data.nickname,
          filename: that.data.avatarUrl,
          uptime: new Date()
        }
        let re = wx.p.request({
          url: wx.prefix + 'login',
          data: data,
          header: {
            "content-type": "application/json"
          },
          method: 'GET'
        }).then(({
          data: res
        }) => {
          let openid = res.openid
          console.log(res)
          //上传头像文件到服务器
          wx.uploadFile({
            url: wx.prefix + 'avatar', 
            filePath: this.data.avatarUrl,
            name: 'file',
            formData: {
              'user': 'test'
            },
            success({
              data: res
            }) {
              res_json = eval('(' + res + ')')
              console.log(res_json)
              if (res_json.status == 0){
              that.login_switch()
              that.update_usr({
                avatarUrl: that.data.avatarUrl,
                openid: openid,
                nickname: that.data.nickname,
              })
              }  
            },
            fail(res) {
              console.log('fail', res)
              //do something
            }
          })
        }, (res) => {
          //网络请求fail回调
          wx.showToast({
            title: '无法连接服务器',
            icon: 'none'
          })
        })
        re.finally((res) => {
          wx.switchTab({
            url: '/pages/setting/setting',
          })
        })
      })


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["if_login", "usrinfo"],
      actions: ["login_switch", "update_usr"]
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