---
title: "Flask on BlueHost"
slug: flask-on-bluehost
date: 2012-04-22 16:41:00
disqus: true
---

These instructions assume you have already installed a version of Python compatible with Flask.  They also assume you have installed pip, a Python package manager. I've written [instructions]{{<relref "2012-04-17-python-27-bluehost.markdown" >}}) for this.

<!-- more -->

Be mindful when copying and pasting the code below.  Make sure you use Unix-style line endings in your text editor, as Michael Lee points out in the comments below.  You will very likely encounter issues if you use Windows-style line endings.

1. Install Virtual Env.

    ```
    pip install virtualenv
    ```

1. Create a virtual environment for our Flask app

    ```
    virtualenv $HOME/venv/flask_hello_world
    ```

1. Activate our virtual environment

    ```
    . $HOME/venv/flask_hello_world/bin/activate
    ```

1. You should see some new text on the command line to indicate you are using your newly created virtual envionment. In my case it looks likes this.

    ```
    (flask_hello_world)username@domain.com [~]#
    ```

1. Add Flup and Flask libraries to the virtual environment

    ```
    pip install flup
    pip install flask
    ```

1. You can now leave the virtual environment

    ```
    deactivate
    ```

1. Create a directory for our Flask app

    ```
    mkdir $HOME/public_html/flask_hello_world
    ```

1. Change directory to the one we just created for the app and create an htaccess directive for this app.  Put the absolute path to YOUR fcgi file in the RewriteCond below.

    ```
    cd $HOME/public_html/flask_hello_world
    ```

    ```
    nano .htaccess
    ```

    ```
    Options +ExecCGI
    AddHandler fcgid-script .fcgi
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !=/YOUR/PATH/TO/public_html/flask_hello_world/flask_hello_world.fcgi
    RewriteRule ^(.*)$ flask_hello_world.fcgi/$1 [QSA,L]
    ```

1. Create an fcgi file for the app

    ```
    nano flask_hello_world.fcgi
    ```

    Make sure the shebang (the line starting with #!) points to the python binary in your virtualenv folder.  I typed HOMEDIRE/USERNAME as a place holder.  Replace those values with the actual values for your environment.

    ```
    #!/HOMEDIR/USERNAME/venv/flask_hello_world/bin/python

    from flup.server.fcgi import WSGIServer
    from flask_hello_world_app import app as application

    WSGIServer(application).run()
    ```

    Make that fcgi script executable

    ```
    chmod +x $HOME/public_html/flask_hello_world/flask_hello_world.fcgi
    ```

1. Create the application file for the app.  Note that this file name matches the "from ... import app as application" line of code referenced above.

    ```
    nano flask_hello_world_app.py
    ```

    ```
    from datetime import datetime
    from flask import Flask
    app = Flask(__name__)

    @app.route('/')
    def hello_world():
        return 'Hello World!'

    @app.route('/the-time')
    def the_time():
         cur_time = str(datetime.now())
         return cur_time + ' is the current time!  ...YEAH!'

    if __name__ == '__main__':
        app.run()
    ```

1. You should now be able to navigate to `yourdomain.com/flask_hello_world/` and see the following

    ```
    Hello World!
    ```

    And if you navigate to ```yourdomain.com/flask_hello_world/the-time``` you'll see something like this

    ```
    2012-04-22 15:37:52.134175 is the current time! ...YEAH!
    ```

That's it!  I'm not sure how and when BlueHost/fcgid reload fcgi files.  So if you need to force your app to re-load you should use the 'kill' command to kill any instances of your *virtualenv* python that are running.

