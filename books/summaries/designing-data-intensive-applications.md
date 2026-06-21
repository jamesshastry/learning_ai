---
title: "Designing Data-Intensive Applications"
author: Martin Kleppmann
publisher: O'Reilly
year: 2017
isbn: 978-1-449-37332-0
tags: [distributed-systems, databases, replication, consistency, batch-processing, stream-processing]
---

# Designing Data-Intensive Applications

**Martin Kleppmann — O'Reilly, 2017**

The book is organized into three parts:
- **Part I: Foundations of Data Systems** (Chapters 1–4): storage, retrieval, encoding, and data models
- **Part II: Distributed Data** (Chapters 5–9): replication, partitioning, transactions, and consistency
- **Part III: Derived Data** (Chapters 10–12): batch processing, stream processing, and the future of data systems

---

## Chapter 1 — Reliability, Scalability, and Maintainability
**Pages: 3–22**

### TL;DR
Data-intensive applications must be built to tolerate faults, handle growing load, and remain understandable and changeable over time. These three axes — reliability, scalability, and maintainability — are the foundational non-functional requirements for any serious data system.

### Key Concepts
- **Reliability**: The system continues working correctly even when things go wrong. Faults (hardware failures, software bugs, human errors) are different from failures. The goal is to build fault-tolerant systems, not fault-free ones.
  - Hardware faults: disk failures, RAM errors, power outages — addressed with RAID, redundant power supplies, hot-standby servers
  - Software errors: bugs that lie dormant, runaway processes, cascading failures from bad inputs
  - Human errors: the biggest cause; addressed through good APIs, sandboxes, easy rollback, monitoring, and training
- **Scalability**: The ability to handle increased load. Load is described via *load parameters* (e.g., requests per second, read/write ratio, active users).
  - Twitter's fan-out challenge: posting a tweet to timelines can mean writing to millions of caches; hybrid approaches mix push and pull depending on follower count
  - **Response time percentiles**: p50 (median), p95, p99, p999 — tail latencies matter because high-value users or those making many requests are most affected
  - Head-of-line blocking: a slow request delays all subsequent requests, inflating percentile measurements
  - Vertical scaling (more powerful hardware) vs. horizontal scaling (more machines, shared-nothing architecture)
- **Maintainability**: Making it easier for engineers to work on the system over time.
  - *Operability*: making routine tasks easy for operations teams
  - *Simplicity*: managing complexity through abstraction (hiding implementation detail behind clean interfaces)
  - *Evolvability* (also called extensibility or plasticity): making changes easy as requirements evolve

### Notable Frameworks/Techniques Mentioned
- Twitter's timeline architecture (fan-out on write vs. fan-out on read)
- Response time percentile measurement and SLA definitions
- Amazon's observation that 100ms response time increases purchases

### Key Takeaway
The three most important properties of data systems are reliability (correct behavior under faults), scalability (maintaining performance as load grows), and maintainability (ease of modification and operation). These trade off against each other and must be balanced against the specific needs of your application.

---

## Chapter 2 — Data Models and Query Languages
**Pages: 27–63**

### TL;DR
Different data models (relational, document, graph) each excel at different use cases, and the choice of data model profoundly affects how problems are solved. Declarative query languages like SQL separate "what" from "how," giving the database engine room to optimize.

### Key Concepts
- **Impedance mismatch**: Most application code is object-oriented, but relational databases use a table/row/column model. ORMs reduce but do not eliminate translation friction.
- **Document model** (MongoDB, CouchDB, RethinkDB): Uses JSON or XML trees. Good for self-contained, hierarchical documents with one-to-many relationships. Flexible schema (schema-on-read vs. schema-on-write). Poor for many-to-many joins.
- **Relational model** (MySQL, PostgreSQL): Uses normalized tables with foreign keys. Good for many-to-many relationships. Joins are powerful but require the query planner to optimize them.
- **Graph model** (Neo4j, Datomic): Uses vertices and edges. Best for data where anything can be related to anything — social networks, fraud detection, routing, recommendation engines. Two main models:
  - *Property graphs*: vertices and edges have properties; edges have a label/type
  - *Triple-stores*: (subject, predicate, object) triples; Turtle/N3 format; SPARQL query language
- **Query language comparison**:
  - SQL is *declarative*: specify what you want, not how to get it; the optimizer picks the execution plan
  - Imperative code specifies the exact operations in order; harder to parallelize and optimize
  - MapReduce is a hybrid: declarative-ish data selection, imperative transformation functions
- **Datalog**: A declarative logic language that rules can be composed, predating SQL; used in Datomic

### Notable Frameworks/Techniques Mentioned
- MongoDB (document model), CouchDB, RethinkDB
- Neo4j, Titan (graph databases)
- SPARQL, Cypher (Neo4j's graph query language), Datalog
- SQL and MapReduce as contrasting paradigms

### Key Takeaway
There is no universally superior data model. The relational model excels at many-to-many relationships and ad-hoc queries; the document model at self-contained hierarchical records; the graph model at highly connected data where the relationships themselves are important. Choose based on the structure of your data and the queries you need to run.

---

## Chapter 3 — Storage and Retrieval
**Pages: 69–104**

### TL;DR
Storage engines come in two major families: log-structured (optimized for sequential writes, good for high write throughput) and page-oriented (B-trees, optimized for reads and point updates). Understanding how storage engines work helps you choose the right one and tune it effectively.

### Key Concepts
- **Log-structured storage**:
  - The simplest "database" is an append-only log with in-memory hash index (Bitcask approach). Fast writes, but the entire key set must fit in memory.
  - *SSTables* (Sorted String Tables): log segments sorted by key, with a sparse in-memory index. Efficient range scans and merging via merge sort.
  - *LSM-Trees* (Log-Structured Merge Trees): incoming writes go to an in-memory memtable, flushed to disk as SSTables, compacted in the background. Used by LevelDB, RocksDB, Cassandra, HBase, Lucene.
  - Bloom filters reduce unnecessary disk reads for missing keys
  - Two compaction strategies: size-tiered (Cassandra, HBase) vs. leveled (LevelDB, RocksDB, Cassandra option)
- **B-Trees**: The dominant structure in relational databases.
  - Data stored in fixed-size pages (typically 4KB), forming a balanced tree
  - Branching factor (often several hundred) determines tree depth; most databases need 3–4 levels for billions of records
  - Writes update pages in-place (unlike LSM's append-only)
  - WAL (Write-Ahead Log) provides crash recovery
  - Latches (lightweight locks) protect the tree during writes
  - LSM-Trees have higher write throughput and better compression; B-Trees have more predictable read latency
- **OLTP vs. OLAP**:
  - OLTP: small number of records per query, accessed by key; row-oriented storage
  - OLAP: large scans over many records, aggregating values; data warehouses, star/snowflake schemas
- **Column-oriented storage**: Store each column's values together rather than each row together.
  - Dramatically reduces I/O for analytic queries that only need a few columns from a wide table
  - Enables excellent compression (bitmap encoding, run-length encoding)
  - Sort orders: primary sort key enables run-length compression; Vertica supports multiple sort orders via replicas
  - **Materialized views**: pre-aggregated query results stored on disk; *data cubes* are a special case aggregating over multiple dimensions

### Notable Frameworks/Techniques Mentioned
- LevelDB, RocksDB (LSM-Tree implementations)
- Cassandra, HBase (distributed LSM-Tree databases)
- Lucene (search index using LSM principles)
- Teradata, Vertica, ParAccel, Amazon Redshift (column-oriented warehouses)
- Apache Parquet (column-oriented file format for Hadoop)

### Key Takeaway
LSM-Trees shine for write-heavy workloads because all writes are sequential appends; B-Trees win for read-heavy workloads because any value can be found in a few page accesses. Column-oriented storage fundamentally changes the access pattern for analytics: by reading only the columns relevant to a query, data warehouses can process orders of magnitude more data per second.

---

## Chapter 4 — Encoding and Evolution
**Pages: 111–144**

### TL;DR
Encoding (serialization) determines how data is translated between in-memory and on-disk/on-wire representations. Schema evolution — the ability to change data formats without breaking readers — is essential for rolling upgrades and long-running systems. Binary encoding formats with explicit schemas vastly outperform schemaless JSON/XML in both size and evolvability.

### Key Concepts
- **Problems with JSON/XML/CSV**:
  - Ambiguous number encoding (JSON can't distinguish integers from floats; no 64-bit integers)
  - No built-in support for binary data
  - No schema means no automatic compatibility checking; parsing is ad hoc
  - CSV has no standard escaping rules
- **Binary encoding formats**:
  - *Thrift* (Facebook, 2007): two encodings — BinaryProtocol (field tags, type codes, lengths) and CompactProtocol (variable-length integers). Schema defined in Thrift IDL.
  - *Protocol Buffers* (Google): similar to Thrift CompactProtocol. Field tags in the schema identify fields in the binary encoding. Required vs. optional distinction.
  - *Avro* (Apache Hadoop project): no field tags in binary data; reader and writer schemas are reconciled side-by-side. Schema evolution supported via schema registry. Best for dynamically generated schemas (Hadoop use case).
- **Schema evolution**:
  - *Forward compatibility*: new code can read data written by old code (old fields still present, new optional fields have defaults)
  - *Backward compatibility*: old code can read data written by new code (old code skips unknown fields; new required fields must have defaults)
  - Field tags in Thrift/Protobuf allow fields to be added or removed while maintaining compatibility
  - Avro requires the full writer schema to be available when reading (stored in the file or retrieved from a schema registry)
- **Dataflow modes**:
  - *Databases*: encoding for persistence; schema evolution needed for long-lived data
  - *Services (REST and RPC)*: request/response; REST uses HTTP features (verbs, status codes, URLs); RPC tries to make network calls look like local calls (a "leaky abstraction")
  - gRPC uses Protocol Buffers over HTTP/2; Thrift and Avro have their own RPC frameworks
  - *Message brokers* (asynchronous): producers send messages, consumers receive them; decoupled; RabbitMQ, ActiveMQ, Kafka. Messages must be decodable by consumers with different schema versions.

### Notable Frameworks/Techniques Mentioned
- Apache Thrift, Protocol Buffers (Protobuf), Apache Avro
- gRPC (Google), Finagle (Twitter), Rest.li (LinkedIn)
- RabbitMQ, ActiveMQ, HornetQ, NATS, Apache Kafka, Google Cloud Pub/Sub

### Key Takeaway
Binary encoding with explicit schemas (Thrift, Protobuf, Avro) provides both compact encoding and machine-verifiable schema evolution — a major improvement over schema-on-read JSON/XML. The key to evolvability is maintaining forward and backward compatibility: new fields should have defaults, old fields should never be removed if old readers depend on them, and field tags (or schema reconciliation in Avro) should be preserved across schema changes.

---

## Chapter 5 — Replication
**Pages: 151–194**

### TL;DR
Replication keeps copies of data on multiple machines for fault tolerance, scalability, and geographic distribution. The hard problem is handling writes: there are fundamental trade-offs between the number of leaders, the consistency guarantees offered to clients, and the complexity of conflict resolution.

### Key Concepts
- **Single-leader replication**:
  - One node (the leader) accepts writes; replicas (followers) apply writes from the leader's replication log
  - *Synchronous*: leader waits for follower confirmation before acknowledging write to client. Guarantees up-to-date follower but blocks if follower is slow.
  - *Asynchronous*: leader does not wait; better availability but follower may lag
  - Failover: promoting a follower to leader; risks include data loss (uncommitted writes), split-brain (two leaders), and choosing the right timeout
  - Replication lag anomalies:
    - *Read-after-write consistency* (read-your-writes): client reads its own write; can be achieved by routing reads of recently written items to the leader
    - *Monotonic reads*: client doesn't see data moving backward in time; route same user's reads to same replica
    - *Consistent prefix reads*: related writes appear in the correct causal order; partition-level monotonic writes help
- **Multi-leader replication**:
  - Multiple nodes accept writes; each acts as both a leader (for its local writes) and a follower (applying writes from other leaders)
  - Good for multi-datacenter and offline-capable clients
  - The hard problem: **write conflicts** when two leaders concurrently modify the same record
  - Conflict resolution approaches: *Last Write Wins* (LWW) by timestamp (risk of data loss), *union of values*, *merge functions*, *CRDTs* (Conflict-free Replicated Data Types), *operational transformation* (used in Google Docs)
  - Replication topologies: all-to-all, circular, star
- **Leaderless replication** (Dynamo-style, used by Cassandra, Riak, Voldemort):
  - Clients (or coordinators) write to and read from multiple replicas in parallel
  - **Quorums**: with n replicas, writes to w nodes and reads from r nodes; if w + r > n, at least one read node must have the latest value
  - *Sloppy quorums*: during network partitions, writes go to any n reachable nodes, not necessarily the "home" nodes; *hinted handoff* sends the data to its home nodes when they reconnect
  - **Version vectors**: detect concurrent writes by tracking which value comes from which replica and when; allows the application to merge siblings

### Notable Frameworks/Techniques Mentioned
- MySQL, PostgreSQL, Oracle Data Guard (single-leader)
- CouchDB, Espresso (LinkedIn), Tungsten Replicator (multi-leader)
- Amazon Dynamo, Cassandra, Riak, Voldemort (leaderless)
- CRDTs (Riak), operational transformation (Google Docs)

### Key Takeaway
Every replication scheme makes a trade-off between availability and consistency. Single-leader replication is the simplest to reason about but creates a bottleneck and a single point of failure. Multi-leader and leaderless replication improve availability and write throughput but introduce write conflicts and weaker consistency guarantees. The right choice depends on your application's tolerance for stale reads and data loss.

---

## Chapter 6 — Partitioning
**Pages: 199–228**

### TL;DR
Partitioning (sharding) distributes data across multiple nodes so that each node holds only a subset of the data. The partitioning strategy determines the distribution of data and queries across nodes; a poor strategy causes hot spots while a good one enables near-linear scalability.

### Key Concepts
- **Key range partitioning**: Assign sorted ranges of keys to partitions (like encyclopedia volumes). Enables efficient range queries. Risk: hot spots if writes cluster in one partition (e.g., time-series data where all writes go to the partition for "today").
- **Hash partitioning**: Assign partitions based on a hash of the key. Distributes keys more uniformly and avoids hot spots. Downside: loses sort order; range queries must scan all partitions.
  - Cassandra uses a compound primary key: first part is hashed for partitioning, remaining parts are sorted within the partition. Enables efficient range scans within a partition.
  - Hot spots from specific keys (e.g., a celebrity's user ID) can still occur; a common workaround is to append a random number to the hot key to spread writes across multiple partitions.
- **Secondary indexes**:
  - *Document-partitioned (local) secondary indexes*: each partition maintains its own secondary index for the documents in that partition. Writes update only the local partition's index. Reads must scatter-gather across all partitions.
  - *Term-partitioned (global) secondary indexes*: a global index is itself partitioned (by the indexed term). Writes must update multiple partitions (the home partition for the record and the partition(s) for each indexed term). Reads can go to just the relevant partition of the index.
- **Rebalancing**:
  - *Fixed number of partitions*: create many more partitions than nodes; move entire partitions when adding nodes. Used by Riak, Elasticsearch, Couchbase, Voldemort.
  - *Dynamic partitioning*: partitions split when they exceed a size threshold and merge when they shrink. Used by HBase, RethinkDB, MongoDB.
  - *Proportional to number of nodes*: each node has a fixed number of partitions; partitions grow with data but number of partitions per node stays constant. Used by Cassandra, Ketama.
- **Request routing**: How does a client know which node holds the data it wants?
  - Any node (gossip protocol among nodes, used by Cassandra and Riak)
  - Routing tier (dedicated coordinator, used by Zookeeper-backed systems like HBase, SolrCloud)
  - Clients aware of partitioning (used by Cassandra and Riak in some configurations)
  - ZooKeeper tracks cluster state; other nodes/tiers subscribe to ZooKeeper to stay informed

### Notable Frameworks/Techniques Mentioned
- Cassandra (compound keys, consistent hashing)
- HBase, RethinkDB, MongoDB (dynamic partitioning)
- Couchbase, Voldemort (fixed partition count)
- Elasticsearch, Solr, Riak (various approaches)
- Apache ZooKeeper (cluster metadata and coordination)

### Key Takeaway
The fundamental tension in partitioning is between even data distribution (favored by hash partitioning) and efficient range queries (favored by key-range partitioning). Cassandra's compound primary key approach is an elegant solution that hashes the partition key for distribution but sorts the clustering columns for range scan efficiency within a partition. Secondary indexes are inherently challenging in a partitioned system: local indexes are fast to write but expensive to read; global indexes are fast to read but expensive to write.

---

## Chapter 7 — Transactions
**Pages: 221–265**

### TL;DR
Transactions group multiple operations into an atomic unit that either fully commits or fully aborts, protecting against partial failures and concurrency anomalies. The weakest isolation levels are cheap and widely used but leave applications vulnerable to subtle bugs; only serializable isolation eliminates all concurrency anomalies.

### Key Concepts
- **ACID** (the properties transactions guarantee):
  - *Atomicity*: all operations in a transaction commit or none do (abortability is the key benefit)
  - *Consistency*: invariants defined by the application are preserved (this is really the application's job, not the database's)
  - *Isolation*: concurrently running transactions see each other as if they ran serially
  - *Durability*: committed data persists even after crashes (achieved via WAL and replication)
- **Isolation levels** (from weakest to strongest):
  - *Read Uncommitted*: can read uncommitted writes (dirty reads); almost never used
  - *Read Committed*: no dirty reads, no dirty writes; most common default (PostgreSQL, SQL Server, Oracle)
  - *Snapshot Isolation / Repeatable Read*: each transaction sees a consistent snapshot of the database from its start time; implemented via **MVCC** (Multi-Version Concurrency Control) — the database keeps multiple versions of each row, tagged with transaction IDs
  - *Serializable*: transactions appear to run one at a time in some serial order; prevents all anomalies
- **Race conditions** and their prevention:
  - *Dirty read/write*: reading/writing uncommitted data; prevented by read committed isolation
  - *Read skew*: transaction reads data that is modified mid-transaction; prevented by snapshot isolation
  - *Lost update*: two transactions read-modify-write the same value concurrently; prevented by atomic writes (`UPDATE ... SET counter = counter + 1`), explicit locking (`SELECT FOR UPDATE`), or automatic detection (PostgreSQL's repeatable read)
  - *Write skew*: two transactions each read the same data, make a decision based on it, and both write — but the writes don't conflict with each other yet violate an application-level invariant (classic example: two doctors both go off-call because each checks there's another doctor on call). Not prevented by snapshot isolation.
  - *Phantoms*: a write in one transaction changes the set of rows visible to a search query in another; can be prevented by materializing conflicts or predicate locking
- **Serializable implementations**:
  - *Actual Serial Execution* (single-threaded): execute transactions one at a time on a single thread; only possible if transactions are fast (stored procedures) and data fits in memory. Used by VoltDB/H-Store, Redis (for Lua scripts), Datomic.
  - *Two-Phase Locking (2PL)*: readers block writers and writers block readers (unlike MVCC where readers and writers don't block each other). Uses shared locks for reads and exclusive locks for writes. Performance penalty is high; vulnerable to deadlocks.
  - *Serializable Snapshot Isolation (SSI)*: optimistic approach based on snapshot isolation. Transactions proceed without blocking; at commit time, the database detects if any serialization conflict occurred (stale premise reads) and aborts the transaction if so. Best performance of the three in low-contention scenarios. Used in PostgreSQL (since 9.1) and FoundationDB.

### Notable Frameworks/Techniques Mentioned
- PostgreSQL, MySQL/InnoDB (MVCC and snapshot isolation)
- VoltDB/H-Store (actual serial execution)
- FoundationDB (SSI)
- Kyle Kingsbury's Jepsen project (testing database consistency claims)

### Key Takeaway
Weak isolation levels (read committed, snapshot isolation) prevent the most obvious concurrency bugs but leave applications vulnerable to write skew and phantoms. Only serializable isolation — whether via serial execution, 2PL, or SSI — eliminates all anomalies. SSI is the most promising approach: it achieves serializability with far less contention than 2PL, at the cost of transaction aborts when serialization conflicts are detected.

---

## Chapter 8 — The Trouble with Distributed Systems
**Pages: 273–321**

### TL;DR
Distributed systems face a harsh reality: networks drop packets, clocks drift, and processes can pause for unpredictable durations. Unlike single-machine systems where errors are mostly deterministic, distributed systems fail in partial and nondeterministic ways that are far harder to reason about.

### Key Concepts
- **Partial failures**: The defining characteristic of distributed systems. A single computer either works or doesn't; in a network of computers, some components fail while others continue. These failures are nondeterministic — the same operation may succeed some times and fail others, in ways that are hard to reproduce.
- **Cloud vs. HPC**: High-performance computing checkpoints periodically and stops the entire job on failure (treats partial failure as total failure). Cloud computing must tolerate partial failure because machines are commodity hardware; the software must handle individual node failures gracefully.
- **Unreliable Networks**: Asynchronous packet networks (the internet, most datacenters) have no guarantees:
  - Six failure scenarios for a request: request lost, request queued, remote node failed, remote node paused, response lost, response delayed
  - Timeouts are the only way to detect failures, but there is no "correct" timeout value — too short causes false positives; too long delays failure detection
  - Network partitions: a subset of nodes can no longer communicate with others
  - Real data: a medium-sized datacenter experiences ~12 network faults per month on average
- **Network congestion and queueing**: Packets can be delayed at multiple levels — network switch queues, OS receive queues, TCP flow control, VM scheduler pauses, garbage collector pauses. All contribute to variable latency.
- **Unreliable Clocks**:
  - *Time-of-day clocks* (wall clock): synchronized via NTP, but can jump backward if NTP adjusts the clock. Not monotonic. Use for reporting; do not use for measuring durations.
  - *Monotonic clocks* (`CLOCK_MONOTONIC`): always move forward; suitable for measuring elapsed time within a single process. Meaningless across machines.
  - Clock skew between nodes can be milliseconds to seconds even with NTP
  - Google's TrueTime API (used in Spanner) reports time as an interval [earliest, latest] acknowledging uncertainty; writes wait out the uncertainty to ensure linearizability
- **Process pauses**: A process can be paused for arbitrary durations by garbage collection, VM migration, OS preemption, or disk I/O. During a pause, the process has no idea time is passing; it may hold locks or leases that have expired.
- **The Truth Is Defined by the Majority**: In a distributed system, a node cannot trust its own judgment about its state — it may be "dead" from others' perspective due to a long GC pause. Quorums and fencing tokens prevent stale or "zombie" processes from corrupting state.
  - **Fencing tokens**: a monotonically increasing token issued with each lock/lease acquisition; storage systems reject writes with outdated tokens, preventing split-brain writes.
- **Byzantine faults**: Nodes that lie (send arbitrary or malicious data) are "Byzantine." This book assumes non-Byzantine faults throughout; Byzantine fault tolerance requires more expensive algorithms and is used mainly in aerospace and blockchain systems.

### Notable Frameworks/Techniques Mentioned
- TCP vs. UDP trade-offs
- NTP (Network Time Protocol) and clock synchronization
- Google Spanner's TrueTime API
- Phi Accrual Failure Detector (used in Akka and Cassandra)
- Fencing tokens for distributed locks (Martin Fowler)

### Key Takeaway
The core challenge of distributed systems is that you cannot distinguish between a slow response and no response — a crashed node, a partitioned network, and a heavily loaded node all look the same from outside. This uncertainty is fundamental, not accidental. Systems must be designed to tolerate this ambiguity through timeouts, retries, idempotency, quorums, and fencing tokens — and engineers must resist the temptation to assume things work better than they do.

---

## Chapter 9 — Consistency and Consensus
**Pages: 321–388**

### TL;DR
Strong consistency (linearizability) makes a distributed system appear as a single up-to-date copy of data, but it comes at a fundamental performance cost proportional to network latency. Consensus — getting nodes to agree on a single value — is the underlying problem behind leader election, distributed transactions, and total order broadcast; proven algorithms (Raft, Zab) make it tractable in practice.

### Key Concepts
- **Linearizability** (atomic consistency / strong consistency / external consistency):
  - The system behaves as if there is a single copy of data, and all reads and writes happen atomically
  - *Recency guarantee*: once any client has read a new value, all subsequent reads by any client must also see that value or a newer one
  - Example: Alice checks the World Cup score and sees the result; Bob, who checked a moment before the final whistle, sees "ongoing." Alice telling Bob the result is non-linearizable because Bob's system hasn't caught up.
  - Not the same as serializability: serializability is an isolation property (multi-object transactions); linearizability is a recency property (single-object reads and writes). Together they are called *strict serializability*. Snapshot isolation (SSI) is NOT linearizable.
  - Uses: lock/leader election (ZooKeeper, etcd), uniqueness constraints, cross-channel timing dependencies
  - Implementing: Single-leader replication can be linearizable (if reading from the leader or synchronous followers); consensus algorithms (ZooKeeper, etcd) are linearizable; multi-leader and leaderless replication generally are not.
- **CAP Theorem**: Often misunderstood. Better stated as: when a network partition occurs, a system must choose between *Consistency* (linearizability) or *Availability* (continue serving requests). But CAP's definition of "available" is extreme; the real trade-off is between linearizability and network latency.
  - Even without partitions, linearizability is slow: the Attiya-Welch proof shows that any linearizable register requires round-trip time proportional to worst-case network delay. Even multi-core CPUs violate linearizability for performance reasons.
- **Ordering and Causality**:
  - Causality imposes a *partial order* on events (some events are causally related; others are concurrent)
  - Linearizability imposes a *total order* (no concurrent events)
  - *Causal consistency* is the strongest model that doesn't slow due to network delays
  - **Lamport timestamps**: (counter, nodeID) pairs. Each node tracks max counter seen; increment on every operation; break ties by node ID. Provides a total order consistent with causality. More compact than version vectors. But alone insufficient to determine if an operation is globally unique (e.g., enforcing uniqueness constraints requires knowing whether any *other* node has concurrently used the same value).
  - **Total Order Broadcast**: all nodes receive the same messages in the same order (reliable delivery + totally ordered delivery). Equivalent to consensus. Used for state machine replication. ZooKeeper (Zab protocol) and etcd (Raft) implement this.
- **Two-Phase Commit (2PC)**:
  - Coordinator sends "prepare" to all participants; participants vote yes or no; coordinator sends "commit" or "abort"
  - Once a participant votes yes, it is in doubt: it cannot commit or abort until it hears from the coordinator
  - The coordinator is a single point of failure: if it crashes after participants have voted yes but before sending the decision, participants are stuck in doubt indefinitely
  - Used in heterogeneous distributed transactions (XA transactions, Java Transaction API)
  - Limitation: "in doubt" transactions block other transactions from accessing locked rows
- **Better consensus algorithms**: Viewstamped Replication, Paxos, Raft, Zab. These elect a leader by consensus, use the leader for total order broadcast, and handle leader failure by electing a new leader (itself requiring consensus). ZooKeeper (Zab) and etcd (Raft) are the main open-source implementations. They are not designed for general application use but as infrastructure for distributed coordination.

### Notable Frameworks/Techniques Mentioned
- Apache ZooKeeper (Zab protocol), etcd (Raft protocol)
- Google Spanner (externally consistent distributed transactions)
- XA transactions (Java Transaction API, WS-AtomicTransaction)
- FLP impossibility result (Fischer, Lynch, Paterson 1985): no deterministic algorithm can always reach consensus if even one node may crash

### Key Takeaway
Linearizability is expensive because achieving it requires network round trips for every read and write. The practical lesson is to use it where truly necessary (leader election, uniqueness constraints, cross-service coordination) and accept weaker consistency models (causal consistency, eventual consistency) everywhere else. Total order broadcast is equivalent to consensus and is the primitive that enables both linearizable storage and serializable transactions in distributed systems.

---

## Chapter 10 — Batch Processing
**Pages: 389–438**

### TL;DR
Batch processing transforms bounded input datasets into derived output datasets (search indexes, ML models, analytics aggregates) using high-throughput pipelines that prioritize correctness and repeatability over latency. MapReduce established the programming model; newer dataflow engines (Spark, Flink, Tez) improve on it by avoiding unnecessary materialization of intermediate state.

### Key Concepts
- **Three system types** (by latency/throughput trade-off):
  - *Services (online systems)*: wait for requests, optimize for response time
  - *Batch processing (offline systems)*: process bounded input, optimize for throughput
  - *Stream processing (near-real-time)*: process unbounded input, between the two
- **Unix philosophy for batch processing**: each program does one thing well; programs communicate via files/stdin/stdout; separate logic from wiring; transparent and inspectable. Log analysis with `cat | grep | awk | sort | uniq -c | sort -rn | head` illustrates: sorting handles larger-than-memory data by spilling to disk, a key advantage of Unix tools.
- **MapReduce on HDFS**:
  - HDFS (Hadoop Distributed File System): open-source GFS reimplementation. Files stored as blocks distributed across DataNodes; NameNode tracks block locations. Reed-Solomon erasure coding for fault tolerance.
  - MapReduce job steps: (1) read records from HDFS, (2) mapper calls `map()` for each record to emit key-value pairs, (3) shuffle sorts all mapper output by key and copies partitions to reducers, (4) reducer calls `reduce()` for each key.
  - "Putting the computation near the data": mappers are scheduled on or near the nodes that hold the input data, reducing network I/O
  - MapReduce jobs chained via HDFS directories; schedulers: Oozie, Azkaban, Luigi, Airflow
  - Higher-level abstractions over raw MapReduce: Pig, Hive, Cascading, Crunch, FlumeJava
- **Joins in MapReduce**:
  - *Sort-merge join* (reduce-side): both datasets' mappers emit the join key; the shuffle brings all records with the same key to the same reducer; secondary sort ensures the "smaller" dataset (e.g., user profiles) arrives before the "larger" (e.g., activity events)
  - Skew handling: Pig's skewed join samples data to identify hot keys; Hive's map join broadcasts small tables
  - *Broadcast hash join* (map-side): small dataset loaded into every mapper's memory as a hash table; no reducer needed. Supported by Pig (replicated join), Hive (MapJoin), Cascading, Crunch, Impala.
  - *Partitioned hash join*: both datasets partitioned identically; each mapper loads one partition of the small dataset
  - *Map-side merge join*: both datasets partitioned and sorted on the same key; mapper merges without a hash table
- **Output of batch workflows**:
  - Building search indexes (Google's original MapReduce use case): mappers extract words, reducers build inverted index partitions
  - Building key-value stores: output written as immutable database files (Voldemort, ElephantDB, HBase bulk load); atomically switched over to new files on completion
  - Machine learning models, recommendation systems, analytics aggregates
- **Beyond MapReduce**:
  - MapReduce fully materializes intermediate state between jobs (writes to HDFS), which is expensive: forces synchronization at job boundaries, redundant mapper work, replication overhead for temp data
  - **Dataflow engines** (Spark, Flink, Tez): model the entire workflow as one job with multiple operators. Can pipeline operators without materializing intermediate state. Only sort/group-by operators must accumulate state.
  - Spark uses RDD (Resilient Distributed Dataset) lineage for fault tolerance; Flink checkpoints operator state
  - Intermediate state kept in memory or written to local disk — less I/O than HDFS replication
- **Graphs and iterative processing**:
  - Graph algorithms (PageRank) require iteration (repeat until convergence) — not expressible in a single MapReduce pass
  - **Pregel model** (Bulk Synchronous Parallel / BSP): each vertex sends messages along edges to its neighbors in each iteration; messages delivered at the start of the next iteration. Vertices maintain state across iterations.
  - Implemented by Apache Giraph, Spark GraphX API, Flink's Gelly API
  - Fault tolerance: checkpoint all vertex states at end of each iteration; restart from last checkpoint on failure

### Notable Frameworks/Techniques Mentioned
- Apache Hadoop (HDFS + MapReduce), Pig, Hive, Crunch, Cascading, FlumeJava
- Apache Spark (RDD lineage, SparkSQL), Apache Flink (streaming + batch), Apache Tez
- Oozie, Azkaban, Luigi, Airflow (workflow schedulers)
- Voldemort, Terrapin, ElephantDB, HBase (batch-built key-value stores)
- Apache Giraph, Spark GraphX, Flink Gelly (Pregel-model graph processing)

### Key Takeaway
MapReduce's core insight — treat the distributed filesystem as a universal "pipe" between processing stages — enabled reliable large-scale computation with simple fault tolerance (just rerun failed tasks from immutable input). Dataflow engines (Spark, Flink) preserve this correctness model while dramatically improving performance by keeping intermediate state in memory and pipelining operators. The output of batch jobs is always derived data: a representation optimized for reads (search index, key-value store) that is derived deterministically from immutable input.

---

## Chapter 11 — Stream Processing
**Pages: 439–488**

### TL;DR
Stream processing extends batch processing to unbounded, continuously arriving data: instead of running a job over a fixed input, stream processors run operators continuously over an ongoing event stream. Kafka-style log-based message brokers combine the durability of databases with the low-latency notification of messaging, enabling powerful event-driven architectures including change data capture and event sourcing.

### Key Concepts
- **Event streams**: A stream is a sequence of events (records) produced incrementally over time. Events have timestamps and are grouped by topic or stream name.
- **Messaging system design trade-offs**:
  - What if producers outpace consumers? Drop messages, buffer in queue, or apply backpressure
  - What if consumers crash? Need acknowledgments and redelivery, which can reorder messages
  - Direct messaging (UDP multicast, ZeroMQ, HTTP webhooks): low latency but no buffering; consumers must be online
  - **Message brokers** (queue-based): centralized server; producers write, consumers read and acknowledge; broker deletes after acknowledgment. JMS standard; implemented by RabbitMQ, ActiveMQ, HornetQ. Messages are transient.
  - **Log-based message brokers** (Apache Kafka, Amazon Kinesis, Twitter's DistributedLog): append-only log partitioned across machines. Consumers track their own offsets (like a database replica tracking log sequence number). Consumer failure just means restarting from the last committed offset. Messages retained until disk is full (days or weeks typically); consumers can replay historical messages. This is the key innovation: combining the durability of storage with the push notification of messaging.
  - Multiple consumers: load balancing (one consumer per partition) vs. fan-out (all consumers get all messages). Kafka assigns entire partitions to consumer group members.
- **Databases and Streams**:
  - A database's replication log is itself a stream of write events
  - **Change Data Capture (CDC)**: observe all writes to a database and export them as a stream of change events that other consumers can apply. Solves the problem of keeping derived systems (search index, cache, data warehouse) in sync with the system of record.
  - CDC implementations: Bottled Water (PostgreSQL WAL parsing), Maxwell/Debezium (MySQL binlog), Mongoriver (MongoDB oplog), GoldenGate (Oracle). Kafka Connect coordinates CDC into Kafka.
  - Log compaction: the broker periodically scans for records with the same key and keeps only the most recent; ensures the log contains the full current state of the database. Enables new consumers to bootstrap from the log without a separate snapshot.
  - **Event Sourcing** (DDD community): store all application state changes as immutable events at the application level (not the database level). Unlike CDC, events express user intent ("student cancelled enrollment"), not low-level state changes. Applications must replay events to reconstruct current state. Log compaction must be done differently — events typically can't be collapsed to just the latest state.
- **Stream Joins** (covered in "Processing Streams" section):
  - *Stream-stream join* (window join): correlate events from two streams within a time window
  - *Stream-table join* (stream enrichment): augment stream events with data from a database (which may itself be kept up to date via CDC)
  - *Table-table join* (materialized view maintenance): maintain a derived table as the join of two input tables changing over time
  - All joins are time-dependent; replaying a stream later may produce different results if the table side has changed
- **Fault Tolerance in stream processing**:
  - Exactly-once semantics: despite retries, the output should be the same as if each message was processed once
  - Approaches: idempotent writes (making operations safe to retry), micro-batching (Spark Streaming processes batches of a few seconds), checkpointing operator state (Flink), distributed snapshots (Chandy-Lamport algorithm)

### Notable Frameworks/Techniques Mentioned
- Apache Kafka (log-based message broker, Kafka Connect for CDC, Kafka Streams)
- Amazon Kinesis Streams, Twitter's DistributedLog, Google Cloud Pub/Sub
- RabbitMQ, ActiveMQ (queue-based brokers)
- Apache Flink, Apache Storm, Apache Spark Streaming (stream processors)
- LinkedIn's Databus, Facebook's Wormhole, Yahoo's Sherpa (CDC systems)
- Event Store (event sourcing database), Debezium (open-source CDC)

### Key Takeaway
The key innovation of log-based message brokers (Kafka) is treating the message log as a durable, replayable record rather than a transient queue. This allows consumers to process messages at their own pace, replay history for debugging or recovery, and bootstrap new derived systems from the same log. Combined with change data capture, this pattern enables "derived data systems" — search indexes, caches, data warehouses — to be kept in sync with the system of record without the fragility of dual writes or the expense of distributed transactions.

---

## Chapter 12 — The Future of Data Systems
**Pages: 489–543**

### TL;DR
The future of data systems lies in composing specialized storage and processing tools via event logs rather than trying to force everything into a single monolithic database. This "unbundled database" approach achieves correctness through derived data and idempotent event processing rather than distributed transactions — and requires engineers to grapple with the ethical implications of the data systems they build.

### Key Concepts
- **Data Integration**: Most real applications need multiple storage and processing technologies. The challenge is keeping all copies of data in sync.
  - *Dual writes* (writing to two systems in application code): fragile; concurrent clients cause permanent inconsistency; partial failures cause divergence
  - Better approach: designate one system as the *system of record* and derive all other representations from it via CDC or event sourcing. Total ordering of writes is the key primitive.
  - Limits of total ordering: a single leader determines order; doesn't scale across multiple datacenters, microservices, or client-side state. Causal dependency tracking is an open research problem.
- **Unbundling Databases**:
  - Traditional databases bundle secondary indexes, full-text search, materialized views, replication, and query processing into a single product.
  - The emerging alternative: compose specialized tools (Kafka for ordered logs, Elasticsearch for search, Redis for caching, Flink for stream processing) via event logs. This is "unbundling the database" — applying the Unix philosophy to data systems.
  - Two integration approaches: *federated databases* (unify reads across diverse storage via a query interface, e.g., PostgreSQL foreign data wrappers) vs. *unbundled databases* (unify writes via event logs and derived data)
  - Log-based integration provides *loose coupling*: a consumer failure doesn't affect producers or other consumers; the event log buffers the difference in speed.
  - The "meta-database of everything": all data transformations across an organization form a single giant derived-data pipeline; every batch/stream/ETL process is like a trigger maintaining a materialized view.
  - What's missing: a "Unix shell for data" — a high-level declarative language for composing storage and processing systems (the `mysql | elasticsearch` dream)
- **Designing Applications Around Dataflow**:
  - The write path (eager evaluation): when data is written, propagate it through all derived datasets immediately
  - The read path (lazy evaluation): compute results when queried
  - The derived dataset (index, cache, materialized view) sits at the boundary, shifting work between write-time and read-time
  - Offline-capable clients: on-device state as a cache of server state; server pushes state changes via WebSockets/server-sent events
  - "Reads are events too": recording read events enables tracking causal dependencies across systems
- **Aiming for Correctness**:
  - Traditional ACID transactions are a strong but expensive abstraction; serializable isolation in distributed settings restricts scalability
  - *End-to-end argument*: low-level reliability mechanisms (TCP duplicate suppression, database transactions) cannot by themselves provide end-to-end correctness; application-level idempotency is also needed (e.g., unique request IDs passed through every hop)
  - *Exactly-once* means making the operation *idempotent*: using fencing tokens, operation IDs, and deterministic derivation functions to ensure duplicate processing produces the same result
  - *Timeliness vs. Integrity*: timeliness (seeing up-to-date state) is about eventual consistency; integrity (no corruption, no data loss) is permanent. Violations of timeliness are "eventual inconsistency"; violations of integrity are "perpetual inconsistency." Integrity is far more important.
  - *Coordination-avoiding data systems*: dataflow systems can maintain integrity guarantees (via deterministic derivation and idempotent operations) without distributed transactions. Many applications need loose uniqueness constraints (check after the fact, apologize if violated) rather than strict synchronous enforcement.
  - *Trust, but verify*: hardware and software bugs corrupt data despite all precautions. Systems should continually audit themselves (HDFS, S3 read-back-and-compare) rather than assuming correctness.
- **Doing the Right Thing** (ethics):
  - Data systems built today affect millions of people; engineers bear responsibility for their systems' effects
  - Predictive analytics: systems can discriminate by proxy (protected attributes correlate with non-protected ones); feedback loops amplify biases; people are categorized and judged without their knowledge or consent
  - Privacy: surveillance vs. service improvement is often a matter of who controls the data and for what purpose; data collected "to improve service" can be repurposed for harm
  - The author's call: treat data about people with respect; consider the impact of system design on the people whose data is being processed; advocate for ethical standards in the field

### Notable Frameworks/Techniques Mentioned
- Apache Beam (unified batch and stream processing API, runnable on Flink or Google Cloud Dataflow)
- Lambda architecture (parallel batch + stream processing, critiqued as operationally complex)
- Google Cloud Dataflow, Google Spanner (externally consistent transactions)
- GDPR-style arguments for data minimization and purpose limitation

### Key Takeaway
The most promising architecture for large-scale data systems is the "unbundled database": route all writes through an ordered, durable event log; derive all other representations (search indexes, caches, analytics tables, ML models) from that log using deterministic, idempotent derivation functions. This provides correctness (integrity through idempotence and end-to-end request IDs) with better performance and fault tolerance than distributed transactions — at the cost of accepting weaker timeliness guarantees and considerable operational complexity. The harder problem may be the ethical one: data systems built at scale inevitably shape the lives of the people whose data they process.

---

## Overall Book Summary

Designing Data-Intensive Applications is organized around a single central tension: **the trade-off between correctness and performance in distributed systems**. Each chapter adds another layer of complexity:

- Chapters 1–4 establish the building blocks: what properties we want (Chapter 1), how to model data (Chapter 2), how to store and retrieve it (Chapter 3), and how to encode it for transmission and evolution (Chapter 4).

- Chapters 5–9 tackle the distributed case: adding more nodes for replication (Chapter 5) and partitioning (Chapter 6) improves availability and throughput but creates correctness challenges. Transactions (Chapter 7) restore correctness within a node or a tightly coupled cluster. Chapters 8 and 9 confront the fundamental limits: networks and clocks are unreliable (Chapter 8); achieving strong consistency and consensus is expensive and subject to proven impossibility results (Chapter 9).

- Chapters 10–12 offer a way forward: batch processing (Chapter 10) and stream processing (Chapter 11) produce derived data from immutable inputs, sidestepping many distributed transaction problems by making operations idempotent and deterministic. Chapter 12 synthesizes everything into a vision of "unbundled databases" integrated via event logs — and closes with a call for ethical responsibility in data engineering.

The recurring theme is that **immutability plus determinism plus idempotency is a powerful substitute for distributed transactions**: if you can represent all writes as append-only events, derive all state from those events with deterministic functions, and make all operations idempotent with end-to-end request IDs, you can build correct, fault-tolerant distributed systems without the expense and brittleness of 2PC or the strict serializable isolation.
