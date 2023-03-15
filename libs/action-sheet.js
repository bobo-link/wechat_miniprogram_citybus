const defaultOptions = {
  show: false,
  actions:[
    {name:'从这出发',className:'_btn'},
    {name:'到这里去',className:'_btn'},
    {name:'删除',className:'_btn'}
  ],
  selector: '#van-action-sheet',
 
};
let currentOptions = Object.assign({}, defaultOptions);
function getContext() {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
}
const Action_sheet = (options) => {
  options = Object.assign(Object.assign({}, currentOptions), options);
  const context = options.context || getContext();
  const action = options.dialog || context.selectComponent(options.selector);
  delete options.context;  
  if (action) {
     
      action.setData(options);
      wx.nextTick(() => {
          action.setData({ show: true });
          console.log(action.data)
      });
  }
  else {
      console.warn('未找到 ' + options.selector + ' 节点，请确认 selector 及 context 是否正确');
  }
  delete options.selector;
};
Action_sheet.confirm = (options) => Action_sheet(Object.assign({ showCancelButton: true }, options));
export default Action_sheet;

