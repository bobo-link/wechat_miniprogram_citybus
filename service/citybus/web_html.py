#coding:utf-8

from flask import Blueprint,current_app

html = Blueprint("web_html",__name__)

@html.route("/<re(r'.*'):html_file_name>")
def get_html(html_file_name):
    """ 提供html文件 """    
    if not html_file_name:
        html_file_name = 'index.html'
    return current_app.send_static_file(html_file_name)