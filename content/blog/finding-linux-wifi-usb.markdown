---
title: "Why Is Finding A Reliable USB WiFi Device For Linux Difficult?"
date: 2017-10-07 16:08:00
date_modified: 2018-04-14 00:00:00
disqus: true
---

**TL;DR Most manufacterers do not play well with Linux. [ThinkPenguin Devices](https://www.thinkpenguin.com/catalog/wireless-networking-gnulinux) are designed for Linux and should always work out-of-the-box!**

Finding a reliable USB Linux WiFi device can be complicated.

I naively bought several devices from Amazon that had mixed reviews for Linux support, and I informally tested them at home on Ubuntu. It was a simplistic effort to find a card that worked out of the box on Ubuntu.

Some of the devices I purchased seemed to be working without issue and so I wrote [an article]({{<relref "linux-usb-wifi.markdown" >}}) proclaiming, "These devices work on Linux!" in the hope that I could help recommend devices for Linux users like me.

Although I may have had good intentions, that article was actually more harmful than helpful.

A commenter on that article [rightly pointed out to me](http://willhaley.com/blog/linux-usb-wifi/#comment-3480480313) the various problems with lists like mine that recommend specific USB WiFi devices for Linux, and I have since rewritten that article to be more informative and helpful.

I would summarize the issues (from my perspective) as follows.

* [Marketing and Sales confusion]({{<relref "#marketing-and-sales-confusion" >}})
* [Chipset Inconsistency]({{<relref "#chipset-inconsistency" >}})
* [Driver Support]({{<relref "#driver-support" >}})
* [Unpredictable Chipsets -> Unpredictable Features]({{<relref "#unpredictable-chipsets-unpredictable-features" >}})

**[This Debian article on WiFi](https://wiki.debian.org/WiFi) sums things up far better than I ever could.**

> Currently there are only a few modern wifi chipsets readily available that work with free software systems.
>
> ...
>
> USB Wifi cards are becoming less free.

I spent enough time and energy researching this that I figured I may as well share my fumblings and findings in case they are helpful to anyone.

[My own conclusion]({{<relref "#thinkpenguin-wifi-devices-for-linux" >}}) is that [ThinkPenguin devices](https://www.thinkpenguin.com/catalog/wireless-networking-gnulinux) are the only networking hardware I feel confident will always work on Linux, and that they are the only company that will give me the exact chipset they advertise. That alone is extremely helpful whenever I need Atheros chipsets for penetration testing. **Though, I must admit, the lack of modern features (5Ghz 802.11ac for instance) are a major downside for ThinkPenguin.**

In general, the state of USB WiFi on Linux is less than ideal. PCI cards, ethernet bridges, and USB WiFi tethering may be better options depending on your situation.

_I am no expert. Please comment and critique this article if you think I am way off the mark on any points. My opinions and observations are my own. I give no guarantees and you are responsible for your own purchasing decisions._

# Marketing and Sales Confusion

I buy almost everything on Amazon, and I rely on Amazon reviews to inform my purchasing. In my quest to find a USB WiFi device for Linux that "just works", I often found reviews like these.

One review for [the Panda PAU05 300Mbps](https://www.amazon.com/Panda-300Mbps-Wireless-USB-Adapter/dp/B00EQT0YK2/ref=cm_cr_srp_d_product_top?ie=UTF8) said it has an `RT5372` chipset.

<!-- https://www.amazon.com/review/RMT9IALY45B4T/ref=ask_dp_lswr_rp_hza -->
![Panda PAU05 300Mbps 1.png](/images/chipsets/Panda PAU05 300Mbps 1.png)

Another review says the same product has an `RT2870` chipset.

<!-- https://www.amazon.com/review/R9PNEUOR226MI/ref=ask_dp_lswr_rp_hza -->
![Panda PAU05 300Mbps 2.png](/images/chipsets/Panda PAU05 300Mbps 2.png)

What is happening? How are we seeing the same _model_ of a USB WiFi network device reportedly having multiple supported _chipsets_?

Here is another example of that same chipset inconsistency.

The **manufacturer** of the [ANEWISH Wifi Adapter 600Mbps USB Wifi Adapter](https://www.amazon.com/ANEWISH-Adapter-802-11ac-Wireless-10-4-10-12-5/dp/B06XMZ4Y4B/ref=sr_1_22?s=pc&ie=UTF8&qid=1506624585&sr=1-22&keywords=usb+wifi) says the chipset is an `RTL8111`.

<!-- https://www.amazon.com/ask/questions/TxY0F9PSNZI6CZ/ref=ask_dp_lsw_al_hza?asin=B06XMZ4Y4B -->\
![ANEWISH 600Mbps.png](/images/chipsets/ANEWISH 600Mbps.png)

Then a reviewer claims their device has the `RTL8188AU` chipset.

<!-- https://www.amazon.com/review/RTK95CJ3EUX21/ref=ask_dp_lswr_rp_hza -->
![ANEWISH 600Mbps 2.png](/images/chipsets/ANEWISH 600Mbps 2.png)
​

<!--

This is yet another example here where the [**manufacturer**](https://www.amazon.com/sp?_encoding=UTF8&asin=B01G8IPLD8&isAmazonFulfilled=1&isCBA=&marketplaceID=ATVPDKIKX0DER&orderID=&seller=A16UPHTV03MQOZ&tab=&vasStoreID=) of the [ANEWKODI 600Mbps Dual Band](https://www.amazon.com/gp/product/B01G8IPLD8/ref=ask_ql_qh_dp_hza) tells an Amazon user that that there are multiple chipsets for the same device, and the only way to tell the difference is the price.

![ANEWKODI 600Mbps Chipset.png](/images/chipsets/ANEWKODI 600Mbps Chipset.png)

-->

The [Edimax-EW-7811UTC](https://wikidevi.com/wiki/Edimax_EW-7811UTC) is another great example of this confusion in how devices can be marketed one way, but the underlying device internals are likely to be inconsistent.

The [WikiDev articles](https://wikidevi.com/wiki/Edimax_EW-7811UTC) for the Edimax-EW-7811UTC clearly state that there are multiple revisions of the same device.

> multiple revisions of this device, use caution

This is a case where a device is marketed and sold under one model number, but there are different internals being used across the multiple revisions of that one card. We have almost no guarantee or way of knowing which flavor we will receive.

For that Edimax device, it _seems_ the same chipset is used across [multiple revisions](https://wikidevi.com/w/index.php?title=Special:Ask&q=%5B%5BASIN%3A%3A~B00FW6T36Y*%5D%5D&p=format%3Dbroadtable%2Fheaders%3Dshow%2Flink%3Dall%2Fclass%3Dsortable-20wikitable-20smwtable&offset=&limit=&eq=no), but there is no guarantee there aren't other varying chipsets in use for that model right now, or in the near future. [One revision of that device](https://wikidevi.com/wiki/Edimax_EW-7811UTC) has a vendor id (VID) and product id (PID) of `7392:a811`, and [another revision of that same device](https://wikidevi.com/wiki/Edimax_EW-7811UTC_7392_A812) has a vendor id (VID) and product id (PID) of `7392:a812`.

We might, understandably, presume that the device with product id `a811` uses the [rtl8811au](http://www.realtek.com/products/productsView.aspx?Langid=1&PNid=21&PFid=57&Level=5&Conn=4&ProdID=400) chipset while the device with product id `a812` uses the [rtl8812au](http://www.realtek.com.tw/products/productsView.aspx?Langid=1&PFid=57&Level=5&Conn=4&ProdID=397) chipset, but it appears they _both_ use the `rtl8811au` chipset.

This behavior by companies to market devices with different internals, but the same branding and model number, can clearly lead to confusion.

# Chipset Inconsistency

What is going on in those reviews? Why is there confusion as to which chipset these USB WiFi devices will have, even when directly asking the manufacturers?

From what I've been told, read, and observed firsthand, **manufacturers can, and clearly do, sell the same _model_ of a USB WiFi product, but using _multiple varying chipsets_.**

The way this behavior manifests is as we see in the Amazon reviews above.

Two users can buy the same model of a card and end up with different chipsets.

```
Consumer A
	Buys WiFi Card X
	Card has chipset 123

Consumer B
	Buys WiFi Card X
	Card has chipset 456
```

This behavior is one of the issues that was pointed out to me by the helpful commenter on my other article.

Because of this behavior, articles [like the one I wrote]({{<relref "linux-usb-wifi.markdown" >}}) proclaiming, "These devices work on Linux!", are actually very dubious. How can I, or anyone else, recommend a USB WiFi card if I cannot guarantee which chipset a consumer will receive?

[ThinkPenguin](https://www.thinkpenguin.com/catalog/wireless-networking-gnulinux) solves this problem by using chipsets that are suited for Linux.

> Our products are freedom-compatible: Meaning they will work with just about any free software operating system.
>
> ...
>
> The chipsets we use encourage community development and user participation.

ThinkPenguin clearly indicates which (free software friendly) chipsets they use in each device, their chipsets are supported with open source drivers, and ThinkPenguin does not change their chipsets at random.

The [TP-Link N150 Wireless Nano USB Adapter (TL-WN725N)](https://www.amazon.com/TP-Link-N150-Wireless-Adapter-TL-WN725N/dp/B008IFXQFU/ref=sr_1_8?s=pc&ie=UTF8&qid=1506624585&sr=1-8&keywords=usb+wifi) is a perfect and unfortunate example of the chipset inconsistency problem.

<!-- https://www.amazon.com/ask/questions/TxXBMRIGZIIE6Q/? -->
![TP-Link N150 multiple chipsets.png](/images/chipsets/TP-Link N150 multiple chipsets.png).


It is a total gamble for Linux when we buy devices like these. **We have almost zero guarantee which chipset will be in our device when it arrives even when we buy the exact same model of a device as someone else.**

ThinkPenguin, on the other hand, uses predictable and reliable chipsets.

# Driver Support

Even if we decide to gamble and purchase an oddball USB WiFi device, I have found that the vendor-supplied Linux drivers for the USB WiFi devices I bought on Amazon were pretty awful.

The drivers were designed for 2.6 kernels, were poorly documented, and never installed properly.

This may not _always_ be the case, but considering I saw the vendor Linux drivers were consistenly terrible, I imagine it is a common occurance.

Because most consumer USB WiFi device manufacturers do not work with the community, [Linux support is problematic](https://wiki.debian.org/WiFi).

> Non-free drivers and firmware are produced by companies refusing or unable to cooperate with the free software community. With non-free drivers and firmware support is often unavailable or severely strained. For instance features are often left out, bugs go unfixed, and what support does exist from the manufacture is fleeting.

It seems to me that manufacturer behaviors make it exceedingly difficult to develop reliable Linux drivers. Again, this is a case where ThinkPenguin is an appealing choice for Linux since they [have mainline kernel support](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb). However, the USB WiFi space is [challenging](https://wiki.debian.org/WiFi) for ThinkPenguin.

>  With 802.11N there is only one chipset on the market from Atheros which is completely free.
>
> ThinkPenguin.com, has indicated the availability of free software supported 802.11N USB wifi cards is disappearing. Solving this problem will require more demand than currently exists. Next time you purchase a piece of hardware ask yourself if it is free software compatible.

I should point out that there certainly are [a plethora of other (non-free) Linux USB WiFi drivers out in the wild](https://wiki.debian.org/WiFi). It is not as though _only_ ThinkPenguin devices will work on Linux, but rather, they seem to have the best support due to the nature of their relationship with the Linux community.

# Unpredictable Chipsets -> Unpredictable Features

Some users may purchase WiFi devices because they want a particular chipset with a particular feature.

Since manufacturers often change chipsets at random, we cannot ensure that buying a card off of Amazon or some other electronics site will have the chipset we desire with the feature(s) we desire.

See examples of this issue here for the [TP-Link N150](https://www.amazon.com/TP-Link-Wireless-Adapter-TL-WN722N-Version/dp/B002SZEOLG/ref=cm_cr_srp_d_product_top?ie=UTF8). Some users received cards with an Atheros chipset that supports [monitor mode](https://en.wikipedia.org/wiki/Monitor_mode), which is ideal for security penetration testing. However, not _all_ the cards have that chipset, and some users were left in the lurch.

<!-- https://www.amazon.com/gp/customer-reviews/R2LH3GL82Z1L2Y/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B008IFXQFU -->
![Ath9k.png](/images/chipsets/Ath9k.png).

Other users purchasing **the same card** ended up with devices that had a **different chipset** that _does not_ support monitor mode.

<!-- https://www.amazon.com/review/R2EA3UWRN6RUKM/ref=ask_dp_lswr_rp_hza -->
![Not Atheros chipset.png](/images/chipsets/Not Atheros chipset.png).

This user had the same issue.

<!-- https://www.amazon.com/gp/customer-reviews/R13U0L7849J5L8/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B008IFXQFU -->
![Bad info.png](/images/chipsets/Bad info.png).

<!--
# Buyers Beware

It is entirely possible for cards with the same model number, but different chipsets, to have either very subtle or _no_ obvious differences, making it impossible to tell which one has which chipset.

https://www.amazon.com/review/RDCADVGT5FXLM/ref=ask_dp_lswr_rp_hza
![No visible indicators.png](/images/chipsets/No visible indicators.png).

This issue can be extremely frustrating if you want to purchase a card whose chipset supports a specific feature, like monitor mode.

https://www.amazon.com/gp/customer-reviews/R18SFO30VJKX5Q/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B008IFXQFU
![Monitor mode.png](/images/chipsets/Monitor mode.png).

And users may end up stuck with a card they cannot use, or that is lacking an essential feature they wanted.

https://www.amazon.com/gp/customer-reviews/R27VZHDA9H5ZX0/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B008IFXQFU
![TP-Link 1.png](/images/chipsets/TP-Link 1.png)

-->

<!--
# Chipset X Sucks. Long Live Chipset Y!

To further complicate matters, I occasionally ran into reviews like these.

Here we have a review claiming that Realtek is a "good chipset".

https://www.amazon.com/review/R1E095JYY583US/ref=ask_dp_lswr_rp_hza
![Realtek is great.png](/images/chipsets/Realtek is great.png)

Then, for another device, a review claiming that "Realtek is the worst of all chipset manufacturers".

https://www.amazon.com/gp/customer-reviews/R2SX2I0AV7XCAZ/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B003MTTJOY
![Realtek is awful.png](/images/chipsets/Realtek is awful.png)

For a person like myself who has _no experience_ with chipsets, it is difficult to look at the material online and determine what cards are the best bets.

My hunch would say most of these criticisms or support for any chipset are based more on opinions than facts, but it is difficult to tell.

-->

Since ThinkPenguin cards offer consistent chipsets, we can confidently purchase [a card with an Atheros chipset supporting monitor mode from ThinkPenguin](https://www.thinkpenguin.com/gnu-linux/penguin-wireless-n-usb-adapter-gnu-linux-tpe-n150usb) and know that we will receive a card with those features.

# ThinkPenguin WiFi Devices For Linux

A far better solution than playing this guessing game with manufacturers would seem to be purchasing the [networking devices sold by ThinkPenguin](https://www.thinkpenguin.com/catalog/wireless-networking-gnulinux).

These devices clearly list which chipset is used, and the open source drivers for these devices are included with pretty much every modern Linux kernel.

ThinkPenguin [makes a concerted effort](https://www.thinkpenguin.com/about) to sell hardware that is designed for Linux.

> The chipsets we use encourage community development and user participation. Users can not be locked into a vendor or product, be forced into an expensive upgrade, or have other digital restrictions placed on them.

As that [helpful commenter pointed out to me in my other article]({{<relref "linux-usb-wifi.markdown#comment-3480480313" >}}), ThinkPenguin devices are ideal for Linux.

> They're the only adapters you can be reasonably confident are going to be properly supported now and into the future because the community is able to fix bugs, add features, etc. They also don't change chipsets randomly so you know what your getting.

I understand ThinkPenguin devices may not suit everyone's needs. Their cards lack modern features, the prices may be a little more expensive, and shopping with ThinkPenguin may not be as convenient as with Amazon.

If we must buy a non-free USB WiFi card, all we can do is cross our fingers and hope for the best. Hope that the manufacturer from whom we purchase do their best to conform to best practices and act as faithful allies to the Linux community.

As someone who cares about free and open software and hardware, I plan to buy ThinkPenguin devices when they fit my needs. I will buy non-free devices as well, but I hope that supporting companies like ThinkPenguin will help the Linux community overall.

**As long as ThinkPenguin maintains their current stance, we know which chipset our USB networking cards will have that they will be well-supported on Linux.**

<!--

# But...Amazon

As much as I will shout out support for ThinkPenguin from the mountaintops, I understand a few shortcomings.

1. Most people probably go to Amazon without a second thought
2. ThinkPenguin has no cards supporting the [IEEE 802.11ac standard](https://en.wikipedia.org/wiki/IEEE_802.11ac)
3. ThinkPenguin cards may not support Feature X that you want

I think it is a tradeoff. Would you rather buy a card off Amazon and cross your fingers that you get the chipset you wanted, and may perform better? Or would you rather support open source and go with something a bit more reliable and predictable?

I went both routes. I bought some ThinkPenguin devices to help support their efforts, and still bought some Amazon cards for the sake of testing.

You _may_ scour the Amazon reviews for a device, and if you only ever find refernce of _one_ chipset, you could probably assume that manufacturer does not change their chipset, but again, there is **no guarantee** that they will not change it in the future, or that you will be the one unlucky customer to get a card with a different chipset.

If you go the Amazon route, be prepared to hunt for drivers or return the device if it does not suit your needs or is not what you expected.

# More Cards With Multiple Chipsets

​Chipset may vary - https://www.amazon.com/USB-N13-Wireless-N-Adapter-802-11b-Wireless/dp/B002UVNW5W/ref=sr_1_88?s=pc&ie=UTF8&qid=1506626052&sr=1-88&keywords=usb+wifi

https://www.amazon.com/gp/customer-reviews/R2U95S6MKSCILA/ref=cm_cr_getr_d_rvw_ttl?ie=UTF8&ASIN=B002UVNW5W
![ASUS USB-N13 1.png](/images/chipsets/ASUS USB-N13 1.png)

Oh no :(

https://www.amazon.com/Panda-300Mbps-Wireless-USB-Adapter/dp/B00EQT0YK2/ref=sr_1_58?s=pc&ie=UTF8&qid=1506626035&sr=1-58&keywords=usb+wifi

Even devices [that I recommended]() suffer from this issue :-/ I'm just as much a part of the problem.

This kind of product grid, good lucking sussing out reviews. https://www.amazon.com/Belkin-N300-Pocket-Adapter-300Mbps/dp/B004N625BO/ref=sr_1_53?s=pc&ie=UTF8&qid=1506626035&sr=1-53&keywords=usb+wifi
​
Multiple chipsets https://www.amazon.com/Belkin-N300-Pocket-Adapter-300Mbps/product-reviews/B004N625BO/ref=cm_cr_arp_d_viewopt_kywd?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=1&filterByKeyword=chipset
​
https://www.amazon.com/Panda-Wireless-PAU06-300Mbps-Adapter/product-reviews/B00JDVRCI0/ref=cm_cr_arp_d_viewopt_kywd?ie=UTF8&reviewerType=avp_only_reviews&pageNumber=1&filterByKeyword=chipset

Again :( I have the opposite chipset as seems to be popular in reviews...

​https://www.amazon.com/Edimax-EW-7811UTC-Dual-Band-Connectivity-Exceeding/dp/B00FW6T36Y/ref=sr_1_4?ie=UTF8&qid=1506626074&sr=8-4&keywords=usb+wifi+edimax

https://forums.macrumors.com/threads/disassemble-lacie-rugged-thunderbolt-disk.1507720/#post-18457976
And for external disk enclosures https://forums.macrumors.com/threads/disassemble-lacie-rugged-thunderbolt-disk.1507720/
![Enclosure Chipset.png](/images/chipsets/Enclosure Chipset.png)

https://www.raymond.cc/blog/best-compatible-usb-wireless-adapter-for-backtrack-5-and-aircrack-ng/
-->
