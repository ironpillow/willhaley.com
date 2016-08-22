---
layout: post
title: "Altiris Folder Automatic Organization"
date: 2012-02-03 23:13:00 -0500
comments: true
categories: 
---

During an Altiris Deployment Server implementation I was interested in a way to automatically sort computer objects based on office name. Some consultants I was working with at the time offered up the base code and a brief explanation of stored procedures. I ran with it and modified the SQL to suit my needs.

it was a good introduction to stored procedures and more complex SQL than I'd dealt with at the time.

<!--more-->

```
UPDATE dbo.computer
    SET group_id = (
      SELECT group_id FROM dbo.computer_group
      WHERE [name] = 'Beijing Desktops'
    )
    WHERE dbo.computer.computer_name LIKE 'BJG%'
```

After making a statement like this for each naming convention, and setting the procedure to run nightly, the result is an organized Altiris DS hierarchy.

One issue that came from this was that some machines were meant to stay in a specific container despite naming conventions.  The solution was to query for the ID of every computer in this specific container and pump the results into a temp table.  This was done before the body of the stored procedure.  After the sorting for each office is complete, a block of code moves the computers in the temp table back into the special "exempt" folder. It's not very efficient, but it's worked without issue when run at night against a collection of 3100 or so computers.

I've reworked this, cleaned up the code a little, and added the temp table for the special case computers.

Here's a truncated version of the SQL

```
------------------------------Special Exclusion OU-----------------------------------
DECLARE @GroupID INT;
DECLARE @GroupName VARCHAR(100);
SET @GroupName = 'This is a special exclusion OU.  Do not rename.';
DECLARE @TempTable TABLE
(
  computerID INT
);
SELECT @GroupID = group_id FROM computer_group WHERE name LIKE @GroupName;
INSERT INTO @TempTable (computerID)
  SELECT computer_id FROM computer WHERE group_id LIKE @GroupID;
------------------------------#Special Exclusion OU-----------------------------------
-----------Asia PAC --------------------
UPDATE dbo.computer
    SET group_id = (
      SELECT group_id FROM dbo.computer_group
      WHERE [name] = 'Beijing Computers')
    WHERE dbo.computer.computer_name LIKE 'BJG%'
----------------Europe----------------------
UPDATE dbo.computer
    SET group_id = (
      SELECT group_id FROM dbo.computer_group
      WHERE [name] = 'Dublin Computers')
    WHERE dbo.computer.computer_name LIKE 'DUB%'
----------------PXE servers -----------------------
UPDATE dbo.computer
    SET group_id = (
      SELECT group_id FROM dbo.computer_group
      WHERE [name] = 'PXE Servers')
    WHERE dbo.computer.computer_name LIKE '%PXE%'
------------------------------Special Exclusion OU-----------------------------------
UPDATE dbo.computer
    SET group_id = @GroupID
    WHERE dbo.computer.computer_id IN (
      SELECT computerid FROM @temptable)
------------------------------#Special Exclusion OU-----------------------------------
```

