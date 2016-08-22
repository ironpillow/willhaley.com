---
layout: post
title: "Delay Windows Idle Timer"
date: 2012-02-03 23:01:00 -0500
comments: true
categories: 
---

[Download Project](/downloads/WinIdleDelay.zip)

Disclaimer: I realize this program can cause a headache for Windows workstation administrators, but I'd hope it also gives you an idea of how easy it is for your users to circumvent automatic locking of a workstation.

<!--more-->

I haven't tested it extensively, but it does work in Windows 7 x86 as an Admin I've found. It was created with a legitimate purpose. I work at a company where at 15 minute lockout policy is in place on all Windows computers on the domain. An issue that arose from the policy was that if a user was in the middle of a presentation the screen might continually lock if not in use. We'd prefer not to have our users log in as local accounts, and we didn't want to temporarily disable the lock out during presentations.

Using some examples I found online for launching a keyboard event in C# and accessing the Windows idle delay counter, I was able to get around the lockout by triggering a keyboard event if a certain program was found to be running. My "idle delay" program would only delay the idle timer if a program like PowerPoint (in presentation mode), Skype, or LiveMeeting was running, but this version below will delay the idle timer every few minutes no matter what.

For security reasons, this was never used, and instead we assisted users with setting up meetings using local computer accounts to avoid having to worry about the lock out. It means more setup is involved from IT for presentations, but seemed to be less of a headache than worrying about temporarily disabling the lockout or having clever users who knew how to circumvent the lock by opening a program.

A compiled version is attached.

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.Threading;
//for processes
using System.Diagnostics;
//for COM add-in
using System.Reflection;

namespace WinIdleDelay
{

    class Program
    {
        static void Main(string[] args)
        {
            Delay d = new Delay();
            DateTime start = DateTime.Now;
            Process[] processlist;
            bool willdelay = false;
            //loop forever
            while (true)
            {
                processlist = Process.GetProcesses();
                //add code here to look at running processes, if one is running that should trigger a delay, then delay
                //here we're always delaying the input timer no matter what
                willdelay = true;
                if (willdelay == true)
                {
                    d.delay();
                    Console.WriteLine("Time delayed at: " + DateTime.Now);
                }
                else
                {
                    Console.WriteLine("Do not delay timer.");
                }
                Console.WriteLine("Input Timer currently at: " + d.GetLastInputTime());
                //wait a few seconds
                System.Threading.Thread.Sleep(10000);
                //reset variable
                willdelay = false;
            }
        }
    }
    //here's the heart of it
    class Delay
    {
        [DllImport("user32.dll")]
        static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
        [DllImport("user32.dll")]
        public static extern void keybd_event(
        byte bVk,
        byte bScan,
        uint dwFlags,
        uint dwExtraInfo
        );

        const int VK_CONTROL = 0x11;
        const uint KEYEVENTF_KEYUP = 0x2;
        bool ctrlPressed = false;

        public Delay()
        {

        }
        //we're actually triggering a keyboard event.
        public void delay()
        {
            keybd_event((byte)VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
        }
        //you can access the timer used to monitor input events.  This timer gets reset when an event is triggered and delays things like locking of the screen.
        public int GetLastInputTime()
        {
            int idleTime = 0;
            LASTINPUTINFO lastInputInfo = new LASTINPUTINFO();
            lastInputInfo.cbSize = Marshal.SizeOf( lastInputInfo );
            lastInputInfo.dwTime = 0;

            int envTicks = Environment.TickCount;

            if ( GetLastInputInfo( ref lastInputInfo ) )
            {
                int lastInputTick = lastInputInfo.dwTime;
                idleTime = envTicks - lastInputTick;
            }
            return (( idleTime > 0 ) ? ( idleTime / 1000 ) : 0);
        }
    }
}
[StructLayout(LayoutKind.Sequential)]
struct LASTINPUTINFO
{
    public static readonly int SizeOf = Marshal.SizeOf(typeof(LASTINPUTINFO));

    [MarshalAs(UnmanagedType.U4)]
    public int cbSize;
    [MarshalAs(UnmanagedType.U4)]
    //public UInt32 dwTime;
    public int dwTime;
}
```

