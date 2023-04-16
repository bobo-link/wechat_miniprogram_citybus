#coding:utf-8
from flask import Flask
from config import config_map,Config
from flask_wtf import CSRFProtect
from flask_session import Session
import pymongo
import redis
from citybus.utils.common import ReConverter

csrf = None
#创建redis连接对象
redis_store=None

#数据库
def mongodb_connect(dict):
    """
    连接mongodb返回数据库对象或表对象
    :param: dict:dict 配置字典 包含 host[主机地址],usr[数据库用户名],pwd[数据库密码],db[数据库],col[数据表]
    :return:
    """
    myclient = pymongo.MongoClient(host=dict['host'],username =dict['usr'], password = dict['pwd'])
    db = myclient[dict["db"]]
    if 'col' in dict.keys():
        col = db[dict["col"]]
        return col
    return db

db = mongodb_connect({"host":[Config.MONGODB_URI],"usr":Config.MONGODB_USR,"pwd":Config.MONGODB_PWD,"db":"citybus"})

#工厂模式
def create_app(config_name):
    """
    创建flask的应用对象
    :param config_name: str 配置模式,有效值("develop", "product")
    :return:
    """
    app = Flask(__name__)

    #根据配置模式的名字获取配置参数的类
    config_class = config_map.get(config_name)
    app.config.from_object(config_class)

    #创建数据库对象
    from citybus import api_1_0
    global db

    
    #初始化redis工具
    # global redis_store
    # redis_store = redis.StrictRedis(host=config_class.REDIS_HOST,port=config_class.REDIS_PORT)
    
    #利用flask-session,将session数据保存到redis中
    # Session(app)
    
    #为flask补充csrf防护
    # global csrf
    # csrf = CSRFProtect(app)

    #为flask添加自定义的转换器
    app.url_map.converters["re"] = ReConverter

    #注册蓝图
    from citybus import api_1_0
    app.register_blueprint(api_1_0.api)
    from citybus import web_html
    app.register_blueprint(web_html.html)
    
    
    return app
