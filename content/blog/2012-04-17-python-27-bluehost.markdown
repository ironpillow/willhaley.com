---
title: "Python 2.7 on Bluehost"
slug: python-27-bluehost
date: 2012-04-17 21:43:00
disqus: true
---

These instructions worked for me on my BlueHost instance, but I cannot guarantee they will work for everyone. Luckily, gcc, g++, make, and every utility that I needed to install Python 2.7 were already present in my case.

<!-- more -->

In order for this to work, enable SSH on your Bluehost.com account and verify that you can connect to your server, then follow the directions below.

1. Connect to your server by SSH

1. Navigate to your home directory. Because this is a shared hosting environment we do not have access to system-wide resources, but we can do almost anything we want in the $HOME directory

    ```
    cd $HOME
    ```

1. Create a bin, opt, and src directory to contain our (bin) binaries and executable commands, (opt) optional compiled software, and (src) setup files and source code.

    ```
    mkdir bin opt src
    ```

1. Change to the src directory where we will download source code and installation files

    ```
    cd src
    ```

1. Download the latest version of Python (2.7.2 at the time of writing)

    ```
    wget http://www.python.org/ftp/python/2.7.2/Python-2.7.2.tgz
    ```

1. Untar (unzip) the Python 2.7 source code

    ```
    tar xzvf Python-2.7.2.tgz
    ```

1. Change into the directory with the Python 2.7 source code

    ```
    cd Python-2.7.2
    ```

1. Run the configure script and specify the destination folder for the Python 2.7 compiled code. Notice that the compiled Python 2.7 code will end up inside the opt directory we made earlier

    ```
    ./configure --prefix=$HOME/opt/python27
    ```

1. Finish the installation

    ```
    make && make install
    ```

1. Create a symbolic link in the $HOME/bin directory that points to the python2.7 binary we compiled

    ```
    ln -s $HOME/opt/python27/bin/python2.7 $HOME/bin/python2.7
    ```

1. Create another symbolic link so that the "python" command in $HOME/bin will link to the python2.7 binary

    ```
    ln -s $HOME/bin/python2.7 $HOME/bin/python
    ```

1. I prefer nano, but use your text editor of choice to update your $PATH variable

    ```
    nano $HOME/.bash_profile
    ```

1. Update your PATH variable as follows. It's important that the $HOME/opt/python27/bin and $HOME/bin entries come before $PATH so that typing 'python' favors running our newly compiled python over BlueHost's built in Python 2.4 binary

    ```
    PATH=$HOME/opt/python27/bin:$HOME/bin:$PATH
    ```

1. Update the $PATH variable on-the-fly so we don't have to log out and in for our changes to take effect

    ```
    . $HOME/.bash_profile
    ```

1. Confirm that the binary being used for python is your $HOME/bin/python command

    ```
    which python
    ```

1. Verify that your Python version is 2.7.2

    ```
    python --version
    Python 2.7.2
    ```

1. Change to the $HOME/src directory again

    ```
    cd $HOME/src
    ```

1. Download get-pip.py, a wonderful script we will use to install pip and setuptools.

    ```
    wget https://bootstrap.pypa.io/get-pip.py
    ```

1. Install pip (the script will figure out where to install pip for our custom python version)

    ```
    python get-pip.py
    ```

1. Verify you can execute pip. If this works, then you now have Python 2.7 and pip, a Python package manager, up and running. You can use pip to easily install Python packages. I'll be writing another article soon to explain how to write and serve a simple Python application on BlueHost

    ```
    pip
    ```
