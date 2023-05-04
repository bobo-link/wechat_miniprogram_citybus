#coding:utf-8
from . import CurrentConfig,api,headers
from citybus.utils import format_dict
from flask import request,jsonify
from citybus import db
import pymongo
import requests


ak = CurrentConfig.WEB_AK


@api.route('/weather')
def weather():
    data = request.args.to_dict()
    data['ak'] = ak
    print(data)
    #response = requests.get('https://api.map.baidu.com/weather/v1/',params=data, proxies=proxies,headers=headers,verify=r"D:\project\py\tel_robot\FiddlerRoot.pem").json()
    response = requests.get('https://api.map.baidu.com/weather/v1/',params=data,headers=headers).json()
    return response

@api.route('/geocoding')
def geocoding():
    data = request.args.to_dict()
    data['ak'] = ak
    print(data)   
    response = requests.get('https://api.map.baidu.com/geocoding/v3',params=data,headers=headers).json()
    return response

@api.route('/regeocoding')
def regeocoding():
    data = request.args.to_dict()
    data['ak'] = ak
    print(data)   
    response = requests.get('https://api.map.baidu.com/reverse_geocoding/v3',params=data,headers=headers).json()
    return response

@api.route('/transit')
def transit():
    data = request.args.to_dict()
    data['ak'] = ak
    response = requests.get('https://api.map.baidu.com/direction/v2/transit',params=data,headers=headers).json()
    return response

@api.route('/detail')
def detail():
    data = request.args.to_dict()
    data['ak'] = ak
    response = requests.get('https://api.map.baidu.com/place/v2/detail',params=data,headers=headers).json()
    return response

@api.route('/search')
def search():
    data = request.args.to_dict()
    data['ak'] = ak
    response = requests.get('https://api.map.baidu.com/place/v2/search',params=data,headers=headers).json()
    return response

@api.route('/suggestion')
def suggestion():
    data = format_dict(request.args.to_dict())
    data['ak'] = ak
    response = requests.get('https://api.map.baidu.com/place/v2/suggestion',params=data,headers=headers).json()
    return response

@api.route('/busline',defaults={'uid': None},methods =["GET"])
@api.route('/busline/<uid>',methods =["GET"] )
def busline(uid):
    res = {}
    if not uid:
        try :
            result = db.busline.find({},{'_id':0})
        except Exception as e :
            return jsonify(statusCode = 1,errMsg = eval(str(e)))
        else:
            res['statusCode'] = 0
            res['busline'] = []
            for busline in result:
                res['busline'].append(busline)
    else:
        try:
            busline = db.busline.find_one({"name":{'$regex':'^' + uid + '\\('}},{'_id':0})
        except Exception as e:
            return jsonify(statusCode = 1,errMsg = eval(str(e)))
        else:
            if busline != None:
                res['busline'] = busline
                res['statusCode'] = 0
            else : 
                return jsonify(statusCode = 1,errMsg = uid + '线路未录入数据库')             
    return res

@api.route('/busline',methods =["POST"])
def busline_post():
    data = request.get_json()
    col = db.busline
    if data.get('buslines') is None and data.get('busline') is None:
        return jsonify(statusCode = -1,errMsg ='缺少参数')
    
    if data.get('buslines'):
        try:
            db_data = col.insert_many(data.get('buslines'),False).raw_result
        except pymongo.errors.PyMongoError as e:    
            if isinstance(e, pymongo.errors.BulkWriteError) and e.timeout == False :
                del_items = []
                #获取存在的item数组
                for erro in e.details.get('writeErrors'):
                    del_items.append(erro.get('keyValue'))
                #删除存在的itme
                try:
                    col.delete_many({'$or':del_items}).raw_result  
                except pymongo.errors.PyMongoError as e :
                    return jsonify(statusCode = -1,errMsg = e.details)
                else:
                    #插入存在的item
                    buslines = [busline for busline in data.get('buslines') if {'name':busline.get('name')} in del_items ]
                    try:
                        col.insert_many(buslines,False)
                    except pymongo.errors.PyMongoError as e :
                        if isinstance(e,pymongo.errors.BulkWriteError):
                             return jsonify(statusCode = 0,errMsg = '录入成功(二层)')
                        return jsonify(statusCode = -1,errMsg = e.details)
                    else:
                        return jsonify(statusCode = 0,errMsg = '录入成功(一层)')
            else:
                errMsg = [item.get('errmsg') for item in e.details.get('writeErrors')]
                return jsonify(statusCode = -1,errMsg = errMsg)  
        else:
            if db_data.get('nModified') == 0 :
                return jsonify(statusCode = -1,errMsg = '录入失败')
            return jsonify(statusCode = 0,errMsg = '录入成功')
                                         
    if data.get('busline'):
        try:
            db_data = col.update_one({'name':data.get('busline').get('name')},{'$set':data.get('busline')},upsert=True).raw_result
        except Exception as e:
            if isinstance(e,pymongo.errors.PyMongoError):
                return jsonify(statusCode = -1, errMsg = e.details)
        else:
            return jsonify(statusCode = 0,errMsg = '录入成功')
           


@api.route("/echo",methods=['GET', 'POST','OPTIONS'])
def echo():
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        # 'Access-Control-Allow-Methods': 'DELETE'
    }
    data = ''
    if request.method == "GET":
        data = format_dict(request.args.to_dict())
    if request.method == "POST":
        if request.content_type.startswith('application/json'):            
            # comment = request.get_json()["content"]
            print('application/json')
            data = request.json
        elif request.content_type.startswith('multipart/form-data'):
            print('multipart/form-data') 
            data = request.form
        else:
            print('else') 
            data = request.values
    if request.method == "OPTIONS":  
       print(request.__dict__)    
    print(data)
    return data
