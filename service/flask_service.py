from flask import Flask, Response
from flask import request
from configparser import ConfigParser
import os
import json
import requests
import pymongo
from dateutil import parser
""" 
 status | detail
    0   | 正常
    5   | 文件操作错误
    10  | 数据库错误
    101 | 其他错误
"""

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
        res = {}
        res['unionid'] = ''
        if 'unionid' in response:
            res['unionid'] = response['unionid']
        res['openid'] = response['openid']
    #连接moggodb usrinfo表
    col = mongodb_col({"host":['localhost:27017'],"usr":mongodb_usr,"pwd":mongodb_pwd,"db":"citybus","col":"usrinfo"})
    if list(col.find({"openid":res['openid']})) == []:        
        col.insert_one({ 'openid': res['openid'], 'unionid': res['unionid'], 'uptime': parser.parser(data['uptime']), 'nickname': data['nickname'], 'avatarUrl':data['filename'].split('/').pop() })
    else:
       try:
        if ('filename' in data):
            os.remove(os.path.curdir + os.path.sep +'service'+ os.path.sep + 'avatar' + os.path.sep + col.find_one({'openid':res['openid'] },{"_id": 0 ,'avatarUrl':1})['avatarUrl'])
            tmp = { 'uptime': parser.isoparse(eval(data['uptime'])), 'nickname': data['nickname'], 'avatarUrl':data['filename'].split('/').pop()}
            col.update_one({'openid': res['openid']},{ "$set" : tmp})
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

@app.route('/login_check')
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
    col = mongodb_col({"host":['localhost:27017'],"usr":mongodb_usr,"pwd":mongodb_pwd,"db":"citybus","col":"usrinfo"})
    res = {}
    try: 
        if list(col.find({"openid":r_data['openid']})) == []:        
            res['status'] = 101
            res['msg'] = 'user is not exist'
        else:
            res['usrinfo'] = col.find_one({'openid': r_data['openid']},{"_id": 0})
            res['status'] = 0
            res['msg'] = 'user exist'
    except Exception as e:
        print(e.details)
        if (isinstance(e,pymongo.errors.OperationFailure)): 
            res['status'] = 10           
            res['code'] = e.details['code']
            res['msg'] = e.details['errmsg']
    return res

""" @app.route('/logout')
def logout():      
    data = format_dict(request.args.to_dict())   
    #连接moggodb usrinfo表
    myclient = pymongo.MongoClient('localhost', 27017)
    db = myclient.citybus
    col = db.usrinfo       
    col.update_one({'openid': data['openid']},{ "$set" : {'autologin':False}})
    return data """

@app.route('/avatar',methods=['GET', 'POST'])
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

@app.route("/download_avatar")
def download_avatar():
    data = format_dict(request.args.to_dict())
    openid = ''
    if 'openid' in data.keys():
        openid = data['openid']
    try:
        col = mongodb_col({"host":['localhost:27017'],"usr":mongodb_usr,"pwd":mongodb_pwd,"db":"citybus","col":"usrinfo"})
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

""" @app.route("/ApiInfo")
def ApiInfo():
    token_data = {
        "grant_type" : "client_credential",
        "appid" : appid,
        "secret" :secret
    }
    token = requests.get('https://api.weixin.qq.com/cgi-bin/token',params=token_data,headers=headers).json()
    print(token)
    quota = requests.post('https://api.weixin.qq.com/cgi-bin/openapi/quota/get',params={"access_token":token["access_token"]},headers=headers).json()
    return quota """

def format_dict(dict):
    for key in dict.keys():        
        if isinstance(dict[key],str) and len(dict[key])>0 and (dict[key][0] == '{' and dict[key][-1] == '}'):
            temp = json.loads(dict[key])
            dict[key] = format_dict(temp)
    return dict

# A method to connect mongodb and return col
#   dict properties：
#       host: [list or str] 'mongobd connecction uri'
#       usr: [str] 'mongodb pwd if exist'
#       pwd: [str] 'mongodb pwd if exist'
#       db: [str] 'mongodb db's name'
#       col: [str] 'mongodb col's name'
def mongodb_col(dict):
    myclient = pymongo.MongoClient(host=dict['host'],username =dict['usr'], password = dict['pwd'])
    db = myclient[dict["db"]]
    col = db[dict["col"]]
    return col

   
if __name__ == '__main__': 
    # 读取配置信息
    cf = ConfigParser()
    cf.read(os.path.curdir + os.path.sep +'service'+ os.path.sep +  'citybus.ini')
    ak = cf.get('default', 'web_ak')
    appid = cf.get('default', 'appid')  
    secret = cf.get('default', 'secret') 
    mongodb_usr =cf.get('default', 'mongodb_usr') 
    mongodb_pwd =cf.get('default', 'mongodb_pwd') 

    app.run(host="0.0.0.0",port=59) 
    
    # col = mongodb_col({"host":['localhost:27017'],"usr":mongodb_usr,"pwd":mongodb_pwd,"db":"citybus","col":"usrinfo"})
    # print((col.find_one({'openid': 'ozMCH5XJmo1VZ6mnT1eC3utoVOx8'},{"_id": 0})))
    