// pages/setting/setting.js
import {
  createStoreBindings
} from "mobx-miniprogram-bindings";
import {
  store
} from "~/store/store";
import Notify from '@vant/weapp/notify/notify';
var fuse = true
var bmap = require('../../libs/bmap-wx.js');
const tools = require('../../utils/util.js')
const BMap = new bmap.BMapWX();
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
      fields: ["if_login", "usrinfo", "login_msg_fuse"],
      actions: ["login_switch", "update_usr", "updata_login_msg_fuse", "update_collect"]
    });
    this.storeBindings.updateStoreBindings()
    if (!this.data.if_login) {
      Notify({
        type: 'primary',
        message: '点击头像框登录'
      });
    }
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
    this.storeBindings.updateStoreBindings();
    if (this.data.if_login && this.data.login_msg_fuse) {
      Notify({
        type: 'success',
        message: '登录成功'
      });
      this.updata_login_msg_fuse(false)
    }

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
  onShareAppMessage(e) {
    return {
      title: '自定义转发标题',
      path: '/pages/index/index',

    }
  },
  getUserProfile(e) {
    if (!fuse) {
      return
    }
    fuse = false
    const that = this

    setTimeout(() => {
      fuse = true
    }, 1000)
    wx.p.login().
    then((res) => {
      wx.p.request({
        url: wx.prefix + 'login_check',
        data: {
          js_code: res.code
        },
        header: {
          "content-type": "application/json"
        },
        method: 'GET',
      }).then(({
        data: res
      }) => {
        console.log(res)
        let data = res
        if (res.status == undefined) {
          console.log(!res.status)
          wx.showToast({
            title: '无法连接服务器',
            icon: 'none'
          })
          return
        }
        if (res.status == 0) {
          wx.p.showModal({
            title: '提示',
            content: '是否修改个人信息',
            confirmText: '是',
            cancelText: '否'
          }).then((res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            } else if (res.cancel) {
              // 从服务器拉取个人信息并持久化存储，切换登入状态
              let usrinfo = {
                ...data.usrinfo
              }
              usrinfo['avatarUrl'] = wx.env.USER_DATA_PATH + '/' + usrinfo.avatarUrl;
              wx.setStorageSync('usrinfo', usrinfo)
              this.update_usr(wx.getStorageSync('usrinfo'))
              this.storeBindings.updateStoreBindings()
              try {
                //判断文件是否存在，不存在抛出异常
                wx.getFileSystemManager().accessSync(usrinfo['avatarUrl'])              
              } catch (error) {
                //文件不存在，从服务器拉取文件
                wx.downloadFile({
                  url: wx.prefix + 'download_avatar' + '?openid=' + this.data.usrinfo.openid,
                  filePath: this.data.usrinfo.avatarUrl,
                  success(res) {
                    console.log(res)
                  },
                  fail(res) {
                    console.log(res)
                  }
                })
              }finally{
                that.login_switch(true)
                Notify({
                  type: 'success',
                  message: '登录成功'
                });
                this.updata_login_msg_fuse(false)
                tools.collectver().then(res => {
                  if (res) {  
                    tools.collectSync().then(res=>{
                      this.update_collect()
                    })  
                  }
                })
              }
            }
          })
        } else if (res.status === 101) {
          wx.showToast({
            title: '无法连接服务器',
            icon: 'none'
          })
        } else {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }, (res) => {
        wx.showToast({
          title: '无法连接服务器',
          icon: 'none'
        })
      })
    })

  },
  logout(e) {
    wx.p.showModal({
      title: '提示',
      content: '确认注销',

    }).then((res) => {
      if (res.confirm) {
        this.login_switch(false)
        this.storeBindings.updateStoreBindings()
        wx.removeStorageSync("usrinfo")
        this.updata_login_msg_fuse(true)
        Notify({
          type: 'warning',
          message: '注销成功'
        });
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    })

  },
  bindViewTap(e) {
    this.setData({
      if_login: true
    })
  },

})