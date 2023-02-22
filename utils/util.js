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
    case '阴':
      return "yintian"
    case "小雨" :
    case "小到中雨":
      return "xiaoyu"
    case "多云":
      return "duoyun"
    case "阵雨":
      return "zhenyu"
    default :
      return "qingtian"
  }
}
module.exports = {
  formatTime,
  getweather_icon
}
