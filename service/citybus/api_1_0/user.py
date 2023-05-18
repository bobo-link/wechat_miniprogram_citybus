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

@api.route('/userdel/<openid>',methods = ['get'])
def user_delete(openid):
    try:
        db.usrinfo.delete_one({'openid':openid})
        db.feedback.delete_one({'openid':openid})
        db.collect.delete_one({'openid':openid})
    except Exception as e:
        return jsonify(statusCode = -1, errMsg = str(e)) 
    else:
        return jsonify(statusCode = 0, message = 'ok') 

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
            db.usrinfo.insert_one({ 'openid': res['openid'], 'unionid': res['unionid'],'nickname': data['nickname'], 'avatarUrl':data['filename'].split('/').pop() })
            db.collect.insert_one({ 'openid': res['openid'],'busline':[],'route':[],'station':[],'uptime': parser.isoparse(eval(data['uptime']))})
            db.feedback.insert_one({ 'openid': res['openid'],'content':[],'limit':3,'uptime': parser.isoparse(eval(data['uptime']))})
        else:        
            tmp = { 'uptime': parser.isoparse(eval(data['uptime'])), 'nickname': data['nickname']}
            try:
                if ('filename' in data):
                    os.remove(os.path.curdir + os.path.sep + 'avatar' + os.path.sep + db.usrinfo.find_one({'openid':res['openid'] },{"_id": 0 ,'avatarUrl':1})['avatarUrl'])
            except:
                pass
            finally:
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
        if usr ==None or list(usr) == []:        
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
        f.save(os.path.curdir + os.path.sep + 'avatar' + os.path.sep + f.filename)
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
        with open(os.path.curdir + os.path.sep + 'avatar' + os.path.sep + filename , 'rb') as f:
            stream = f.read()
        response = Response(stream, content_type='application/octet-stream')
        response.headers['Content-disposition'] = 'attachment; filename=' + filename
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


@api.route('/collection/<openid>',methods =["GET"])
def collection_get(openid):
    data = format_dict(request.args.to_dict())
    if_send = False
    col = db.collect
    if data.get('uptime') is None or len(data.get('uptime')) < 1:
        if_send = True
    try:
        collection = col.find_one({'openid': openid},{"_id": 0,"openid":0})
    except Exception as e:
        return jsonify(statusCode = 10,errMsg = e.details)
    else:
        try: 
            if if_send:
                return jsonify(statusCode = 0, collection = collection)
            diff =(parser.isoparse(eval(data.get('uptime'))).replace(tzinfo=None)) - collection.get('uptime').replace(microsecond = 0)
            if diff.days < 0:
                if_send = True
        except Exception as e:
             print(e)
             if_send = True
        finally:
            if if_send:
                return jsonify(statusCode = 0, collection = collection)
            else:
                return jsonify(statusCode = -1,errMsg = '收藏数据已经是最新')   
            
@api.route('/collection/<openid>',methods =["POST"])
def collection_post(openid):
    data = request.get_json()
    col = db.collect
    item ={}
    if 'station' in data.keys():
        item['station'] = data['station']
    if 'busline' in data.keys():
        item['busline'] = data['busline']
    if 'route' in data.keys():
        item['route'] = data['route']  
    try:
        db_data = col.update_one({'openid': openid},{"$push":item,"$set":{'uptime': parser.isoparse(data.get('uptime'))}}).raw_result 
    except Exception as e:
        return jsonify(statusCode = 10,errMsg = e.details)
    else:
        if db_data.get('nModified') == 0 :
            return jsonify(statusCode = -1,errMsg = "添加失败")
        return jsonify(statusCode = 0,errMsg = "添加成功")
    
@api.route('/collection/<openid>',methods =["DELETE"])
def collection_delete(openid):
    data = request.get_json()
    col = db.collect
    item ={}
    if 'station' in data.keys():
        item['station'] = data['station']
    if 'busline' in data.keys():
        item['busline'] = data['busline']
    if 'route' in data.keys():
        item['route'] = data['route']  
    try:
        db_data = col.update_one({'openid': openid},{"$pull":item,"$set":{'uptime': parser.isoparse(data['uptime'])}}).raw_result
    except Exception as e:
        return jsonify(statusCode = 10,errMsg = e.details)
    else:
        print(db_data)
        if  db_data.get('nModified') == 0 :
            return jsonify(statusCode = -1,errMsg = "删除失败")
        return jsonify(statusCode = 0,errMsg = "删除成功")

# feedback 视图函数
@api.route('/feedback',defaults={'openid': None},methods =["GET"])
@api.route('/feedback/<openid>',methods =["GET"])
def feedback_get(openid):
    data = format_dict(request.args.to_dict())
    query = {}
    index = 0
    if data.get('index') is not None:
        index = data.get('index')
    if openid is not None:
        query['openid'] = openid
    col = db.feedback
    if data.get('action') == 'limit':
        if openid == None:
            return jsonify(statusCode = 0,errMSg = "缺少参数")
        try:
           res_cursor = col.find_one(query,{"_id": 0,'limit':1})
        except Exception as e:
          return jsonify(statusCode = 10,errMsg = eval(str(e)))
        else:
            if res_cursor == None:
                 return jsonify(statusCode = -1,errMSg = "用户不存在")
            return jsonify(statusCode = 0,limit = res_cursor.get('limit'))
    if data.get('action') == 'all':
        try:
            res_cursor = col.find_one(query,{"_id":0,"content":1,"uptime":1,"openid":1,"reply":1})
        except Exception as e:
            return jsonify(statusCode = 10,errMsg = eval(str(e)))
        else:
            return jsonify(statusCode = 0,feedback = res_cursor)
    try:
        res_cursor = col.aggregate([{"$match":query},{'$lookup':{'from': "usrinfo", "localField": "openid", "foreignField": "openid", "as": "inventory_docs"}},{"$project":{'nickname':{"$arrayElemAt":['$inventory_docs.nickname', 0]},"_id":0,"content":{"$arrayElemAt":['$content',int(index)]},"uptime":1,"openid":1,"content_length":{'$size':'$content'}}}])           
    except Exception as e:
        return jsonify(statusCode = 10,errMsg = eval(str(e)))
    else:
        feedback = [item for item in res_cursor]
        # for item in res_cursor:
        #     idx = 0
        #     content_item = []
        #     for content in item['content']:
        #         tmp = content
        #         tmp['index'] = idx
        #         idx = idx +1
        #         content_item.append(tmp)
        #     feedback.append(item) 
        
         
        return jsonify(statusCode = 0,feedback =feedback)

@api.route('/feedback',defaults={'openid': None},methods =["POST"])
@api.route('/feedback/<openid>',methods =["POST"])
def feedback_post(openid):
    data = request.get_json()
    query = {}
    if openid is not None:
        query['openid'] = openid
    else:
        return jsonify(statusCode = 0,errMSg = "缺少参数")    
    col = db.feedback
    item ={
            'content':{
                'uptime':data['uptime'],
                'text':data['text'],
                'status':0,
                'contact':data['contact'],                
            }
    }
    query['limit'] = {'$gt':0}
    try:
        db_data = col.update_one(query,{'$push':item,'$inc': {'limit': -1 },}).raw_result
    except Exception as e:
        return jsonify(statusCode = -1,errMsg = eval(str(e)))
    else:
        if  db_data.get('nModified') == 0 :
            return jsonify(statusCode = -1,errMsg = "反馈次数不足")
        return jsonify(statusCode = 0,errMsg = "反馈成功")

@api.route('/feedback/<openid>/<index>',methods =["PUT"])
def feedback_put(openid,index):
    data = request.get_json()
    query = {}
    if all([openid,index,data.get('action')]) :
        query['openid'] = openid
    else:
        return jsonify(statusCode = -1,errMSg = "缺少参数")    
    col = db.feedback
    update = {}

    if data.get('action') == 'status_change':
        update['content.' + index + '.status'] = 1
        try: 
            db_data = col.update_one(query,{'$set':update}).raw_result
        except Exception as e:
            return jsonify(statusCode = -1,errMsg = eval(str(e)))
        else:
            if  db_data.get('nModified') == 0 :
                return jsonify(statusCode = -1,errMsg = '状态更新失败')
            return jsonify(statusCode = 0,errMsg = '状态更新成功')
    
    if data.get('action') == 'reply':
        update['content.' + index + '.status'] = 2
        update['content.' + index + '.reply'] = data['reply']
        try:
            db_data = col.update_one(query,{'$set':update}).raw_result
        except Exception as e:
            return jsonify(statusCode = -1,errMsg = eval(str(e)))
        else:
            if db_data.get('nModified') == 0 :
                return jsonify(statusCode = -1,errMsg = '回复失败')
            return jsonify(statusCode = 0,errMsg = '回复成功')

