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

@api.route("/feedbacktest",methods=['GET', 'POST','OPTIONS'])
def fed():
    return [{
        "nickname":"wen",
        "content": ["1","2","3"],
        "reply":"ok",
        "uuid":1
    },
    {
        "nickname":"w",
        "content": ["dssdsd","sdsdsdsdfgf","fgfgfgfdgrgd"],
        "reply":"smdiso",
        "uuid":2
    }
    ]