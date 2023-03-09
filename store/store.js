import { observable, action } from "mobx-miniprogram";
export const store = observable({
  // 数据字段
  init_adcode:'',
  adcode:'',
  weather_adcode:'',
  location:'',
  searchinfo:[],
  if_login:false,
  usr_info:{
    nickname:'',
    avatarUrl:'',
    openid:''
  },
  

  // actions
  update_ad_lo: action(function (param) {    
     param.init_adcode && (this.init_adcode = param.init_adcode)
     param.adcode && (this.adcode = param.adcode)
     param.location && (this.location = param.location)
     param.weather_adcode && (this.weather_adcode = param.weather_adcode)
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
  login_switch: action(function(){
    this.if_login =  !this.if_login
  }),
  update_usr:action(function(param){    
    param.nickname && (this.usr_info = Object.assign({}, this.usr_info, { nickname: param.nickname }))
    param.avatarUrl && (this.usr_info = Object.assign({}, this.usr_info, { avatarUrl: param.avatarUrl }))
    param.openid && (this.usr_info = Object.assign({}, this.usr_info, { openid: param.openid }))
    console.log(this.usr_info)
  })
});