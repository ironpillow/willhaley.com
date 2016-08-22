---
title: "MariaDB in Tiny Core linux"
slug: mariadb-tinycore-linux
aliases: [
  /blog/mariadb-in-tinycore-linux-6/
]
date: 2015-01-13 22:29:39
disqus: true
---

To use MariaDB with Tiny Core Linux you must provide a data directory that is persistent and writeable.  By default, if you install the MariaDB extension and try to run it, you will most likely see an error like this.

```
150126  3:12:11 [ERROR] mysqld: File '/tmp/tcloop/mariadb/usr/local/mysql/data/aria_log_control' not found (Errcode: 30 "Read-only file system")
150126  3:12:11 [ERROR] mysqld: Got error 'Can't open file' when trying to use aria control file '/tmp/tcloop/mariadb/usr/local/mysql/data/aria_log_control'
150126  3:12:11 [ERROR] Plugin 'Aria' init function returned error.
150126  3:12:11 [ERROR] Plugin 'Aria' registration as a STORAGE ENGINE failed.
150126  3:12:11 [Note] InnoDB: Using mutexes to ref count buffer pool pages
150126  3:12:11 [Note] InnoDB: The InnoDB memory heap is disabled
150126  3:12:11 [Note] InnoDB: Mutexes and rw_locks use GCC atomic builtins
150126  3:12:11 [Note] InnoDB: Memory barrier is not used
150126  3:12:11 [Note] InnoDB: Compressed tables use zlib 1.2.8
150126  3:12:11 [Note] InnoDB: Not using CPU crc32 instructions
150126  3:12:11 [Note] InnoDB: Initializing buffer pool, size = 128.0M
150126  3:12:11 [Note] InnoDB: Completed initialization of buffer pool
150126  3:12:11 [ERROR] InnoDB: ./ibdata1 can't be opened in read-write mode
150126  3:12:11 [ERROR] InnoDB: The system tablespace must be writable!
150126  3:12:11 [ERROR] Plugin 'InnoDB' init function returned error.
150126  3:12:11 [ERROR] Plugin 'InnoDB' registration as a STORAGE ENGINE failed.
150126  3:12:11 [Note] CONNECT: Version 1.03.0005 Nov 26 2014 11:30:51
150126  3:12:11 [Note] Plugin 'FEEDBACK' is disabled.
150126  3:12:11 [ERROR] Unknown/unsupported storage engine: InnoDB
150126  3:12:11 [ERROR] Aborting

150126  3:12:11 [Note] unregister_replicator OK
150126  3:12:11 [Note] /usr/local/mysql/bin/mysqld: Shutdown complete
```

I have documented some instructions here that can be used to create a persistent writeable data directory for MariaDB so that it can run properly.

<!-- more -->

For this to work we need a persistent `/opt` mount point.

I'm assuming you understand persistence in Tiny Core linux, that you already have persistence working, and that you have enough space on your disk for these instructions to work.

# Install MariaDB

```
tce-load -wi mariadb mariadb-client
```

# Copy MariaDB's data directory to the persistent `opt` directory

The data directory in the MariaDB extension has a number of files that are symlinked to readonly files.  It is critical that you use the `-L` flag here as it will copy the symlinked targets rather than the symlinks.

```
mkdir /opt/mysql
cp -Lr /usr/local/mysql/data /opt/mysql/
```

Let's also delete the existing InnoDB files while we're at it.  Most important to me is that we delete the InnoDB log files as they take up about 100MB, which is much larger than I'd prefer.

```
sudo rm -rf /opt/mysql/data/ib*
```

We're going to specify a smaller log file size later on.

# Configure MariaDB

Edit `/opt/bootlocal.sh` and add the following lines.

```
# MySQL
rm -rf /usr/local/mysql/data
ln -s /opt/mysql/data /usr/local/mysql/data
ln -sf /opt/mysql/my.cnf /usr/local/mysql/my.cnf
sudo -u tc /usr/local/mysql/bin/mysqld_safe 2>&1 > /dev/null &
```

This is not a "standard" approach for making configuration change in Tiny Core Linux, but I find that it's the simplest and most reliable.

Make a copy of `my.cnf` so we can change the configuration.

```
sudo cp /usr/local/share/mariadb/my.cnf /opt/mysql/
```

Uncomment the following line in `/opt/mysql/my.cnf` so we use a smaller InnoDB log file size.

```
innodb_log_file_size = 5M
```

# Reboot to start mysqld

With our changes to `bootlocal.sh`, `mysqld` should automatically start up on our next reboot and use our configuration changes.

```
sudo reboot
```

Voila!  `mysqld` should be running, and you should be able to connect to your server using the `mysql` client (it may take a couple of seconds before you can connect).

# Connect to mysql

From within Tiny Core you should be able to use the `mysql` client to connect to the server.

```
mysql -u root
```

# Notes

I can confirm that this minimal installation of MariaDB is sufficient to run WordPress, and I will soon post another article explaining how to get WordPress up and running in Tiny Core Linux.

In case you are interested, here is a much more verbose command that can also be used to run `mysqld`.

```
/usr/local/mysql/bin/mysqld \
  --basedir=/usr/local/mysql \
  --datadir=/opt/mysql/data \
  --plugin-dir=/usr/local/mysql/lib/plugin \
  --log-error=/var/log/mysql.err \
  --pid-file=/var/run/mysql.pid \
  --socket=/tmp/mysql.sock \
  --innodb_log_file_size=5M \
  --port=3306 &
```

Note that this command specifies a `--datadir` option so that `mysqld` uses the data directory we setup on `/opt`.  The `--innodb_log_file_size` is also being explicitly set.

#### It's not running!

If the server is not running, check the log file or use `ps ax | grep -i mysql` to verify `mysqld` is actually running.

Also, double check your symlinks and the data directory on `/opt/mysql`.

#### Why not just leverage Tiny Core's backup system and use .filetool.lst?

Yes, it is possible to solve this problem without needing to change the location of the data directory.  You could edit `/opt/.filetool.lst` and add `usr/local/mysql/data` as a persistent directory.

It's probably just me, but I was seeing some reliability issues with that method.  It seemed like my changes to `.filetool.lst` to persist the `data` directory were not always loading on reboot.

But more than anything, the reason I decided against that route is that I do not like the idea that I must execute the Tiny Core `backup` command to save changes to my databases.  What if my machine suddenly loses power?  None of the MySQL data would be saved because I never had a chance to run `backup`.

I prefer having data saved to my opt directory.  My `/opt` mount is persistent and mounted directly from an attached disk, and so all changes are saved to that persistent disk immediately.  It may decrease the life of my flash drive, but this is a very lightly used server I'm configuring, so I'll take the risk.
