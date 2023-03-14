// app.js
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "~/store/store";
import {promisifyAll} from 'miniprogram-api-promise'
const wxp = wx.p = {}
const prefix = wx.prefix = 'http://192.168.123.199:59/';
promisifyAll(wx,wxp)
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    const { statusBarHeight, platform } = wx.getSystemInfoSync()
    const { top, height } = wx.getMenuButtonBoundingClientRect()

    // 状态栏高度
    wx.setStorageSync('statusBarHeight', statusBarHeight)
    // 胶囊按钮高度 一般是32 如果获取不到就使用32
    wx.setStorageSync('menuButtonHeight', height ? height : 32)
    
    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {
        const navigationBarHeight = (top - statusBarHeight) * 2 + height
        // 导航栏高度
        wx.setStorageSync('navigationBarHeight', navigationBarHeight)
    } else {
        wx.setStorageSync(
          'navigationBarHeight',
          platform === 'android' ? 48 : 40
        )
    }
    this.storeBindings = createStoreBindings(this, {
      store,
      actions: ["login_switch", "update_usr"]
    });
    /* wx.setStorageSync('usrinfo',{
      openid: 'ozMCH5XJmo1VZ6mnT1eC3utoVOx8',
      unionid: '',
      avatarUrl: 'wxfile://tmp_e311f78dd2a993c4fa92a38f63cfdd6a.jpg',
      nickname: '文科生'
    }) */
    let usrinfo = wx.getStorageSync('usrinfo')
      if (usrinfo){
        console.log(usrinfo)
        this.update_usr(usrinfo)
        this.storeBindings.updateStoreBindings()              
        try {               
          wx.getFileSystemManager().accessSync(usrinfo['avatarUrl'])
          console.log("avatar exist")
          this.login_switch()
          this.storeBindings.destroyStoreBindings()
        } catch (error) {
          wx.downloadFile({
            url: wx.prefix + 'download_avatar'+'?openid='+ usrinfo.openid,
            filePath: usrinfo.avatarUrl,
            success(res){
              console.log(res)  
              this.login_switch()            
            },
            fail(res){
              console.log(res)
              wx.showToast({
                title: '无法连接服务器',
                icon:'none'
              })
            },
            complete(res){
              this.storeBindings.destroyStoreBindings()
            }
          })
        }  
      }
    
  },
  globalData: {
    userInfo: null
  }
})
