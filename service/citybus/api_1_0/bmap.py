#coding:utf-8
from . import CurrentConfig,api,headers
from citybus.utils import format_dict
from flask import request
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

@api.route('/busline')
def busline():
    data = format_dict(request.args.to_dict())
    res = {}
    busline = db.busline.find_one({"name":{'$regex':'^' + data['name']}},{'_id':0})
    if busline != None:
        res['busline'] = busline
        res['statusCode'] = 0
    else :
        res['statusCode'] = 101
        res['errMsg'] = data['name'] + '线路未录入数据库'
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
