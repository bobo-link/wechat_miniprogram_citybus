const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const getweather_icon = function(weather) {
  switch (weather) {
    case "阴":
      return "yintian"
    case "阵雨":
      return "zhenyu"
    case "雷阵雨":
      return "leizhenyu"
    case "雷阵雨伴有冰雹":
      return "leizhenyujibanyoubingbao"
    case "雨夹雪":
      return "yujiaxue"
    case "小雨" :
    case "小到中雨":
      return "xiaoyu"
    case "中雨":
      return "zhongyu"
    case "雾":
      return "wu"
    case "浮尘":
      return "fuchen"
    case "霾":
      return "mai"
    case "多云":
      return "duoyun"
    case "阵雨":
      return "zhenyu"
    default :
      return "qingtian"
  }
}
const adcode_back = function(param){
  param[-1] = 0
  param[-2] = 0
  return param
}
const unique_list = function (arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
      console.log('错误！')
      return arr
  }
  var array = [arr[0]];
  var flag = true;
  var index = 1
  for (var i = 1; i < arr.length; i++) {    // 首次遍历数组
    for  (var j = 0; j < array.length; j++){
      if (arr[i].name == array[j].name) {   // 判断索引有没有等于
        flag = false
        break
      }     
    }
    if (flag) {array[index++] = arr[i];}
    flag = true
  }
  return array
}
const isEmptyObject =  function (obj){
  if (obj === undefined){
    return false
  }
  for (var i in obj) { // 如果不为空，则会执行到这一步，返回true
    return true
}
  return false
}

module.exports = {
  formatTime,
  getweather_icon,
  adcode_back,
  unique_list,
  
}
