const defaultOptions = {
  show: false,
  message: '',
  selector: '#cus-dialog',
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  confirmCallback: null,
  cancelCallback: null,
};
let currentOptions = Object.assign({}, defaultOptions);
function getContext() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}
const Dialog = (options) => {
  options = Object.assign(Object.assign({}, currentOptions), options);
  const context = options.context || getContext();
  const dialog = options.dialog || context.selectComponent(options.selector);
  delete options.context;
  delete options.selector;
  if (dialog) {
      dialog.setData(options);
      wx.nextTick(() => {
          dialog.setData({ show: true });
      });
  }
  else {
      console.warn('未找到 cus-dialog 节点，请确认 selector 及 context 是否正确');
  }
};
Dialog.confirm = (options) => Dialog(Object.assign({ showCancelButton: true }, options));
export default Dialog;

