---
title: "Single Running Instance of a Java Application"
slug: java-single-instance
date: 2012-02-03 23:08:00
---

I've been trying to find a reliable way to make sure I only have a single instance of a running Java application. A lot of suggestions I found online recommended opening a Socket on a specific port that you reserve for your program. I don't like this approach because it seems a bit short-sighted. If another program needs to be deployed on your computer(s) and that program uses the same port as your own then you have a conflict. Imagine your program is deployed to a few thousand computers. Now you have a major issue.

Another popular answer is to write a sort of Lock File. If this file exists or has a certain value, you assume the application is running. When the program is shutdown cleanly you delete this lock file. My issue with this approach is that a sudden power loss to your system might result in your application not closing or unlocking the file like expected. My answer isn't necessarily the end all be all, but I do think it's a little less hokey.

<!-- more -->

I was given my idea thanks to chatoicjava.com. By making use of the same library used for JPS (a command line tool bundled with the JDK used to monitor running instances of the JVM), you can iterate through running Java Applications and verify if there's one running that matches whatever pattern you specify. If the command line used to launch a particular program in the JVM, the class name of the entry point for that program, the name of the jar file used to launch the program, or another criteria you specify, matches criteria used to distinguish your application then you can have your application quit immediately.

The library being used is `tools.jar`. You should find it in the installation dir of your JDK. At least, it should be there if you're using the Oracle/Sun JDK. It adds 3.5MB to your project, but personally, I think it's worth it. I found it works on OSX, XP, and Windows 7.

```
int counter = 0;
/*
 * http://chaoticjava.com/posts/retrieving-a-vms-pid-and-more-info-through-java/
 * adds about 3.5MB to the application, but small enough overall that I think
 * it's worth it to verify we only have one running instance
 */
System.out.println("Verify if another running instance is active...");
try {
  //get monitored host for local computer
  MonitoredHost host = MonitoredHost.getMonitoredHost(new String("localhost"));
  //System.out.println(host.getHostIdentifier());
  //System.out.println(host.activeVms());
  int pid;
  MonitoredVm vm;
  String vmClass;
  String vmCmdLine;

  //iterate over pids of running applications on this host.
  //seems every application is considered an instance of the 'activeVM'
  for(Object activeVMPid : host.activeVms()) {
    pid = (Integer)activeVMPid;
    System.out.println("Looking at pid: " + pid);

    //get specific vm instance for given pid
    vm = host.getMonitoredVm(new VmIdentifier("//" + pid));

    //get class of given vm instance's main class
    vmCmdLine = MonitoredVmUtil.commandLine(vm);
    vmClass = MonitoredVmUtil.mainClass(vm, true);

    //is class in vm same as class you're comparing?
    System.out.println("class to examine: [" + vmClass + "]");
    System.out.println("cmd line to examine: [" + vmCmdLine + "]");

    if(vmClass.equals(myClass.class.getName()) ||
      vmClass.equals("myJar.jar") ||
      (
        vmCmdLine.contains("myJar.jar") ||
        vmCmdLine.contains(myClass.class.getSimpleName())
      ))
    {
      counter++;
      System.out.println("Match to current class");
    }
  }
  System.out.println("Found running instances of this " +
    "program (including this one): " + counter);
  System.out.println("Runtime info of this class: " +
    ManagementFactory.getRuntimeMXBean().getName());
} catch (Exception e) {
  e.printStackTrace();
}
if(counter > 1) {
  System.out.println("Attempting to run more than " +
    "one instance. Exiting.");
  System.exit(-1);
} else {
  new myClass(args).run();
}
```
