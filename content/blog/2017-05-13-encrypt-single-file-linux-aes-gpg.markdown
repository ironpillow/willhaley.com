---
title: "Encrypt a Single File on Linux with AES256 and GPG"
slug: encrypt-single-file-linux-aes-gpg
date: 2017-05-13 10:00:00
---

Encrypt

```
gpg \
    --cipher-algo AES256 \
    --symmetric \
    --output encrypted.file \
    plain.file
```

Decrypt

```
gpg \
    --output plain.file \
    --decrypt encrypted.file
```
