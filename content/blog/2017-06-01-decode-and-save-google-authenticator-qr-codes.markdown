---
title: "Decode and Save Google Authenticator TOTP QR Code URLs"
slug: decode-and-save-google-authenticator-qr-codes
date: 2017-06-01 00:00:00
---

[zbarimg](http://manpages.ubuntu.com/manpages/xenial/man1/zbarimg.1.html) is a helpful command line tool that can take an image of a QR code and decode the underlying text represented by the code.

```
zbarimg qr-code.png
```

This is helpful if you want to decode a Google Authenticator TOTP (Time-based one time password), or any other sort of QR code content.

It should be noted that <span class="warning">saving the seed for TOTP codes may open you up to a security vulnerability</span>, but there may be cases when you want this information.

`zbarimg` can not only decode an image of a QR code, but a screenshot that contains a QR code. So if you cannot save the QR code as an image, you can simply take a screenshot and pass that to `zbarimg`.

```
zbarimg screenshot.png
```

Feel free to try it on this example QR code here.

![qr-code.png](/images/decode-and-save-google-authenticator-qr-codes/qr-code.png)

This QR code should decode to this content.

```
QR-Code:otpauth://totp/Example.com:alice@example.com?algorithm=SHA1&digits=6&issuer=Example.com&period=30&secret=K3XT7VEUS7JFJVCX
```

See also [zbarcam](http://manpages.ubuntu.com/manpages/xenial/man1/zbarcam.1.html).
