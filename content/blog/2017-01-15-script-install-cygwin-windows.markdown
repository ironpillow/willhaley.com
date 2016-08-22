---
title: "Script to Install Cygwin on Windows"
slug: script-install-cygwin-windows
date: 2017-01-15 09:44:03
---

This is my script to perform an unattended silent install of Cygwin on Windows without use of the wizard.

Note that you can pre-configure the packages to install with `--packages`.

```
mkdir "%PROGRAMFILES%\cygwinx86"

REM Powershell 2
powershell -Command "(New-Object Net.WebClient).DownloadFile('https://cygwin.com/setup-x86.exe', '%PROGRAMFILES%\cygwinx86\setup-x86.exe')"

REM Powershell 3
REM powershell -Command "Invoke-WebRequest https://cygwin.com/setup-x86.exe -OutFile setup-x86.exe"

"%PROGRAMFILES%\cygwinx86\setup-x86.exe" ^
--site http://cygwin.mirror.constant.com ^
--no-shortcuts ^
--no-desktop ^
--quiet-mode ^
--root "%PROGRAMFILES%\cygwinx86\cygwin" ^
--arch x86 ^
--local-package-dir "%PROGRAMFILES%\cygwinx86\cygwin-packages" ^
--verbose ^
--prune-install ^
--packages openssh,git,rsync,nano
```

You could take that script above, host it, then make a one-liner like this.

```
REM Run this as administrator!
powershell (new-object System.Net.WebClient).DownloadFile('https://THE_URL/cyg.bat','%TEMP%\cyg.bat'); Start-Process "%TEMP%\cyg.bat"
```
