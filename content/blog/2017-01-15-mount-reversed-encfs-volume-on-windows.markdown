---
title: "Mount a Reversed Encfs Volume on Windows"
slug: mount-reversed-encfs-volume-on-windows
date: 2017-01-15 10:01:03
---

The `-S` flag allows `encfs4win` to read passwords from stdin on Windows. Here we use a keyfile to script the mount of a reversed encfs share on Windows.

```
type C:\encfs-key.txt|C:\encfs4win\encfs.exe -S --reverse C:\Users\Will\Documents C:\Users\Will\Encrypted\Documents
```

You could also echo the password to the script

```
echo the-password|C:\encfs4win\encfs.exe -S --reverse C:\Users\Will\Documents C:\Users\Will\Encrypted\Documents
```
