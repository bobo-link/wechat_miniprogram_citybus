
//获取feedback 信息
const feedback_info = (param,index) => {
    let feedback = {}
    if (param && param != 'all') {
        const suffix = '/' + param
        $.ajax({
            type: "get",
            url: '/feedback' + suffix ,
            data:{index:index},
            dataType: "json",
            contentType: 'application/json;charset=UTF-8',
            // contentType:'application/x-www-form-urlencoded',
            async: false,
            success: function ({ feedback: res }) {
                Object.assign(feedback, res)
            }
        })
    } else {
        $.ajax({
            type: "get",
            url: '/feedback',
            dataType: "json",
            contentType: 'application/json;charset=UTF-8',
            // contentType:'application/x-www-form-urlencoded',
            async: false,
            success: function ({ feedback: res }) {
                console.log(res)
                if (param && param == 'all') {
                    res.forEach((item) => {
                        feedback[item.openid] = {
                            nickname: item.nickname,
                            reply: item.reply,
                            content: item.content,
                            content_length: item.content_length,
                        }
                    });
                } else {
                    res.forEach((item) => {
                        feedback = {
                            nickname: item.nickname,
                            reply: item.reply,
                            content: item.content,
                            content_length: item.content.length,
                        }
                    });
                }
            }
        });

    }
    return feedback
}
const status_change = (param) => {
    let feedback = {}
    const suffix = '/' + param['openid'] + '/' + param['index'] 
    $.ajax({
        type: "put",
        url: '/feedback' + suffix,
        dataType: "json",
        data: JSON.stringify({action:"status_change"}),
        contentType: 'application/json;charset=UTF-8',
        // contentType:'application/x-www-form-urlencoded',
        async: false,
        success: function ( res ) {
            Object.assign(feedback, res)
            console.log(res)
        }
    })

    return feedback
}
function dateformat(formatTime){
	let date=new Date(formatTime);
	let year =date.getFullYear();
	let month=date.getMonth()+1;
	month=month<10?'0'+month:month; 
	let day=date.getDay();
	day=day<10?'0'+day:day;
	let hh=date.getHours();
	hh=hh<10?'0'+hh:hh;
	let mm=date.getMinutes();
	mm=mm<10?'0'+mm:mm;
	let ss=date.getSeconds();
	ss=ss<10?'0'+ss:ss;
	return year + '-' + month + '-' + day + ' ' + hh + ':' + mm + ':' + ss;
}

function requestUrlParam(argname) {
    var url = location.href
    var arrStr = url.substring(url.indexOf("?") + 1).split("&")
    if (!argname) {
        let param = {}
        for (var i = 0; i < arrStr.length; i++) {
            param[arrStr[i].split('=')[0]] = arrStr[i].split('=')[1]
        }
        return param
    }
    for (var i = 0; i < arrStr.length; i++) {
        var loc = arrStr[i].indexOf(argname + "=")
        if (loc != -1) {
            return arrStr[i].replace(argname + "=", "").replace("?", "")
        }
    }
    return ""
}
toastr.options = { // toastr配置
    "closeButton": false, //是否显示关闭按钮
    "debug": false, //是否使用debug模式
    "progressBar": false, //是否显示进度条，当为false时候不显示；当为true时候，显示进度条，当进度条缩短到0时候，消息通知弹窗消失
    "positionClass": "toast-top-right",//显示的动画位置
    "showDuration": "400", //显示的动画时间
    "hideDuration": "1000", //消失的动画时间
    "timeOut": "1500", //展现时间
    "extendedTimeOut": "1000", //加长展示时间
    "showEasing": "swing", //显示时的动画缓冲方式
    "hideEasing": "linear", //消失时的动画缓冲方式
    "showMethod": "fadeIn", //显示时的动画方式
    "hideMethod": "fadeOut" //消失时的动画方式
}

