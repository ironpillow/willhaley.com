---
title: "Install rclone on Windows"
slug: install-rclone-on-windows
date: 2017-01-15 10:27:03
disqus: true
---

These are the steps I typically use to bootstrap an `rclone` install on Windows. My intentions with rclone are typically as a backup service, so this may not all be applicable to your use.

Create `C:\Program Files\rclone`.

Download rclone from [http://rclone.org/downloads/](http://rclone.org/downloads/) and unzip it to `C:\Program Files\rclone`.

Save this content as `C:\Program Files\rclone\rclone.bat`.

```
SET RCLONE_ROOT_FOLDER_NAME=
SET RCLONE_FOLDER_NAME=

SET RCLONE_DEST=SomeBackupService:%RCLONE_ROOT_FOLDER_NAME%

cd "C:\program files\rclone"

for /f "tokens=1,2 delims=;" %%X in (sources.txt) do (
	echo %%X
	echo %%Y

	rclone.exe --config="./.rclone.conf" --exclude-from "excludes.txt" -v sync "%%X" %RCLONE_DEST%/%RCLONE_FOLDER_NAME%/%%Y
)
```

Set `RCLONE_ROOT_FOLDER_NAME` to the name of the bucket on your cloud service where you want backups to go. I typically use `backups`.

Set `RCLONE_FOLDER_NAME` to the name of this backup job (assuming you have multiple machines/jobs backing up to the same cloud service). So you may use something like `backup1` or `Office Computer` or the date, or whatever suits your needs.

Create `C:\Program Files\rclone\sources.txt` file with a line for each source directory to backup, like so.

```
C:\Users\admin\Desktop;Desktop
```

The path before the `;` is the source path. After the `;` is the path/bucket used by the cloud service.

Create `C:\Program Files\rclone\excludes.txt` with a line for each globally excluded pattern.

```
"desktop.ini"
"Photo Booth Library"
".DS_Store"
".localized"
```

Run `rclone.exe config` to generate a config for that machine.

Move the generated config file from `%USERPROFILE%` to `C:\Program Files\rclone`.
