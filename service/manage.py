from citybus import create_app,db
# from flask_script import Manager
# from flask_migrate import Migrate,migrateCommand
app = create_app('develop')

if __name__ == "__main__":
   app.run(host="0.0.0.0",port=59)
   
