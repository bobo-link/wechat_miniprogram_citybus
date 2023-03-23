/**
 * @file 微信小程序JSAPI
 * 
 */
//const wx.prefix = 'http://47.115.213.83:8080/';

const realapi ={
      weather:'',
      geocoding:'',
      regeocoding:'',
      transit:'',
      search:'',
      detail:''
}
/**
 * 百度地图微信小程序API类
 *
 * @class
 */
class BMapWX {

  /**
   * 百度地图微信小程序API类
   *
   * @constructor
   */
  constructor(param) {
    param && (this.ak = param["ak"]);
  }

  /**
   * 使用微信接口进行定位
   *
   * @param {string} type 坐标类型
   * @param {Function} success 成功执行
   * @param {Function} fail 失败执行
   * @param {Function} complete 完成后执行
   */
  getWXLocation(type, success, fail, complete) {
    type = type || 'gcj02',
      success = success || function () {};
    fail = fail || function () {};
    complete = complete || function () {};
    wx.getLocation({
      type: type,
      success: success,
      fail: fail,
      complete: complete
    });
  }

  /**
   * POI周边检索
   *
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi
   */
  search(param) {
    var that = this;
    param = param || {};
    let searchparam = {
      query: param["query"] || '生活服务$美食&酒店',
      scope: param["scope"] || 1,
      filter: param["filter"] || '',
      coord_type: param["coord_type"] || 2,
      page_size: param["page_size"] || 10,
      page_num: param["page_num"] || 0,
      output: param["output"] || 'json',
      ak: that.ak,
      sn: param["sn"] || '',
      timestamp: param["timestamp"] || '',
      radius: param["radius"] || 2000,
      ret_coordtype: 'gcj02ll'
    };
    let otherparam = {
      iconPath: param["iconPath"],
      iconTapPath: param["iconTapPath"],
      width: param["width"],
      height: param["height"],
      alpha: param["alpha"] || 1,
      success: param["success"] || function () {},
      fail: param["fail"] || function () {}
    };
    let type = 'gcj02';
    let locationsuccess = function (result) {
      searchparam["location"] = result["latitude"] + ',' + result["longitude"];
      wx.request({
        url: 'https://api.map.baidu.com/place/v2/search',
        data: searchparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET',
        success(data) {
          let res = data["data"];
          if (res["status"] === 0) {
            let poiArr = res["results"];
            // outputRes 包含两个对象，
            // originalData为百度接口返回的原始数据
            // wxMarkerData为小程序规范的marker格式
            let outputRes = {};
            outputRes["originalData"] = res;
            outputRes["wxMarkerData"] = [];
            for (let i = 0; i < poiArr.length; i++) {
              outputRes["wxMarkerData"][i] = {
                id: i,
                latitude: poiArr[i]["location"]["lat"],
                longitude: poiArr[i]["location"]["lng"],
                title: poiArr[i]["name"],
                iconPath: otherparam["iconPath"],
                iconTapPath: otherparam["iconTapPath"],
                address: poiArr[i]["address"],
                telephone: poiArr[i]["telephone"],
                alpha: otherparam["alpha"],
                width: otherparam["width"],
                height: otherparam["height"]
              }
            }
            otherparam.success(outputRes);
          } else {
            otherparam.fail({
              errMsg: res["message"],
              statusCode: res["status"]
            });
          }
        },
        fail(data) {
          otherparam.fail(data);
        }
      });
    }
    let locationfail = function (result) {
      otherparam.fail(result);
    };
    let locationcomplete = function (result) {};
    if (!param["location"]) {
      that.getWXLocation(type, locationsuccess, locationfail, locationcomplete);
    } else {
      let longitude = param.location.split(',')[1];
      let latitude = param.location.split(',')[0];
      let errMsg = 'input location';
      let res = {
        errMsg: errMsg,
        latitude: latitude,
        longitude: longitude
      };
      locationsuccess(res);
    }
  }

  /**
   * sug模糊检索
   *
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * http://lbsyun.baidu.com/index.php?title=webapi/place-suggestion-api
   */
  suggestion(param) {
    var that = this;
    param = param || {};
    let suggestionparam = {
      query: param["query"] || '',
      region: param["region"] || '全国',
      city_limit: param["city_limit"] || false,
      output: param["output"] || 'json',
      ak: that.ak,
      sn: param["sn"] || '',
      timestamp: param["timestamp"] || '',
      ret_coordtype: 'gcj02ll'
    };
    let otherparam = {
      success: param["success"] || function () {},
      fail: param["fail"] || function () {}
    };
    wx.request({
      url: 'https://api.map.baidu.com/place/v2/suggestion',
      data: suggestionparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',
      success(data) {
        let res = data["data"];
        if (res["status"] === 0) {
          otherparam.success(res);
        } else {
          otherparam.fail({
            errMsg: res["message"],
            statusCode: res["status"]
          });
        }
      },
      fail(data) {
        otherparam.fail(data);
      }
    });
  }

  /**
   * rgc检索（逆地理编码：经纬度->地点描述）
   * 
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbs.baidu.com/index.php?title=webapi/guide/webservice-geocoding-abroad
   * 
   */
  regeocoding(param) {
    var that = this;
    param = param || {};
    let regeocodingparam = {
      coordtype: param["coordtype"] || 'gcj02ll',
      ret_coordtype: 'gcj02ll',
      radius: param["radius"] || 1000,
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
      callback: param["callback"] || function () {},
      extensions_poi: param["extensions_poi"] || 1,
      extensions_road: param["extensions_road"] || false,
      extensions_town: param["extensions_town"] || false,
      language: param["language"] || 'zh-CN',
      language_auto: param["language_auto"] || 0
    };
    let otherparam = {
      iconPath: param["iconPath"],
      iconTapPath: param["iconTapPath"],
      width: param["width"],
      height: param["height"],
      alpha: param["alpha"] || 1,
      success: param["success"] || function () {},
      fail: param["fail"] || function () {}
    };
    let type = 'gcj02';
    let locationsuccess = function (result) {
      regeocodingparam["location"] = result["latitude"] + ',' + result["longitude"];
      wx.request({
        url: 'https://api.map.baidu.com/reverse_geocoding/v3',
        data: regeocodingparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET',
        success(data) {
          let res = data["data"];
          if (res["status"] === 0) {
            let poiObj = res["result"];
            // outputRes 包含两个对象：
            // originalData为百度接口返回的原始数据
            // wxMarkerData为小程序规范的marker格式
            let outputRes = {};
            outputRes["originalData"] = res;
            outputRes["wxMarkerData"] = [];
            outputRes["wxMarkerData"][0] = {
              id: 0,
              latitude: result["latitude"],
              longitude: result["longitude"],
              address: poiObj["formatted_address"],
              iconPath: otherparam["iconPath"],
              iconTapPath: otherparam["iconTapPath"],
              desc: poiObj["sematic_description"],
              business: poiObj["business"],
              alpha: otherparam["alpha"],
              width: otherparam["width"],
              height: otherparam["height"]
            }
            otherparam.success(outputRes);
          } else {
            otherparam.fail({
              errMsg: res["message"],
              statusCode: res["status"]
            });
          }
        },
        fail(data) {
          otherparam.fail(data);
        }
      });
    };
    let locationfail = function (result) {
      otherparam.fail(result);
    }
    let locationcomplete = function (result) {};
    if (!param["location"]) {
      that.getWXLocation(type, locationsuccess, locationfail, locationcomplete);
    } else {
      let longitude = param.location.split(',')[1];
      let latitude = param.location.split(',')[0];
      let errMsg = 'input location';
      let res = {
        errMsg: errMsg,
        latitude: latitude,
        longitude: longitude
      };
      locationsuccess(res);
    }
  }

  /**
   * rgc检索（逆地理编码：经纬度->地点描述）
   * promisify
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbs.baidu.com/index.php?title=webapi/guide/webservice-geocoding-abroad
   * 
   */
  async regeocoding_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let regeocodingparam = {
      location: param['location'] || '',
      coordtype: param["coordtype"] || 'gcj02ll',
      ret_coordtype: 'gcj02ll',
      radius: param["radius"] || 1000,
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
      callback: param["callback"] || function () {},
      extensions_poi: param["extensions_poi"] || 0,
      extensions_road: param["extensions_road"] || false,
      extensions_town: param["extensions_town"] || true,
      language: param["language"] || 'zh-CN',
      language_auto: param["language_auto"] || 0
    };
    if (!param['location']) {
      return {
        errMsg: 'Param loaction is not exist'
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.regeocoding || 'regeocoding' ),
        data: regeocodingparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res;
        } else {
          console.log(regeocodingparam)
          Data = {
            errMsg: res["message"] || 'error',
            statusCode: res["status"] || -1
          };
        }
      }, (res) => {
        Data = res
        Data['statusCode'] = -1
      })
    return Data
  };

  /**
   * gc检索（地理编码：地点->经纬度）
   *
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbs.baidu.com/index.php?title=webapi/guide/webservice-geocoding
   * 
   */
  geocoding(param) {
    var that = this;
    param = param || {};
    let geocodingparam = {
      address: param["address"] || '',
      city: param["city"] || '',
      ret_coordtype: param["coordtype"] || 'gcj02ll',
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
      callback: param["callback"] || function () {}
    };
    let otherparam = {
      iconPath: param["iconPath"],
      iconTapPath: param["iconTapPath"],
      width: param["width"],
      height: param["height"],
      alpha: param["alpha"] || 1,
      success: param["success"] || function () {},
      fail: param["fail"] || function () {}
    };
    if (param["address"]) {
      wx.request({
        url: 'https://api.map.baidu.com/geocoding/v3',
        data: geocodingparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET',
        success(data) {
          let res = data["data"];
          if (res["status"] === 0) {
            let poiObj = res["result"];
            // outputRes 包含两个对象：
            // originalData为百度接口返回的原始数据
            // wxMarkerData为小程序规范的marker格式
            let outputRes = res;
            outputRes["originalData"] = res;
            outputRes["wxMarkerData"] = [];
            outputRes["wxMarkerData"][0] = {
              id: 0,
              latitude: poiObj["location"]["lat"],
              longitude: poiObj["location"]["lng"],
              iconPath: otherparam["iconPath"],
              iconTapPath: otherparam["iconTapPath"],
              alpha: otherparam["alpha"],
              width: otherparam["width"],
              height: otherparam["height"]
            }
            otherparam.success(outputRes);
          } else {
            otherparam.fail({
              errMsg: res["message"],
              statusCode: res["status"]
            });
          }
        },
        fail(data) {
          otherparam.fail(data);
        }
      });
    } else {
      let errMsg = 'input address!';
      let res = {
        errMsg: errMsg
      };
      otherparam.fail(res);
    }
  }
  /**
   * gc检索（地理编码：地点->经纬度）
   * promisify
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbs.baidu.com/index.php?title=webapi/guide/webservice-geocoding
   * 
   */
  async geocoding_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let geocodingparam = {
      address: param["address"] || '',
      city: param["city"] || '',
      ret_coordtype: param["coordtype"] || 'gcj02ll',
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
      callback: param["callback"] || function () {}
    };
    if (!param["address"]) {
      return {
        errMsg: "Param address is not exist"
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.geocoding || 'geocoding' ) ,
        data: geocodingparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res;
        } else {
          Data = {
            errMsg: res["message"],
            statusCode: res["status"]
          };
        }
      }, (res) => {
        Data = res
      })
    return Data
  }


  /**
   * 天气检索
   *
   * @param {Object} param 检索配置
   */
  weather(param) {
    var that = this;
    param = param || {};
    let weatherparam = {
      data_type: param['data_type'] || 'all',
      ak: that.ak,
      district_id: param['adcode'] || '',
      location: param['location'] || '',
    };
    let otherparam = {
      success: param["success"] || function () {},
      fail: param["fail"] || function () {},
      complete: param["complete"] || function () {}
    };
    if (!param['adcode'] && !param['location']) {
      otherparam.fail({
        errMsg: 'Param adcode or location is not exist'
      });
      return
    }
    wx.request({
      url: wx.prefix + (realapi.weather || 'weather' ),
      data: weatherparam,
      header: {
        "content-type": "application/json"
      },
      method: 'GET',
      success({
        data: res
      }) {
        if (res["status"] === 0 && res["message"] === 'success') {
          otherparam.success(res);
        } else {
          otherparam.fail({
            errMsg: res["message"],
            statusCode: res["status"]
          });
        }
      },
      fail(data) {
        otherparam.fail(data);
      },
      complete(data) {
        otherparam.complete(data)
      }
    });
  }

  /**
   * 天气检索
   *
   * @param {Object} param 检索配置
   */
  async weather_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let weatherparam = {
      data_type: param['data_type'] || 'all',
      ak: that.ak,
      district_id: param['adcode'] || '',
      location: param['location'] || '',
    };
    if (!param['adcode'] && !param['location']) {
      return {
        errMsg: 'Param adcode or location is not exist'
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.weather || 'weather' ),
        data: weatherparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res
        } else {
          Data = {
            errMsg: res["message"],
            statusCode: res["status"]
          };
        }
      }, (res) => {
        Data = res
      })
    return Data
  }
  /**
   * 路线规划
   *
   * @param {Object} param 检索配置
   */
  async transit_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let transitparam = {
      origin: param['origin'] || '',
      destination: param['destination'] || '',
      origin_uid: param['origin_uid'] || '',
      destination_uid: param['destination_uid'] || '',
      coord_type: param['coord_type'] || 'gcj02',
      tactics_incity: param['tactics_incity'] || 3,
      ret_coordtype: param['ret_coordtype'] || 'gcj02',
      ak: that.ak,
    };
    if (!param['origin'] || !param['destination']) {
      return {
        errMsg: 'Param origin or destination is not exist'
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.transit || 'transit' ),
        data: transitparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res
        } else {
          Data = {
            errMsg: res["message"] || 'network error',
            statusCode: res["status"] || -1
          };
        }
      }, (res) => {
        Data = res
        Data["statusCode"] = -1
      })
    return Data
  }
  /**
   * 地点检索
   * promisify
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi
   * 
   */
  async search_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let searchparam = {
      location: param['location'] || '',
      query: param['query'] || '',
      tag: param['tag'] || '公交车站',
      radius: param['radius'] || 1000,
      radius_limit: param['radius_limit'] || true,
      scope:param['scope'] || 2,
      coordtype: param["coordtype"] || 'gcj02ll',
      ret_coordtype: 'gcj02ll',
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
      
    };
    if (!param['query'] || !param['location']) {
      return {
        errMsg: 'Param query and location is not exist'
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.search || 'search' ),
        data: searchparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res;
        } else {
          Data = {
            errMsg: res["message"] || 'error',
            statusCode: res["status"] || -1
          };
        }
      }, (res) => {
        Data = res
      })
    return Data
  };
  /**
   * 地点详情检索
   * promisify
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi
   * 
   */
  async detail_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let searchparam = {
      uid:param['uid'] || '',
      scope:param['scope'] || 2,
      coordtype: param["coordtype"] || 'gcj02ll',
      ret_coordtype: 'gcj02ll',
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
    };
    if(param['uids']){
      searchparam.uids = param['uids'].join(',')
    }
    if (!param['uid'] && !param['uid']) {
      return {
        errMsg: 'Param uid or uids is not exist'
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.detail || 'detail' ),
        data: searchparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res;
        } else {
          Data = {
            errMsg: res["message"] || 'error',
            statusCode: res["status"] || -1
          };
        }
      }, (res) => {
        Data = res
      })
    return Data
  };
  /**
   *输入提示
   * promisify
   * @param {Object} param 检索配置
   * 参数对象结构可以参考
   * https://lbs.baidu.com/index.php?title=webapi/place-suggestion-api
   */
  async suggestion_promisify(param) {
    var that = this;
    let Data = null;
    param = param || {};
    let suggestionparam = {
      location: param['location'] || '',
      query: param['query'] || '',
      region: param['region'] || '',
      city_limit:param["city_limit"] || true,
      coordtype: param["coordtype"] || 'gcj02ll',
      ret_coordtype: 'gcj02ll',
      ak: that.ak,
      sn: param["sn"] || '',
      output: param["output"] || 'json',
      
    };
    if (!param['query'] || !param['region']) {
      return {
        errMsg: 'Param query and region is not exist'
      }
    }
    await wx.p.request({
        url: wx.prefix + (realapi.suggestion || 'suggestion' ),
        data: suggestionparam,
        header: {
          "content-type": "application/json"
        },
        method: 'GET'
      })
      .then(({
        data: res
      }) => {
        if (res["status"] === 0) {
          Data = res;
        } else {
          Data = {
            errMsg: res["message"] || 'error',
            statusCode: res["status"] || -1
          };
        }
      }, (res) => {
        Data = res
      })
    return Data
  };

  /**
   * 收藏同步
   * 该接口应有4种模式在data中由 method 关键字指定
   * method 有效值：
   *  add 添加一个收藏条目  
   *  del 删除一个收藏条目
   *  get 获取收藏数据
   *  ver 校验本地收藏数据是否有效
   */
  async collectSync(param){
    let Data = null;
    let data_param = {
      ...param,
      openid: wx.getStorageSync('usrinfo').openid,
    }
    if (param.method == 'add' || param.method == 'del'){
      var uptime = new Date()
      data_param.uptime = uptime
    }
    await wx.p.request({
      url: wx.prefix + 'collectsync',
      data:data_param,
      header: {
        "content-type": "application/json"
      },
      method: 'GET'
    }).then(({
      data: res
    }) => {
      if (res.statusCode == 0 && res.db_data && res.db_data.nModified && res.db_data.nModified >0){
        wx.setStorageSync('collect_time', uptime)
      }
      Data = res
    }, (res) => {
      Data = res
    })
    return Data
  };
  
}
module.exports.BMapWX = BMapWX;