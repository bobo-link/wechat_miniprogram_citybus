from flask import Flask
from flask import request
from configparser import ConfigParser
import os
import json
import requests
import pymongo
from dateutil import parser

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
headers = {'content-type': 'application/json;charset=UTF-8'}
proxies ={
        "http": "http://127.0.0.1:8888",
        "https": "http://127.0.0.1:8888"
    }

@app.route('/weather')
def weather():
    data = request.args.to_dict()
    data['ak'] = ak
    print(data)
    #response = requests.get('https://api.map.baidu.com/weather/v1/',params=data, proxies=proxies,headers=headers,verify=r"D:\project\py\tel_robot\FiddlerRoot.pem").json()
    response = requests.get('https://api.map.baidu.com/weather/v1/',params=data,headers=headers).json()
    return response

@app.route('/geocoding')
def geocoding():
    data = request.args.to_dict()
    data['ak'] = ak
    print(data)   
    response = requests.get('https://api.map.baidu.com/geocoding/v3',params=data,headers=headers).json()
    return response

@app.route('/regeocoding')
def regeocoding():
    data = request.args.to_dict()
    data['ak'] = ak
    print(data)   
    response = requests.get('https://api.map.baidu.com/reverse_geocoding/v3',params=data,headers=headers).json()
    return response

@app.route('/transit')
def transit():
    data = request.args.to_dict()
    data['ak'] = ak
    response = requests.get('https://api.map.baidu.com/direction/v2/transit',params=data,headers=headers).json()
    return response

@app.route('/detail')
def detail():
    data = request.args.to_dict()
    data['ak'] = ak
    response = requests.get('https://api.map.b\WXBizDataCrypt.pyaidu.com/place/v2/detail',params=data,headers=headers).json()
    return response

@app.route('/search')
def search():
    data = request.args.to_dict()
    data['ak'] = ak
    response = requests.get('https://api.map.baidu.com/place/v2/search',params=data,headers=headers).json()
    return response

@app.route('/login')
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
        r_data = {}
        r_data['unionid'] = ''
        if 'unionid' in response:
            r_data['unionid'] = response['unionid']
        r_data['openid'] = response['openid']
    #连接moggodb usrinfo表
    myclient = pymongo.MongoClient('localhost', 27017)
    db = myclient.citybus
    col = db.usrinfo
    if list(col.find({"openid":r_data['openid']})) == []:
        col.insert_one({ 'openid': r_data['openid'], 'unionid': r_data['unionid'], 'uptime': parser.parser(data['uptime']), 'nickname': data['nickname'], 'avatarUrl':data['filename'], 'autologin': True })
    else:
       tmp = { 'uptime': parser.isoparse(eval(data['uptime'])), 'nickname': data['nickname'], 'avatarUrl':data['filename'],'autologin': True}
       col.update_one({'openid': r_data['openid']},{ "$set" : tmp})
    return r_data

@app.route('/avatar',methods=['GET', 'POST'])
def avatar():    
    f = request.files['file']
    f.save(os.path.curdir + os.path.sep +'service'+ os.path.sep + 'avatar' + os.path.sep + f.filename)
    response = {}
    response['filename'] = f.filename
    return response


def format_dict(dict):
    for key in dict.keys():        
        if isinstance(dict[key],str) and len(dict[key])>0 and (dict[key][0] == '{' and dict[key][-1] == '}'):
            temp = json.loads(dict[key])
            dict[key] = format_dict(temp)
    return dict
        

    
if __name__ == '__main__': 
    cf = ConfigParser()
    cf.read(os.path.curdir + os.path.sep +'service'+ os.path.sep +  'citybus.ini')
    ak = cf.get('default', 'web_ak')
    appid = cf.get('default', 'appid')  
    secret = cf.get('default', 'secret') 

    app.run(host="0.0.0.0",port=59) 
    
    # myclient = pymongo.MongoClient('localhost', 27017)
    # db = myclient.citybus
    # col = db.usrinfo
    # print(list(col.find({"openid":'0'})) == [])
    