---
title: "Mount an NFS Share on a Mac using the Terminal"
slug: mount-nfs-share-on-a-mac
date: 2016-12-28 11:08:46
date_modified: 2017-11-02 22:13:00
disqus: true
---

In this case we are mounting a share on a **Mac client** from a **Linux NFS server**.

The Linux NFS server is sharing the directory at `/srv/nfs` via both the NFS4 (nfsv4) and NFS3 (nfsv3) protocols.

The NFS share is mounted at `/mnt/nfs` on the Mac client.

```
sudo mount -t nfs 192.168.1.2:/srv/nfs /mnt/nfs
```

# Persistent Mount

If you want to make the NFS mount persistent (automatically mount at boot) on the Mac client, you can use the special `vifs` command and add that mount point. You **must** use `vifs` for this, **do not** edit `/etc/fstab` directly.

```
192.168.1.2:/srv/nfs    /mnt/nfs    nfs    rw
```

In my testing, this mount entry is resilient, and will not cause issues if the NFS server is unreachable.

# Troubleshooting

The `showmount` command is a great tool for debugging NFS issues. `showmount` can be used to list exports on an NFS server. This command should be run from the Mac client.

```
showmount -e 192.168.1.2
```

From the Mac client we can see that the Linux NFS server is serving the directory `/srv/nfs` and that the NFS share is accessible to `*` (everyone).

```
Export list on 192.168.1.2:
/srv/nfs    *
```

You can read up on Apple's [fstab](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man5/fstab.5.html) and [vifs](https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man8/vifs.8.html) implementations.

If you get the error `Operation not permitted` on the Mac client, you [may want to try](https://thornelabs.net/2013/10/15/operation-not-permitted-mounting-nfs-share-on-os-x-mountain-lion.html) adding `-o resvport` to your `mount` command on the Mac client.

If you get the error `Permission denied` on the Mac client, you [may want to try](https://superuser.com/questions/254339/how-to-mount-nfs-export-on-mac-os-x) adding the `insecure` option to the `/etc/exports` configuration on the Linux NFS server.
