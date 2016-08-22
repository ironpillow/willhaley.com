---
layout: post
title: "WordPress in tiny core linux 6"
date: 2015-01-16 20:43:59 -0600
comments: true
categories:
published: true
---
For this post I'm assuming you already have Tiny Core Linux up and running and persistence (Tiny Core's ability to save changes) is working.  I'm also assuming that your installation of Tiny Core Linux has an adequately sized hard drive.

<!-- more -->

#### Setup MySQL

Use [these instructions]({% post_url 2015-01-13-mariadb-in-tinycore-linux-6 %}), or whatever method you prefer, to get MariaDB (A "drop-in" MySQL replacement) working in your Tiny Core installation.  Note: I may use the names MySQL and MariaDB interchangeably in these instructions.

I'm assuming you've followed some process and have MariaDB up and running.

Connect to MySQL as `root`.

```
mysql -u root
```

Create a database for WordPress.  Feel free to use a different database name than `wordpress_db_01`.

```
CREATE DATABASE wordpress_db_01;
```

Create a database user with the appropriate access for `wordpress_db_01`.

```
GRANT ALL PRIVILEGES ON wordpress_db_01.* TO "wordpress_user_01"@"localhost" IDENTIFIED BY "password";
```

The important elements from that command above are that our WordPress database user name is `wordpress_user_01`, and the password for that user is `password`.  Feel free to use different values.

Enforce the changes we just made, and then exit the `mysql` client.

```
FLUSH PRIVILEGES;
exit
```

#### Setup Apache

Install the Apache extension that includes PHP.

```
tce-load -wi apache2-mod-php5
```

By default, the Apache web server files are located in `/usr/local/apache2/htdocs`.  Without some additional work, any changes made to that directory will be blown away when you reboot your Tiny Core Linux machine.  That is the nature of Tiny Core Linux extensions.

To get around this, I do something a bit unorthodox and keep my web server files on a persistent mount point, `/opt`.  I then symlink to those files from `/usr/local/apache2/htdocs`.  I use a boot script to re-create that symlink each reboot.  This is not standard practice, but it will work.  Read the Tiny Core docs if you would rather implement this another way.

Edit `/opt/bootlocal.sh` and add the following so that our custom Apache configuration will be re-created each reboot.

```
# Apache
rm -rf /usr/local/apache2/htdocs
ln -s /opt/apache2/htdocs /usr/local/apache2/htdocs
ln -sf /opt/apache2/httpd.conf /usr/local/apache2/conf/
apachectl start
```

Save those changes to `bootlocal.sh`.

Create an `htdocs` directory for our web server files.

```
mkdir -p /opt/apache2/htdocs
```

Make a copy of the `httpd.conf` file.

```
sudo cp /usr/local/apache2/conf/httpd.conf /opt/apache2/
```

Edit `/opt/apache2/httpd.conf`.  Uncomment and modify the `ServerName` line to look like this.

```
ServerName 127.0.0.1
```

Create an `.htaccess` file in `/opt/apache2/htdocs/` with the following line.

```
DirectoryIndex index.php index.html
```

Edit `/opt/apache2/httpd.conf`.  Find the config directive for `<Directory "/usr/local/apache2/htdocs">`.

Change the `AllowOverride` line from `None` to `All`.

```
<Directory "/usr/local/apache2/htdocs">

    # A few lines down you'll find AllowOverride

    AllowOverride All
```

OK, now we should have our web server directory root at `/opt/apache2/htdocs`.  We also have a custom Apache config file at `/opt/apache2/httpd.conf`.

This means we should be able to make changes to our web server directory and those changes will persist every time we reboot.  Apache should be all set.

Reboot and verify Apache is running on your Tiny Core linux box.

```
sudo reboot
```

If Apache is not running, then go back and figure out what went wrong.  Make sure your config modifications and symlinks are correct.

#### Install WordPress

Install `curl`.

```
tce-load -wi curl
```

Download WordPress and unzip it.

```
curl -o /tmp/latest.zip https://wordpress.org/latest.zip
unzip /tmp/latest.zip -d /tmp/
mv /tmp/wordpress/* /opt/apache2/htdocs/
```

Done!

Navigate to your web server using a browser and start installing WordPress.

I'll leave it to you to to follow the wizard and get WordPress up and running (remember the username, password, and database name we setup earlier in MySQL!).

