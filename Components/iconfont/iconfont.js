Component({
  properties: {
    // fankui | wodefankui | shuaxin | price | chazhao | jiantou_shangxiaqiehuan | huoche | gongjiao | buxing | shanchu | luxian | jinrujiantou | gongjiaozhanpai | error | qingtian | duoyun | yintian | zhenyu | baoyu | dabaoyu | leizhenyujibanyoubingbao | tedabaoyu | xiaoyu | dayu | leizhenyu | yujiaxue | zhongyu | daxue | xiaoxue | zhongxue | zhenxue | baoxue | qiangshachenbao | fuchen | wu | shachenbao | dongyu | yangsha | mai
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer: function(color) {
        this.setData({
          colors: this.fixColor(),
          isStr: typeof color === 'string',
        });
      }
    },
    size: {
      type: Number,
      value: 140,
      observer: function(size) {
        this.setData({
          svgSize: size / 750 * wx.getSystemInfoSync().windowWidth,
        });
      },
    },
  },
  data: {
    colors: '',
    svgSize: 140 / 750 * wx.getSystemInfoSync().windowWidth,
    quot: '"',
    isStr: true,
  },
  methods: {
    fixColor: function() {
      var color = this.data.color;
      var hex2rgb = this.hex2rgb;

      if (typeof color === 'string') {
        return color.indexOf('#') === 0 ? hex2rgb(color) : color;
      }

      return color.map(function (item) {
        return item.indexOf('#') === 0 ? hex2rgb(item) : item;
      });
    },
    hex2rgb: function(hex) {
      var rgb = [];

      hex = hex.substr(1);

      if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }

      hex.replace(/../g, function(color) {
        rgb.push(parseInt(color, 0x10));
        return color;
      });

      return 'rgb(' + rgb.join(',') + ')';
    }
  }
});
