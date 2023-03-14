// Components/dialog/dialog.js
Component({
  options: {
      /**
          styleIsolation 选项从基础库版本 2.6.5 开始支持。它支持以下取值：
              isolated 表示启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响（一般情况下的默认值）；
              apply-shared 表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面；
              shared 表示页面 wxss 样式将影响到自定义组件，自定义组件 wxss 中指定的样式也会影响页面和其他设置了 apply-shared 或 shared 的自定义组件。（这个选项在插件中不可用。）
       */
      styleIsolation: 'isolated'
  },
  /**
   * 组件的属性列表
   */
  properties: {
      showcancelButton:{
        type:Boolean,
        value:false
      },
      cancelButtonText: {
          type: String,
          value: '取消'
      },
      confirmButtonText: {
          type: String,
          value: '确定'
      },
      message: {
          type: String,
          value: ''
      },
      show: {
          type: Boolean,
          value: false,
      },
      confirmCallback: null,
      cancelCallback: null,
  },
  /**
   * 组件的初始数据
   */
  data: {
      windowWidth: 0,
      windowHeight: 0,
  },
  /**
   * 生命周期函数
   */
  ready: function() {
      var _this = this;
      wx.getSystemInfo({
          success: function(res) {
              _this.setData({
                  windowWidth: res.windowWidth,
                  windowHeight: res.windowHeight,
              });
          }
      });
  },
  /**
   * 组件的方法列表
   */
  methods: {
      onConfirm() {
          if (this.properties.confirmCallback) {
              this.properties.confirmCallback();
          }
          this.setData({ show: false });
      },
      onCancel() {
          if (this.properties.cancelCallback) {
              this.properties.cancelCallback();
          }
          this.setData({ show: false });
      },
  }
});

