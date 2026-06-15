---
type: Lecture Notes
title: "The Discipline of Delivering Value per Gigawatt"
course: CS153 Frontier Systems
university: Stanford
lecture_id: "02"
video: https://youtube.com/watch?v=VeTqsCpcDgg
tags: [infrastructure, reliability, scaling, energy, ai-workloads]
timestamp: 2026-06-09T00:00:00Z
---

# Stanford CS153 Frontier Systems | The Discipline of Delivering Value per Gigawatt

**Course:** Frontier Systems
**Video:** [YouTube](https://youtube.com/watch?v=VeTqsCpcDgg)

## TL;DR
Amin Vahdat emphasizes that the true measure of infrastructure success isn't raw compute capacity (gigawatts) but the value delivered per dollar, which hinges on extreme reliability and system balance across all components (compute, memory, network, storage). He highlights how modern AI workloads have fundamentally changed reliability requirements, shifting focus from traditional five-nines uptime to maximizing throughput, even if it means accepting some downtime. The most significant long-term bottleneck for scaling AI is energy abundance and affordability.

## Key Takeaways
1.  **Value over Raw Capacity**: The critical metric is value delivered per dollar or daily active users per gigawatt, not merely the number of gigawatts deployed.
2.  **Extreme Reliability is Paramount**: Even for "less critical" AI training workloads, single-node failures can halt massive synchronous computations, making robust fault detection and recovery essential.
3.  **System Balance (Amdahl's Law at Scale)**: Over-fixation on flops without corresponding HBM, SRAM, or network bandwidth leads to wasted investment. Balancing all components across 10,000s of nodes is crucial and incredibly difficult.
4.  **Shifting Reliability Needs**: Modern AI training prioritizes raw capacity and throughput over traditional "five-nines" (99.999%) availability, accepting more downtime for increased compute access.
5.  **Energy is the Biggest Long-Term Bottleneck**: Procuring large-scale, affordable, and sustainable energy for data centers has lead times of years and presents complex challenges that require community-level solutions and innovative approaches.

## Detailed Notes

### The True Measure of Value [00:09-07:56]
*   **Scale of Google's Infrastructure**: Google is aiming for tens of gigawatts of compute capacity in the coming years, with 1 gigawatt costing approximately $40-50 billion in infrastructure.
*   **The "Goodput" Metric**: Amin Vahdat argues that measures like "money spent per gigawatt" are broken. The true measure is "value delivered per dollar" or "daily active users per gigawatt/compute capacity."
    *   If nodes aren't reliable (e.g., a single TPU failure stops a computation), the invested money is wasted due to low utilization and "goodput."
    *   The goal is to deliver twice the value from the same gigawatt, reducing the need for more physical gigawatts.
*   **Optimizing for Intelligence**: The ultimate goal is to measure "intelligence per dollar" or revenue/users per gigawatt. This goes beyond just flops, considering HBM bandwidth, interconnects (ICI, NVLink), and the overall orchestration of compute, storage, and networking.
*   **Business Outcomes as Evaluation**: While infrastructure aims for general primitives, business outcomes (e.g., Gemini DAUs, enterprise customers, developer productivity) serve as the practical "evals" that demonstrate value. Users vote with their feet.

### Reliability and Shifting Demands [07:56-14:06]
*   **Infrastructure Complexity**: The infrastructure layer has millions of potential failure points, each impacting value delivery.
*   **Reliability Levels**:
    *   99% availability means 3.65 days of downtime per year, which is often unacceptable for enterprise services.
    *   Five nines (99.999%) availability means ~30 seconds of downtime per year, requiring 2N (one-plus-one) redundant power feeds, meaning half of the power capacity is always idle.
*   **New Paradigm for Frontier Models**:
    *   Historically, customers demanded five-nines reliability.
    *   For frontier model training, customers are now willing to accept lower reliability (e.g., 99.9% or 0.365 days of downtime per year) in exchange for double the capacity.
    *   This is a recent phenomenon driven by the throughput-focused nature of large-scale model training.
*   **Synchronous Workloads and Single Points of Failure**:
    *   AI training (hundreds to tens of thousands of TPUs/GPUs) is often synchronous.
    *   If one node in a synchronous computation fails, the entire computation stops.
    *   This contrasts with traditional internet services (e.g., web search), which are designed for loose coupling and resilience to individual rack failures through data replication and fungible compute.
    *   The lessons of 20+ years of distributed systems (loose coupling, individual failure tolerance) are now being re-evaluated for AI workloads where every node is "special."

### System Balance and Amdahl's Law [14:06-20:59]
*   **System Balance Matters Most**: Instead of focusing on raw flops, the balance between flops, HBM bandwidth, SRAM, and network bandwidth is critical. Unbalanced systems lead to starved components and wasted money.
*   **Amdahl's Law in Modern Systems**: First proposed in 1967, Amdahl's Law stated a necessary ratio of IO (megabytes/sec) to compute (million instructions per second). This principle still holds.
    *   Today, for every certain number of flops, there must be corresponding HBM bandwidth and network bandwidth, especially with data often moving across a network.
    *   Low MFU (Model FLOPs Utilization) is partly due to hardware not being built at the right system balance point, particularly with the shift to mixture of experts and sparse computation requiring more memory bandwidth relative to compute.
*   **Cost of Imbalance**: Spending $40-50 billion on a gigawatt is inefficient if it's not balanced and reliable. Investing more (e.g., $55 billion) to ensure balance and reliability is worthwhile to extract maximum value.
*   **Holistic System Balance**: Balance extends beyond just accelerators (TPUs/GPUs) to include CPUs, storage (local or remote), and the broader data center network connecting everything.
*   **Procurement and Supply Chain Bottlenecks**:
    *   Procurement presents its own balancing act, with lead times of 2-3 years for a net new gigawatt of capacity.
    *   Predicting demand 2 years out is nearly impossible, leading to either under-provisioning (lost opportunity) or over-provisioning (wasted money).
    *   The entire process, from land acquisition, permitting, grading, to power utility contracts (e.g., 20-year commitment for a gigawatt), creates immense lead times.

### Energy and Grid Challenges [20:59-25:36]
*   **Utility Contracts**: Utilities now demand long-term (e.g., 20-year) commitments for gigawatt-scale power, as there is no longer slack capacity on the grid.
*   **Stranded Capacity**: Hyperscalers' demand for large, expandable sites (100+ megawatts) leaves smaller, grid-connected capacities "stranded."
    *   This will naturally shift as AI moves from training (large contiguous blocks) to serving (more fungible, smaller deployments).
*   **Concentrated Power**: The long-term challenge is how to get larger amounts of power concentrated and delivered to specific locations.

### Optical Circuit Switching for Reliability and Flexibility [31:32-37:07]
*   **Role of OCS**: Optical circuit switching (OCS) is used extensively but not exclusively in Google's networks; it augments electrical packet switches.
*   **OCS for TPU Clusters**: Within a rack, TPUs use direct copper connections for point-to-point networking. Between racks, OCS creates a programmable topology, typically a 3D torus.
*   **Programmable Topology for Reliability**:
    *   A single TPU failure can take down an entire synchronous lattice.
    *   OCS allows a faulty rack to be "virtually removed" and a spare rack (even one running smaller jobs) to be instantly plugged into the exact same position in the torus, maintaining topology and recovering from failures in seconds.
    *   This dramatically increases availability.
*   **OCS for Resource Allocation**:
    *   A higher-level OCS layer can connect clusters to distant storage or other compute resources.
    *   For long-running jobs (e.g., 5 hours) that need specific storage, OCS can create a direct, high-bandwidth connection by reconfiguring mirrors.
    *   This saves provisioning many layers of electrical packet switches and miles of fiber, effectively providing programmable, high-bandwidth connections for the duration of a job, rather than per-packet granularity.
*   **Torus Topology**: Originally chosen for ML training due to its efficiency for "all reduce" collective operations, which disseminate parameters with some computation. For "all to all" or arbitrary communication, standard Clos switch topologies are optimal, but model designers often work around these constraints.

### Hardware Depreciation and Planning [37:07-40:19]
*   **Hardware Lifespan**: Older generation chips (TPUs, GPUs like H100s) remain in high demand and heavy use. Google depreciates compute hardware over 6 years, which is standard in the industry, and typically sees longer use.
*   **Planning Under Uncertainty**: Planning for compute capacity is a massive, complex, and fast-changing effort.
    *   Lead times for chips are significant, requiring early orders.
    *   Data center space and power (watts) are more fungible across hardware generations.
    *   New use cases, product launches, or cloud customer demands require dynamic replanning, often daily, accounting for new information and constraints (e.g., specific GPU types, preferred geographical location).

### Robotics and AI Ecosystem [40:19-59:15]
*   **Robotics - Latency and Safety**: Robotics capabilities are exciting, with Waymo as an example of advanced scaling. However, latency and safety are paramount.
    *   Safety considerations will drive requirements for extreme reliability and locality, potentially limiting the scale of remote compute that can be reliably used (e.g., 20,000 TPUs 1000 miles away might not work).
    *   Variability (e.g., context switches) that affects real-time safety is unacceptable.
*   **AI Compute Demand Surge**: The unexpected explosion of coding agents 4-5 months prior to the lecture led to massive demand for inference compute, causing companies to seek available capacity anywhere, leading to partnerships like SpaceX and Anthropic.
*   **TPUs vs. GPUs - Expanding Market**: The market for AI accelerators is expanding so dramatically that "beating" or "competing" is less relevant than driving impact. GPUs are fantastic, and Google uses many of them.
*   **TPU Specialization**: Google's latest 8th generation TPUs (8i for inference, 8T for training) mark a specialization in the TPU line.
    *   Previously, one fungible chip served both.
    *   Now, diverging needs lead to significant uplift from specialization.
*   **The Future of Hardware Specialization**: As general-purpose CPU performance improvements slow, specialization for large, critical workloads (like inference and training) becomes essential.
    *   Specialization leads to significantly better (e.g., 100x more efficient) performance for specific workloads, though specialized chips cannot do everything like a CPU.
    *   Key observation: different applications require different system balance points (memory-to-compute-to-networking ratios).
*   **Supply Chain Engagement**: Google is deeply engaged across the supply chain (e.g., TSMC, Taiwan, South Korea, Thailand) to secure its "fair share" of supply.
    *   Vendors generally prefer diversity in customers to mitigate concentration risk, ensuring they are not beholden to one or two major buyers.
*   **"Bitter Lesson" and Compute Bottleneck**: Rich Sutton's "bitter lesson" states that 70 years of AI experience show that throwing more compute at problems yields better results. This trend is expected to continue for at least the next 5-10 years, even with algorithmic breakthroughs like transformers.

### Societal Responsibility and Misalignments [53:43-1:04:16]
*   **Societal Transformation**: AI is driving a profound societal transformation in how we work, live, and learn. Technologists have a responsibility to build guardrails and ensure this transition is positive.
*   **Blind Spots / Misalignments**:
    *   **"Zero-Sum Mindset"**: The notion of a "single winner" or "winners and losers" in the industry is a self-imposed constraint. The ecosystem lifts together, and many winners will emerge, many yet to be invented.
    *   **Focus on Individuals**: Fixation on individual rivalries (e.g., "Person X versus Person Y") adds little value.
*   **Biggest Innovation Bottleneck - Energy**: While bottlenecks shift daily, the most significant, long-term bottleneck with the least clear solution is energy abundance and affordability.
    *   Scaling energy globally to the required levels is complex and expensive.
    *   Under-explored solutions in the US include greater investment in wind, solar, and batteries, which are proven, affordable, and relatively fast to deploy.
    *   While futuristic solutions like data centers in space (5x more efficient, 24/7 solar) are promising, they are 5-10 years out and carry risk. A portfolio approach is needed.
*   **Environmental and Community Impact**: Google's goal is for data centers to be an uplift for local communities and the grid.
    *   **Water vs. Power Efficiency**: Google now prioritizes designs that use almost no water, even if they are 10% less power-efficient, unless a community has abundant water and prefers the more efficient design. This ensures a net positive impact locally.
    *   **Demand Response**: Google has developed technology for gigawatt-scale demand response, allowing them to power down data centers for a few critical days per year (e.g., peak weather) to give power back to the grid for homes. This makes data centers an asset, allowing utilities to provision less overall.
*   **Optimal Scaling**: Hyperscalers should think end-to-end: optimally scaling capacity, using it efficiently, delivering it effectively, and ensuring it is a welcomed asset to the community where it's deployed.

## Notable Quotes
> "The most important consideration isn't how many gigawatts do you have, it's how much capability and value you're delivering to your users." — Amin Vahdat [03:45]
> "Everything that we developed over the past 20, 25 years, that said, loose coupling, don't worry about individual failures, all that's gone out the window, too." — Amin Vahdat [14:00]
> "Scaling flops is easy. Building a coordinated supercomputer that scales out to 10,000, 100,000-ish TPUs that has the right balance point, super hard." — Amin Vahdat [14:40]
> "I would say the one that I have least understanding of the solution is energy." — Amin Vahdat [56:01]
> "There's no such thing as winners and losers in the real world. They're just people who get done and who don't. People who have impact and who don't." — Host [51:58]

## Concepts Introduced
- [[Value per Gigawatt]] — A metric proposed by Amin Vahdat to measure the actual capability and utility delivered to users relative to the energy consumed by infrastructure, rather than just raw compute capacity.
- [[Goodput]] — The amount of "useful" work or data transferred, contrasting with raw throughput or utilization that might include wasted cycles or retransmissions.
- [[MFU (Model FLOPs Utilization)]] — A specific measure of how efficiently the theoretical maximum floating-point operations of an AI accelerator are being utilized by a given model.
- [[System Balance]] — The principle that all components of a computing system (e.g., compute, memory bandwidth, network bandwidth, storage) must be provisioned in appropriate ratios to avoid bottlenecks and maximize overall efficiency, a modern application of Amdahl's Law.
- [[Amdahl's Law]] — A formula used to find the maximum expected improvement to an overall system when only part of the system is improved, extended here to include the necessary ratios of IO/memory/network to compute.
- [[Optical Circuit Switching (OCS)]] — A networking technology that uses optical mirrors to dynamically reconfigure physical fiber optic connections, creating programmable topologies, enabling fast recovery from failures and flexible, high-bandwidth connections between clusters.
- [[3D Torus Topology]] — A network topology often used for large-scale synchronous AI training clusters (like Google's TPUs) due to its efficiency for specific collective communication patterns like "all reduce."
- [[All Reduce]] — A collective communication operation in distributed computing where each process starts with a piece of data, and all processes combine their data into a single result, which is then distributed to all processes.
- [[Demand Response (Energy)]] — A program where utilities ask customers to reduce their energy consumption during peak demand periods, often in exchange for incentives. For data centers, this means temporarily powering down to free up grid capacity for communities.
- [[Power Usage Effectiveness (PUE)]] — A metric used to determine the energy efficiency of a data center, calculated by dividing the total power entering the data center by the power used to run the computer infrastructure.
- [[The Bitter Lesson]] — An essay by Rich Sutton arguing that the most effective way to achieve intelligence in AI has consistently been to scale computation and simple learning algorithms, rather than relying on human-designed features or knowledge.

## Connections to Other Lectures
*   **Jensen Huang's Lecture**: The host directly referenced Jensen Huang's lecture from the previous week, where a similar question about measuring intelligence per unit of input was discussed [05:22]. Amin Vahdat later praises Jensen Huang and NVIDIA products, acknowledging their impact [46:58].

## Open Questions
*   How can the lead time for procuring gigawatt-scale infrastructure (power, land, hardware) be technologically reduced from years to days or weeks? [21:35]
*   What technological solutions can help unstrand underutilized smaller (sub-100MW) grid-connected power capacity in America? [24:23]
*   What technical problem would a Stanford student obsess over today, given the multitude of bottlenecks across the AI stack? [25:41]
*   How will the reliability and safety considerations of robotics impact the viable scale and locality of supporting compute infrastructure? [40:59]
*   What are the next breakthroughs for TPUs (or other specialized accelerators) to further optimize for specific AI workloads beyond inference and training, given the lesson that specialization drives efficiency? [48:03]
*   What are the under-explored or systematically underinvested vectors in the energy space that could address the looming energy abundance bottleneck? [56:45]
*   How can technologists proactively build in guardrails and safety into AI deployments to help drive a positive societal transformation, especially in areas of misalignment across the ecosystem? [54:02]