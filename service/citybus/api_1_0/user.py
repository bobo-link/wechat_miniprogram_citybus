#coding:utf-8
from . import CurrentConfig,api,headers
from citybus.utils import format_dict
from flask import Flask, Response,request,make_response,jsonify
from dateutil import parser
import requests
from citybus import db
import pymongo
import os

appid = CurrentConfig.WX_APPID
secret = CurrentConfig.WX_SECRET

@api.route('/login')
def login():      
    data = format_dict(request.args.to_dict())
    new_data = {
        "appid" : appid,
        "secret": secret,
        "grant_type": "authorization_code"
    }
    new_data['js_code'] = data['js_code']
    #请求微信API用js_code换取用户openid和unionid
    response = requests.post('https://api.weixin.qq.com/sns/jscode2session',params=new_data,headers=headers).json()
    if response and ('errcode' in response):
        return response
    else:
        res = {}
        res['unionid'] = ''
        if 'unionid' in response:
            res['unionid'] = response['unionid']
        res['openid'] = response['openid']
    #连接moggodb usrinfo表
    try:
        if list(db.usrinfo.find({"openid":res['openid']})) == []:        
            db.usrinfo.insert_one({ 'openid': res['openid'], 'unionid': res['unionid'], 'uptime': parser.isoparse(eval(data['uptime'])), 'nickname': data['nickname'], 'avatarUrl':data['filename'].split('/').pop() })
            db.collect.insert_one({ 'openid': res['openid'],'busline':[],'route':[],'station':[]})
            db.feedback.insert_one({ 'openid': res['openid'],'content':[],'uptime': parser.isoparse(eval(data['uptime']))})
        else:        
            tmp = { 'uptime': parser.isoparse(eval(data['uptime'])), 'nickname': data['nickname']}
            if ('filename' in data):
                os.remove(os.path.curdir + os.path.sep +'service'+ os.path.sep + 'avatar' + os.path.sep + db.usrinfo.find_one({'openid':res['openid'] },{"_id": 0 ,'avatarUrl':1})['avatarUrl'])
                tmp['avatarUrl'] = data['filename'].split('/').pop()
            db.usrinfo.update_one({'openid': res['openid']},{ "$set" : tmp})
    except Exception as e:
        print(e)
        if (isinstance(e,pymongo.errors.OperationFailure)):  
            res['status'] = 10          
            res['code'] = e.details['code']
            res['msg'] = e.details['errmsg']
        else:
            res['status'] = 5
            res['msg'] = 'old avatar remove fail'
    return res

@api.route('/login_check')
def login_check():      
    data = format_dict(request.args.to_dict())
    new_data = {
        "appid" : appid,
        "secret": secret,
        "grant_type": "authorization_code"
    }
    new_data['js_code'] = data['js_code']
    #请求微信API用js_code换取用户openid和unionid
    response = requests.post('https://api.weixin.qq.com/sns/jscode2session',params=new_data,headers=headers).json()
    if response and ('errcode' in response):
        response['status'] = response['errcode']
        return response
    else:
        r_data = {}
        r_data['unionid'] = ''
        if 'unionid' in response:
            r_data['unionid'] = response['unionid']
        r_data['openid'] = response['openid']
    #连接moggodb usrinfo表
    res = {}    
    try: 
        col = db.usrinfo
        usr = col.find_one({'openid': r_data['openid']},{"_id": 0})
        if list(usr) == []:        
            res['status'] = 101
            res['msg'] = 'user is not exist'
        else:
            res['usrinfo'] = usr
            res['status'] = 0
            res['msg'] = 'user exist'
    except Exception as e:
        print(e)
        if (isinstance(e,pymongo.errors.OperationFailure)): 
            res['status'] = 10           
            res['code'] = e.details['code']
            res['msg'] = e.details['errmsg']
    return res


@api.route('/avatar',methods=['GET', 'POST'])
def avatar():    
    f = request.files['file']
    response ={}
    try:
        f.save(os.path.curdir + os.path.sep +'service'+ os.path.sep + 'avatar' + os.path.sep + f.filename)
        response['status'] = 0
        response['msg'] = 'avatar storage complete'
    except: 
        response['status'] = 101
        response['msg'] = 'avatar storage fail'
    return response

@api.route("/download_avatar")
def download_avatar():
    data = format_dict(request.args.to_dict())
    openid = ''
    if 'openid' in data.keys():
        openid = data['openid']
    try:
        col = db.usrinfo
        filename = col.find_one({'openid':openid },{"_id": 0 ,'avatarUrl':1})['avatarUrl']
        with open(os.path.curdir + os.path.sep +'service'+ os.path.sep + 'avatar' + os.path.sep + filename , 'rb') as f:
            stream = f.read()
        response = Response(stream, content_type='application/octet-stream')
        response.headers['Content-disposition'] = 'attachment; filename=' + filename
#这里的filename是用户下载之后显示的文件名称，可以自己随意修改，而上边的test.xlsx是要你本地的文件，名称必须要对应。
    except Exception as e:
        print(e)
        response = {"code":10,"msg":"error"}
       
    return response

@api.route('/collectsync')
def collectsync():
    data = format_dict(request.args.to_dict())
    item = {}
    res = {}
    if 'station' in data.keys():
        item['station'] = data['station']
    if 'busline' in data.keys():
        item['busline'] = data['busline']
    if 'route' in data.keys():
        item['route'] = data['route']
    try: 
        col = db.collect
        if data['method'] =='add':
            res['db_data'] = col.update_one({'openid': data['openid']},{"$push":item,"$set":{'uptime': parser.isoparse(eval(data['uptime']))}}).raw_result
        if data['method'] =='del':
            res['db_data'] = col.update_one({'openid': data['openid']},{"$pull":item,"$set":{'uptime': parser.isoparse(eval(data['uptime']))}}).raw_result
        if data['method'] =='get':
            res['db_data'] = col.find_one({'openid': data['openid']},{"_id": 0,"openid":0})
        if data['method'] =='ver':
            res['db_data'] = col.find_one({'openid': data['openid']},{"_id": 0,"uptime":1})
        res['statusCode'] = 0
    except Exception as e:
        print(e)
        if (isinstance(e,pymongo.errors.OperationFailure)): 
            res['statusCode'] = 10
            res['errMsg'] = e.details
    return res

@api.route('/feedback')
def feedback():
    data = format_dict(request.args.to_dict())
    query = {}
    method = data['method'] or None
    if 'query' in data:
        query = data['query'] 
    res = {}
    try: 
        col = db.feedback
        res['statusCode'] = 0
        if method == 'get':
            res_cursor = col.find(query,{"_id": 0})
            feedback = []
            for item in res_cursor:
                idx = 0
                content_item = []
                for content in item['content']:
                    tmp = content
                    tmp['index'] = idx
                    idx = idx +1
                    content_item.append(tmp)
                feedback.append(item)   
            res['feedback'] = feedback
        elif method == 'change':
            update = {}
            update['content.' + data['index'] + '.status'] = 1
            res['db_data'] = col.update_one(query,{'$set':update}).raw_result
        elif method == 'reply':
            update = {}
            update['content.' + data['index'] + '.status'] = 2
            update['content.' + data['index'] + '.reply'] = data['reply']
            res['db_data'] = col.update_one(query,{'$set':update}).raw_result
        elif method == 'close':
            update = {}
            update['content.' + data['index'] + '.status'] = 3
            res['db_data'] = col.update_one(query,{'$set':update}).raw_result
        elif method == 'add':
            item ={
                 'content':{
                    'uptime':eval(data['uptime']),
                    'text':data['text'],
                    'status':0,
                    'contact':data['contact']                   
                 }
            }
            res['db_data'] = col.update_one(query,{'$push':item}).raw_result
        else:
            res['errMsg'] = 'the value of method (' + method +') is invalid'
            res['statusCode'] = -1
    except Exception as e:
        print(e)
        if method is None:
            res['errMsg'] = 'the param method is necessary '
        if (isinstance(e,pymongo.errors.OperationFailure)): 
            res['statusCode'] = 10
            res['errMsg'] = e.details
        else:
            res['statusCode'] = -1
            
    return res


    return db