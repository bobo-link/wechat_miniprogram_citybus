// pages/transit/transit.js
var animation
import Dialog from '../../libs/dialog';
import Action_sheet from '../../libs/action-sheet';
var bmap = require('../../libs/bmap-wx.js');
const tools = require('~/utils/util.js')
const BMap = new bmap.BMapWX();
var target
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show:false,
    actions:[
      {name:'从这出发',className:'_btn'},
      {name:'到这里去',className:'_btn'},
      {name:'删除',className:'_btn'}
    ],
    startpoint:{
      name:'输入起点'
    },
    endpoint:{
      name:'输入终点'
    },
    home:{
      name:'设置一个地址'
    },
    company:{
      name:'设置一个地址'
    },
    animation: '',
    flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let home = wx.getStorageSync('home')
    let company = wx.getStorageSync('company')
    home && this.setData({
      home:home
    })
    company && this.setData({
      company:company
    })
  },
    
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
  get_place(e){
    const data = e.currentTarget.dataset
    switch (data.which) {
      case 'StartPoint':
        this.chooselocation((res)=>{
          console.log(res)
          this.setData({
            startpoint: res['formatdata']
          })
        }); break;
      case 'EndPoint':
        this.chooselocation((res)=>{
          console.log(res)
          this.setData({
            endpoint: res['formatdata']
          })
        }); break; 
      case 'home':
        if (!this.data.home.location){
          this.chooselocation((res)=>{
            if (res.name == ''){
              wx.showToast({
                title: '请选择具体位置',             
                icon: 'none',
              })
            }else{
              this.setData({
                home: res['formatdata']
              })
              wx.setStorageSync('home',res['formatdata'])
            }
          })
        }else{
          this.setData({
            show:true
          })
          target = 'home'
        }; break; 
      default:
        if (!this.data.company.location){
          this.chooselocation((res)=>{
            if (res.name == ''){
              wx.showToast({
                title: '请选择具体位置',             
                icon: 'none',
              })
            }else{
              this.setData({
                company: res['formatdata']
              })
              wx.setStorageSync('company',res['formatdata'])
            }
          })
        }else{
          this.setData({
            show:true
          })
          target = 'company'
        }; break; 
    }
  },
  chooselocation(fun1 = undefined,fun2 = undefined){
    wx.p.chooseLocation()
      .then((res) => {
        res['formatdata'] ={
          location: res.latitude + ',' + res.longitude,
          name: res.name || '我的位置',
          address: res.address
        }
        fun1 && fun1(res)
      },(res)=>{
        fun2 && fun2(res)
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
      // BMap.transit_promisify({
      //   origin: this.data.startpoint.location,
      //   destination: this.data.endpoint.location,
      // }).then((res) => {
      //   console.log(res)
      //   wx.setStorageSync('route', res.result)
      // })
      wx.navigateTo({
        url: '/pages/transit_list/transit_list?origin=' + JSON.stringify(this.data.startpoint) + '&destination=' + JSON.stringify(this.data.endpoint),
      })
    }
  },
  onClose(){
    this.setData({
      show:false
    })
  },
  onSelect(e){
    const b ={"home" : (res)=>{
      switch (res) {
        case 1:
          this.setData({
            startpoint:{...this.data.home}
          })
          break;
        case 2:
          this.setData({
            endpoint:{...this.data.home}
          })
          break;
        default:
          this.setData({
            home:Object.assign({},{name:'设置一个地址'})
          })
          wx.removeStorageSync('home')
          break;
      }
    },"company":(res)=>{
      console.log(res)
      switch (res) {
        case 1:
          this.setData({
            startpoint:{...this.data.company}
          })
          break;
        case 2:
          this.setData({
            endpoint:{...this.data.company}
          })
          break;
        default:
          this.setData({
            company:Object.assign({},{name:'设置一个地址'})
          })
          wx.removeStorageSync('company')
          break;
      }
    }}
    const a = {"从这出发" :()=>{b[target](1)},"到这里去":()=>{b[target](2)},"删除":()=>{b[target](3)}}
    console.log(e.detail.name)
    a[e.detail.name]()
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