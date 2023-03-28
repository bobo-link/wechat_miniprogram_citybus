#coding:utf-8
import os
from configparser import ConfigParser
cf = ConfigParser()
cf.read(os.path.curdir + os.path.sep +  'citybus.ini')
class Config(object):
    SECRET_KEY = 'bobolink'
    JSON_AS_ASCII = False
    # redis  
    REDIS_HOST = "127.0.0.1"
    REDIS_PORT = 6379

    # flask-session配置
    SESSION_TYPE = "redis"
    SESSION_REDIS = None
    SESSION_USE_SIGNER = True
    PERMAENT_SESSION_LIFETIME = 86400
    #数据库配置
    MONGODB_USR=cf.get('default', 'mongodb_usr') 
    MONGODB_PWD =cf.get('default', 'mongodb_pwd') 
    MONGODB_URI = cf.get('default', 'mongodb_uri')

class DevelopmentConfig(Config):
    DEBUG = True
    WEB_AK = cf.get('default', 'web_ak')
    WX_APPID = cf.get('default', 'web_ak')
    WX_SECRET = cf.get('default', 'secret') 
    
class ProductionConfig(Config):
    pass
    

config_map = {
    "develop":DevelopmentConfig,
    "product":ProductionConfig
}