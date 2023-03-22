import { observable, action } from "mobx-miniprogram";
export const store = observable({
  // 数据字段
  position:{
    init_adcode:'',
    adcode:'',
    location:'',
    weather_adcode:'',
    desc:'',
  },
  location:'',
  searchinfo:[],
  if_login:false,
  usrinfo:{
    nickname:'',
    avatarUrl:'',
    openid:''
  },
  route:{},
  init_sign:false,
  bus_station:{},
  login_msg_fuse:true,
  collect:[],

  // actions
  update_position: action(function (param) {   
     let tmp = {} 
     param.init_adcode && (tmp['init_adcode'] = param.init_adcode)
     param.adcode && (tmp['adcode'] = param.adcode)
     param.location && (tmp['location'] = param.location)
     param.weather_adcode && (tmp['weather_adcode'] = param.weather_adcode)
     param.desc && (tmp['desc'] = param.desc)
     this.position = Object.assign({},this.position,tmp)
  }),
  check_status: action(function(param){
    if (param == this.init_adcode){
      return true
    }else{
      return false
    }
  }),
  update_searchinfo: action(function(param){
    this.searchinfo = param
  }),
  login_switch: action(function(bool){
    this.if_login =  bool
  }),
  update_usr:action(function(param){    
    param.nickname && (this.usrinfo = Object.assign({}, this.usrinfo, { nickname: param.nickname }))
    param.avatarUrl && (this.usrinfo = Object.assign({}, this.usrinfo, { avatarUrl: param.avatarUrl }))
    param.openid && (this.usrinfo = Object.assign({}, this.usrinfo, { openid: param.openid }))
  }),
  update_route:action(function(param){
    param && (this.route = param)
  }),
  switch_init_sign:action(function(param){
    if (param == undefined) {
      this.init_sign = true
      return
    }
    this.init_sign = false
    return
  }),
  update_bus_station:action(function(bus_station){
    this.bus_station = bus_station
  }),
  updata_login_msg_fuse:action(function(bool){
    console.log(bool)
    this.login_msg_fuse = bool
  }),
  update_collect:action(function(){
    const a1 = wx.getStorageSync('station')
    const a2 = wx.getStorageSync('buslines')
    const a3 = wx.getStorageSync('route')
    let collect_all = []
    collect_all.push(...a1,...a2,...a3)
    collect_all.sort((a,b)=>{
        return (a.uptime > b.uptime ? 1:-1) || 0
    })
    this.collect = collect_all
  })
});