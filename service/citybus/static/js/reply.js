
//获取指定用户反馈数据
let info = feedback_info(requestUrlParam('openid'),requestUrlParam('index'))[0]
console.log(info)
let content = info.content
const index = requestUrlParam('index')
const openid = requestUrlParam('openid')
//查看当前反馈状态，并发送状态更新请求
if (content.status == 0) {
    status_change({
        'index': index,
        'openid':openid
    })
}
// console.log(new Date(content.uptime))
//显示用户反馈信息
$(".codrops-header__tagline").text(info.nickname)
$("#contact").text(content.contact)
$("#mesaage").text(content.text)
$("#uptime").text(dateformat(content.uptime))
content.reply && $("#reply").text(content.reply)

//拦截表单提交动作，复写请求
$(".form-report").submit(function(e){
    e.preventDefault();
    const suffix = '/' + openid + '/' + index
    $.ajax({
        type: "put",
        url: '/feedback' + suffix,
        dataType: "json",
        data: JSON.stringify({ action: 'reply', reply:$("#reply").val()}) ,
        contentType: 'application/json;charset=UTF-8',
        // contentType:'application/x-www-form-urlencoded',
        async: false,
        success: function (res) {
            if (res.statusCode == 0){
                toastr.success("回复成功！")
            }else{
                toastr.error("回复失败，内容相同！")
            }
            console.log(res)
            
        }
    });
})