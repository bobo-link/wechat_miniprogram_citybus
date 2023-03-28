#coding:utf-8
from flask import Blueprint
from config import config_map

#创建蓝图对象
api=Blueprint("api_1_0",__name__)

headers={'content-type': 'application/json;charset=UTF-8'}

CurrentConfig=config_map['develop']
#导入蓝图的视图
from . import bmap,user

