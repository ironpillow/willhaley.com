---
title: "Kinesis Hash Key Space Partitioning"
date: 2018-12-22 14:01:00
---

Before going any further, please note that there are **far better** resources around this topic than what I am sharing here in this article.

Here are a few articles that helped me on this topic:

* [PutRecord - Amazon Kinesis Data Streams Service API Reference](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecord.html)
* [A Binary Search Tree - Applied Go](https://appliedgo.net/bintree/)
* [Balancing a binary search tree - Applied Go](https://appliedgo.net/balancedtree/)
* [Kinesis Shard Splitting & Merging by Example](https://brandur.org/kinesis-by-example)
* [ELI5 ExplicitHashKey vs PartitionKey ...](https://www.reddit.com/r/aws/comments/a0xl14/eli5_explicithashkey_vs_partitionkey_in_kinesis/)
* [How to use ExplicitHashKey for round robin stream assignment in AWS Kinesis](https://stackoverflow.com/questions/44593533/how-to-use-explicithashkey-for-round-robin-stream-assignment-in-aws-kinesis)
* [A Tour of Go - Exercise: Equivalent Binary Trees](https://tour.golang.org/concurrency/7)
* [tree.go](https://golang.org/doc/play/tree.go)
* [tree - GoDoc](https://godoc.org/golang.org/x/tour/tree)

# Kinesis PartitionKey Hashing

The `PartitionKey` used when a producer puts/publishes to Kinesis is hashed like so `int128(md5sum(<PartitionKey>))`. That derived hash of the `PartitionKey` will determine where data lands on the stream. So if we `shard` (split) the stream into multiple even segments, the hashed key we generate determines which `shard` data will land on.

> Amazon Kinesis Data Streams uses the partition key as input to a hash function that maps the partition key and associated data to a specific shard. Specifically, an MD5 hash function is used to map partition keys to 128-bit integer values and to map associated data records to shards

A simple python script based on that description and a [couple](https://stackoverflow.com/questions/44593533/how-to-use-explicithashkey-for-round-robin-stream-assignment-in-aws-kinesis) [other](https://github.com/mhart/kinesalite/blob/master/db/index.js) sources illustrates how a predictable incremental integer `PartitionKey` value will result in a distinct skew for a relatively small set set of keys.

The minimum hash key in Kinesis is `0` and the max is `340282366920938463463374607431768211455`.

For a stream with two shards, any data with a hash key `< 170141183460469231731687303715884105728` (half the key space) will be in shard one. Anything greater will be in shard two. See here that with two shards being used to distribute keys for 14 unique inputs all but three will end up in shard two.

```
import hashlib

shard1 = 0
shard2 = 0

for x in range(1, 15):
    hash = int(hashlib.md5(str(x).encode('utf-8')).hexdigest(), 16)
    if hash < 170141183460469231731687303715884105728:
        shard1 += 1
        print(hash, 'shard1')
    else:
        shard2 += 1
        print(hash, 'shard2')

print('shard1:', shard1, 'shard2:', shard2)

$ python3 /tmp/check.py
(261578874264819908609102035485573088411L, 'shard2')
(266003691477286198901011725417809479212L, 'shard2')
(314755909755515592000481005244904880883L, 'shard2')
(223974724102701384270894320508706361900L, 'shard2')
(304197110536387568331823853743770900693L, 'shard2')
(29871468615243985478486908056489800412L, 'shard1')
(190188081314515644627836686569786975555L, 'shard2')
(268426020319259673719831598091001013101L, 'shard2')
(92737277766069325975379119957797678374L, 'shard1')
(281595222973318803755638905082365601824L, 'shard2')
(134349327668835346876933282647662472650L, 'shard1')
(257926471090385021762358474659294308112L, 'shard2')
(262007925198482523730006737380068994873L, 'shard2')
(226898901170458510997176709786703486038L, 'shard2')
('shard1:', 3, 'shard2:', 11)
```

The result is a fairly unbalanced distribution across our two shards when we rely on `PartitionKey` and the default Kinesis hashing mechanism using MD5 to try and evenly distribute keys. With this small set of keys we're stuck in one of the worst case scenarios from this key hash distribution method.

It is worth noting that as we increase the number of partition keys in our system, we will naturally approach a better key distribution if we rely on the built-in Kinesis hashing method.

```
n=24: ('shard1:', 9, 'shard2:', 15)
n=49: ('shard1:', 23, 'shard2:', 26)
n=99: ('shard1:', 45, 'shard2:', 54)
```

Depending on the use, relying on Kinesis and using the `PartitionKey` to derive the hash key is probably sufficient to get a reasonably distributed key space over a large enough dataset. That also means Kinesis does the heavy lifting and the developer needn't worry about determining the hash on their own.

But what about cases when we see a skew like we have here and it impacts performance? In that case, we may want to take the extra effort to generate hash keys ourselves to try and "better" partition the key space for our specific needs.

# Kinesis Shard Distribution

Kinesis uses an available key space from `[0, 2^128)`. So if we have one shard, we have an inclusive available key space of `0` to `340282366920938463463374607431768211455` as mentioned above.

```
aws kinesis describe-stream --stream-name test-1

    ...
    "ShardId": "shardId-000000000000",
    "EndingHashKey": "340282366920938463463374607431768211455"
    ...
```

If the MD5 hashing distribution using `PartitionKey` is sub-optimal, we may use the `ExplicitHashKey` to come up with _our own_ key hash to [explicitly define](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecord.html#Streams-PutRecord-request-ExplicitHashKey) where the data falls in the available key space when we call `PutRecord`.

> **ExplicitHashKey**
>
> The hash value used to explicitly determine the shard the data record is assigned to by overriding the partition key hash.

Even if we use the `ExplicitHashKey`, the `PartitionKey` is still a requirement both for [PutRecord](https://docs.aws.amazon.com/kinesis/latest/APIReference/API_PutRecord.html#API_PutRecord_RequestSyntax) SDK calls and when [using the cli](https://docs.aws.amazon.com/cli/latest/reference/kinesis/put-record.html). The `ExplicitHashKey` will take precedence and prevent Kinesis from using the `PartitionKey` to try and derive a hash key with MD5.

> **PartitionKey**
>
>   Required: Yes

If we split the shard from one to two, we can see how the explicit hash key works to distribute data across the shards.

```
$ aws kinesis update-shard-count --stream-name test-1 --target-shard-count 2 --scaling-type UNIFORM_SCALING
{
    "StreamName": "test-1",
    "CurrentShardCount": 1,
    "TargetShardCount": 2
}
```

When we describe the stream again, we can clearly see that the parent shard now has an ending sequence, and that we have two new shards that were split from this one parent shard.

```
"SequenceNumberRange": {
    "StartingSequenceNumber":
"49591109616310805454912940618220665305004298836394377218",
    "EndingSequenceNumber":
"49591109616321955827512205929790224238321098822804045826"
}
```

We can see that the two new shards represent the divided key space.

```
{
    "ShardId": "shardId-000000000001",
    "ParentShardId": "shardId-000000000000",
    "HashKeyRange": {
        "StartingHashKey": "0",
        "EndingHashKey": "170141183460469231731687303715884105727"
    },
    "SequenceNumberRange": {
        "StartingSequenceNumber":
"49591110086254409023548762079802856464523311355470544914"
    }
},
{
    "ShardId": "shardId-000000000002",
    "ParentShardId": "shardId-000000000000",
    "HashKeyRange": {
        "StartingHashKey": "170141183460469231731687303715884105728",
        "EndingHashKey": "340282366920938463463374607431768211455"
    },
    "SequenceNumberRange": {
        "StartingSequenceNumber":
"49591110086276709768747292702944392182795959716976525346"
    }
}
```

Of our two active shards, one shard covers all explicit hash keys from `0` to `170141183460469231731687303715884105727` and the other shard covers from `170141183460469231731687303715884105728` to `340282366920938463463374607431768211455`. We can also describe this distribution by saying that the first shard covers all keys from `[0, 2^64)` and the second shard covers all hash keys from `[2^64, 2^128)`.

If we try to insert records at or below `170141183460469231731687303715884105727` they will end up in shard one, and any records inserted with a hash key above that number will end up in shard two.

Please note that whether we use `PartitionKey` and let Kinesis calculate a hash for us automatically, or if we override that and explicitly set an `ExplicitHashKey` to manually set the hash ourselves, the result is the same. The only difference is who decides what the hash key is, and so which shard the data lands on. Either Kinesis does it for us, or we do it ourselves.

# Deriving a Balanced Key Space

**Again emphasizing that I am no expert. This is simply one approach and a collection of my thoughts while exploring this topic. The high-level concept was thanks to a co-worker and I expanded from there**

If we want to control which shard data will land on in the stream, we can specify an `ExplicitHashKey` that we associate with the inbound data based on some identifier that we choose.

If we want to handle `n` dynamic number of future shards, between `1` and `100000` (the max in Kinesis), this is one possible strategy to try and evenly distribute data across all possible permutations of the shard configurations.

Continually doubling our shards while sub-dividing and halving each recursive available key space should end up giving us an even key distribution that withstands splitting and merging of shards (**assuming we do not delete large numbers of keys and that the load is evenly balanced**).

I believe that the key space distribution strategy can be represented as a binary tree. _Note that I use values like `64`, `32`, but really (based on Kinesis' hash key space) these values represent `2^64`, `2^32`, etc._

```
# Shards | Keys/Shard | Splits in key space
---------+------------+-----------------------------------------------
1        | 2^128 - 1  |
2        | 2^64       |                     64
4        | 2^32       |         32                      96
8        | 2^16       |   16          48          80           112
16       | 2^8        | 8    24    40    56    72    88    104     120
```

As we split and add more shards, the partitioned key spaces double and compound with the previous key spaces. So if we have eight shards, then the available hash key spaces are partitioned into buckets between `0 - 16`, `16 - 32`, `32 - 48`, `48 - 64`, `64 - 80`, `80 - 96`, `96 - 112`, and `112 - 128`. Eight shards, eight partitions in our key space range, and the distribution of the keys should be optimal so that when we split _again_ in the future and add eight more shards, our keys will still be evenly distributed.

This seems to be an ideal strategy if we want to be able to spit over an arbitrary `n` number of shards and maintain an even distribution for however many unique producer data sources we have in the future.

For a concept like `users`, we could perhaps assign `user` data put onto the stream to a shard based on their `accountId`, and so we can associate a given `accountId` to a chosen `ExplicitHashKey`.

```
id      |    account |     explicit hash key
--------+------------+----------------------
User: 1 | Account: 1 | Explicit Hash Key: 64
User: 2 | Account: 1 | Explicit Hash Key: 64
User: 3 | Account: 2 | Explicit Hash Key: 32
User: 4 | Account: 3 | Explicit Hash Key: 96
```

In this way, we try and evenly distribute the data by tying an `ExplicitHashKey` to each account. **This assumes that the data being produced by each account is roughly similar in volume**.

These keys are chosen by us in a manner that distributes them evenly across the key space.

It's possible to predict the `nth` value in this tree if we're populating in order from left to right depth-first while maintaining a balanced tree height. This is only optimized (and can be improved) for a key space with a key space that is a factor or `2`. The keys chosen in this way would match the graphs above and can be expressed in a simple function like so.

```
package main

import (
	"fmt"
	"math"
)

func main() {
	for n := 0; n < 15; n++ {
		fmt.Println(nextKey(n, 128))
	}
}

// nextKey calculates the idea key to divide the partitioned
// space for the nth node and a given ceiling
func nextKey(n, ceil int) int {
	// For an ideal tree, we know the height at n
	treeHeight := math.Ceil(math.Log2(float64(n + 2)))

	// The maximum partition size per this treeHeight
	distribution := ceil >> uint(treeHeight)

	// The number of *new* keys we'll add
	// for this new partition subdivision
	keysPerHeight := ceil >> 1 / distribution

	// The index of the nth key relative to
	// this height and new partitioned space
	indexPerHeight := (n + 1) % keysPerHeight

	return distribution + (distribution << 1 * indexPerHeight)
}

# Outputs

64
32
96
16
48
80
112
8
24
40
```

However, this strategy has a problem. That algorithm fills the tree at `y` height from left to right, and the lowest level of the tree will be skewed during this process, and so the skew is worse the deeper the tree.

If we hold steady at 23 unique keys in our stream, then our key space looks like this. It is skewed to the left with 15 values, and 8 values on the other side. I believe that the worst case scenario we can get in is a situation where the tree is skewed `n` vs `2n - 1`. Still better than the worst case we saw with the MD5 Kinesis algorithm, but more problematic the deeper the tree gets as `n` increases.

```
Shards | Splits in key space
-------+-------------------------------------------------------------------------
1      |
2      |                                            64
4      |                    32                                     96
8      |        16                      48                   80           112
16     |   8          24          40          56          72    88    104     120
32     | 4   12    20    28    36    44    52    60
```

A better approach may be to use the solution above while distributing the keys so that the left and right halves of the parent nodes never vary by more than `1` in size.

So the distribution for 23 keys would look like this, ideally, with the nodes at the deepest level of the tree resulting in an even distribution for the parent nodes.

```
Shards | Splits in key space
-------+---------------------------------------------------------------
1      |
2      |                             64
4      |              32                               96
8      |      16              48                80             112
16     |   8     24        40     56         72    88      104     120
32     | 4     20        36     52        68    84      100     116
```

By always populating the left side for each node in the tree, then going through to the right side, we can balance the tree ideally for each new level of depth with an improved worst case scenario for any skew if we were to split the shards again.

With that pattern, we should be able to create ideal trees if we repopulate the tree from scratch and shuffle the key assignment for producers. Most importantly, we can deterministically find the *next* ideal key (even if it's in the middle of an existing tree) when we append new values.

That can be expressed like so (I'm sure this could be cleaner/more efficient).

```
package main

import (
	"fmt"
	"math"
)

func main() {
	for n := 0; n < 15; n++ {
		fmt.Println(nextKey(n, 128))
	}
}

// nextKey calculates the idea key to divide the partitioned
// space for the nth node and a given ceiling
func nextKey(n, ceil int) int {
	// For an ideal tree, we know the height at n
	treeHeight := math.Ceil(math.Log2(float64(n + 2)))

	// The maximum partition size per this treeHeight
	distribution := ceil >> uint(treeHeight)

	// The number of *new* keys we'll add
	// for this new partition subdivision
	keysPerHeight := ceil >> 1 / distribution

	// The index of the nth key relative to
	// this height and new partitioned space
	indexPerHeight := (n + 1) % keysPerHeight

	// Halfway through this height
	if indexPerHeight < int(math.Ceil(float64(keysPerHeight)/2)) {
		// Calculate the left leaf/left halves of the distribution
		return distribution + (distribution << 2 * indexPerHeight)
	}

	// Calculate the right leaf/right halves of the distribution
	return distribution * 3 + (distribution << 2 * (indexPerHeight - keysPerHeight >> 1))
}

# Outputs

64
32
96
16
80
48
112
8
40
72
104
24
56
88
120
```

The same could also be accomplished using a tree. It is slightly more expressive and easier to read, I find.

```
package main

import (
	"fmt"
)

type T struct {
	Left  *T
	Value int
	Right *T
}

func (t *T) String() string {
	if t == nil {
		return "()"
	}
	s := ""
	if t.Left != nil {
		s += t.Left.String() + " "
	}
	s += fmt.Sprint(t.Value)
	if t.Right != nil {
		s += " " + t.Right.String()
	}
	return "(" + s + ")"
}

func (t *T) Size() int {
	if t == nil {
		return 0
	}

	return t.Left.Size() + t.Right.Size() + 1
}

func main() {
	var (
		floor = 0
		max   = 128
		t     *T
		key   int
	)

	// Find the next n new balanced keys
	for n := 0; n < 7; n++ {
		t, key = nextKey(t, floor, max)
		fmt.Println("Key:", key, t)
	}
}

func nextKey(t *T, floor, max int) (*T, int) {
	value := floor + ((max - floor) >> 1)
	if t == nil {
		return &T{Value: value}, value
	}
	if t.Left.Size() <= t.Right.Size() {
		t.Left, value = nextKey(t.Left, floor, value)
	} else {
		t.Right, value = nextKey(t.Right, value, max)
	}

	return t, value
}

# Outputs

Key: 64 (64)
Key: 32 ((32) 64)
Key: 96 ((32) 64 (96))
Key: 16 (((16) 32) 64 (96))
Key: 80 (((16) 32) 64 ((80) 96))
Key: 48 (((16) 32 (48)) 64 ((80) 96))
Key: 112 (((16) 32 (48)) 64 ((80) 96 (112)))
```

That all works well for contrived examples, but what about when we delete and add keys later. Ideally, this is rare and controlled, but our ideal tree concept may falter and a severe skew certainly can occur.

```
Shards | Splits in key space
-------+--------------------
1      |
2      |           64
4      |        32
8      |     16
16     |   8
32     | 4
```

That would be a fairly severe scenario where none of the shards represented by the right side of the tree would be utilized. To go back to our `users` and `accounts` analogy, we could say that we have five accounts here, each with a dedicated `ExplicitHashKey`, but there is a heavy skew to the left as, unfortunately, the accounts using hash keys on the right side of the tree were all deleted.

Although we do not re-balance the tree automatically, we could try to balance on insert. So any _new_ `ExplicitHashKeys` should be on the right until balance is restored. This way we can try and rehydrate an existing un-balanced/messy tree and re-balance it as we add more keys in the future.

```
package main

import (
	"fmt"
)

type T struct {
	Left        *T
	Value       int
	Right       *T
	Placeholder bool
}

func (t *T) String() string {
	if t == nil {
		return "()"
	}
	s := ""
	if t.Left != nil {
		s += t.Left.String() + " "
	}
	s += fmt.Sprint(t.Value)
	if t.Right != nil {
		s += " " + t.Right.String()
	}
	return "(" + s + ")"
}

func (t *T) Size() int {
	if t == nil {
		return 0
	}

	size := 1
	if t.Placeholder {
		size = 0
	}

	return t.Left.Size() + t.Right.Size() + size
}

func main() {
	var (
		floor = 0
		max   = 128
		t     *T
		nextKey int
	)

	// Rehydrate the tree with existing keys
	existingKeys := []int{0, 32, 9, 57}
	for _, key := range existingKeys {
		t = insertAndBackfill(t, key, floor, max)
	}

	// Find the next n new balanced keys
	for n := 0; n < 8; n++ {
		t, nextKey = nextBalancedAvailableKey(t, floor, max)
		fmt.Println("Next Key:", nextKey, t)
	}
}

func insertAndBackfill(t *T, value, floor, max int) *T {
	// Invalid value
	if value < floor || value >= max {
		return nil
	}

	half := floor + ((max - floor) >> 1)
	if t == nil {
		// backfill the ideal values until we
		// are able to insert the explicit value
		// at the ideal position in the tree.
		t = &T{Value: half}
		if half == value {
			return t
		} else {
			t.Placeholder = true
		}
	}

	switch {
	case value < t.Value:
		t.Left = insertAndBackfill(t.Left, value, floor, half)
	case value > t.Value:
		t.Right = insertAndBackfill(t.Right, value, half, max)
	default:
		t.Placeholder = false
	}

	return t
}

func nextBalancedAvailableKey(t *T, floor, max int) (*T, int) {
	value := floor + ((max - floor) >> 1)
	if t == nil {
		return &T{Value: value}, value
	}
	if t.Placeholder {
		t.Placeholder = false
		return t, t.Value
	}

	if t.Left.Size() <= t.Right.Size() {
		t.Left, value = nextBalancedAvailableKey(t.Left, floor, value)
	} else {
		t.Right, value = nextBalancedAvailableKey(t.Right, value, max)
	}

	return t, value
}

# Outputs

Next Key: 64 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64)
Next Key: 96 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 (96))
Next Key: 80 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 ((80) 96))
Next Key: 112 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 ((80) 96 (112)))
Next Key: 72 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 (((72) 80) 96 (112)))
Next Key: 48 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 (((72) 80) 96 (112)))
Next Key: 104 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 (((72) 80) 96 ((104) 112)))
Next Key: 16 ((((((((0) 1) 2) 4) 8 (((9) 10) 12)) 16) 32 (48 (56 (((57) 58) 60)))) 64 (((72) 80) 96 ((104) 112)))
```

In this case we start off with our skewed tree.

```
[]int{0, 32, 9, 57}
```

We rehydrate/re-create the "ideal" tree by inserting those nodes and _backfilling_ placeholder nodes in the tree so that the structure looks like we want.

This results in a heavily left-skewed tree like we expected. We can see then that after the tree is re-created from the `existingKeys`, we can try and find the `nextBalancedAvailableKey` in the tree. Because the tree is skewed left, we insert values to the right until the tree is properly balanced again.

```
64
96
80
112
72
```

It's not until the sixth _new_ key that we insert anything on the left again, because the tree has finally re-balanced. Even then, we insert these values on the left half.

```
48
16
```

Because _within_ the left half, those two values help to balance those sub-trees.

This all works great if we're assigning new keys while we're deleting keys so that the tree remains balanced. However, if new `ExplicitHashKey` assignment is unlikely in the near future, the keys could be re-distributed from scratch to create a balanced tree.

It may not be efficient, but if adding a new key/data source to the stream is a finite controlled operation for a controlled number of keys, then it shouldn't be too painful.

Something to remember is that the actual _values_ in the trees are predictable for the use case in this article. We know we want to assign `2^64` as the first case as it is a perfect split on our key space, and (going left leaf first) `2^32` would be our next key, then `2^96`, etc down the tree as we partition the space evenly.

Also remember that this is all assuming **we** control the keys.