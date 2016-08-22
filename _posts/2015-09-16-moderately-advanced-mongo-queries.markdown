---
layout: post
title: "Moderately Advanced Mongo Queries"
date: 2015-09-16 21:31:40 -0500
comments: true
categories: 
---

Here are a few queries and miscellaneous commands that I like to keep on hand, and may help you as well.

<!-- more -->

## MongoDB Cheat Sheet

### Restore a multi-collection Mongo DB dump.

    tar -xzvf /tmp/backup.tar.gz -C /tmp && mongorestore --drop /tmp/databaseName/

### Export data from a Mongo collection to a CSV.

    mongoexport -u USERNAME -p PASSWORD -c "COLLECTION" -h HOST -d DB -q '{whateverYourQueryIs: true}' -f '_id,field1,field2,field3' --csv -o output.csv

### Query by and sort by date.

    db.somecollection.find({someDateField: { $gte: new Date('2015-01-01') }}).sort({someDateField: 1}).limit(1).pretty()

### Find documents containing a non-empty object.

    db.somecollection.find({someObjectField: {$exists: true, $gt: {}}}).limit(1).pretty()

### Add an object to an array in a document.

    // This assumes the array already exists on the document. We are simply adding an item to it.
    db.somecollection.update({someCriteria: 'whatever'}, {$push: {"someArray": "someValue"}})

### Add an object to an array nested in an object on a document.

    // Document looks like: { _id: 123, someObject: { someArray: [] } }
    db.somecollection.update({someCriteria: 'whatever'}, {$push: {"someObject.someArray": "someValue"}})

### Remove an object from an array nested in on object on a document.

    // Document looks like: { _id: 123, someObject: { someArray: ['someValue'] } }
    // Note the use of `$pull` instead of `$push`.
    db.somecollection.update({someCriteria: 'whatever'}, {$pull: {"someObject.someArray": "someValue"}})

### Find documents by array length.

    // This would find any document where `someArray` has an item at position `0`, and so has at least one item.
    db.somecollection.find({'someArray.0': {$exists: true}})

### Aggregate documents to find patterns in our data.

    // In this example, we query for a `userId` field on documents in the
    // `receipts` collection to find which userId has the most receipts. We limit
    // the results to five and sort them in *descending order*. This gets us
    // the list of the top five users with the most receipts.
    db.receipts.aggregate([
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 }
        }
      }, {
        $sort: {
          count: -1
        }
      }, {
        $limit: 5
      }
    ])


### Aggregate documents to get relevant analytic information.
    
    // Aggregation is a pipeline. First, we `$match`, then we send those results
    // to `$group`, then, we send those results to a different `$match` clause.

    // In this example, we can aggregate our receipts to find documents where
    // there was an item on sale, then group those receipts by the user.
    // 1) `$match` items on sale that have a `userId` (every receipt should have one, but just being safe).
    // 2) `$group` those receipts with sales by the `userId`.
    // 3) `$match` those receipts grouped by `userId` and only return the results that have more than one match.

    // This would get us documents for users who bought more than one item on sale.
    // We could make this more interesting by adding something like 'purchaseDate' 
    // to the first $match so that we can find users who bought more than one item on sale
    // during a certain period.
    db.receipts.aggregate(
      [
        {
          $match: {
            containsItemOnSale: true,
            userId: {
              $exists: true
            }
          }
        }, {
          $group: {
            _id: {
              userId: "$userId"
            },
            count: {
              $sum: 1
            }
          }
        }, {
          $match: {
            count: {$gt: 1}
          }
        }
      ]
    )
