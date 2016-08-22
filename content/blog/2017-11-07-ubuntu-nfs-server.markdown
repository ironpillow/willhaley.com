---
title: "Serve Either NFSv3 or NFSv4 From Ubuntu"
slug: ubuntu-nfs-server
date: 2017-11-09 0:01:00
---

These steps are for configuring an NFS **Linux server** on Ubuntu.

Install the `nfs-kernel-server` package.

```
sudo apt-get install nfs-kernel-server
```

Check to see if NFS is running.

```
sudo systemctl status nfs-kernel-server
```

Create a directory to serve via NFS.

```
sudo mkdir -p /srv/nfs
```

Create an `/etc/exports` file. In my case, I am serving my `/srv/nfs` directory to any machine on my network. You may read about the [other options](http://nfs.sourceforge.net/nfs-howto/ar01s03.html) online.

```
# /etc/exports
/srv/nfs 192.168.0.0/24(sync,no_subtree_check,insecure)
```

Reload the NFS export configuration now that our export is defined.

```
sudo exportfs -ra
```

You may disable versions of NFS by editing `/etc/default/nfs-kernel-server`.

This would disable NFSv3.

```
RPCMOUNTDOPTS="--manage-gids --no-nfs-version 3"
```

This would disable NFSv4.

```
RPCMOUNTDOPTS="--manage-gids --no-nfs-version 4"
```

Restart the appropriate services to ensure the changes take effect.

```
sudo systemctl restart nfs-config
sudo systemctl restart nfs-kernel-server
```

You can `grep` on `rpc.mountd` on your server to verify that your configuration is being used.

```
$ ps ax | grep rpc.mountd
3625 ?      Ss     0:00 /usr/bin/rpc.mountd --manage-gids --no-nfs-version 3
```

# Linux Client

You can use `showmount` to confirm your client can see the NFS shares.

```
$ sudo showmount -e 192.168.0.169
Export list for 192.168.0.169:
/srv/nfs 192.168.0.0/24
```

You can mount the NFS share like so.

```
sudo mount \
	-t nfs \
	-o vers=4 \
	192.168.0.169:/srv/nfs /mnt/tmp
```

The `vers=4` option is not required, but is helpful in ensuring that the server may have disabled a certain version.

If the server disables version 3 or 4, then the client should be rejected if it attempts to use that version.

See here an example where the client attempts to use an NFS protocol version that has been disabled by the server.

```
$ sudo mount -t nfs -o vers=3 192.168.0.169:/srv/nfs /mnt/tmp
mount.nfs: Protocol not supported
```
