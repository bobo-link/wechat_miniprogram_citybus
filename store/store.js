import { observable, action } from "mobx-miniprogram";
export const store = observable({
  // 数据字段
  init_adcode:'',
  adcode:'',
  location:'',
  init_location:'',
  
  

  // actions
  update_ad_lo: action(function (param) {    
     param.init_adcode && (this.init_adcode = param.init_adcode)
     param.init_location && (this.init_location = param.init_location)
     param.adcode && (this.adcode = param.adcode)
     param.location && (this.location = param.location)
  }),
});