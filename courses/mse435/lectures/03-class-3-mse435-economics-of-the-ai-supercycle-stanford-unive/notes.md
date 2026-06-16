---
type: Lecture Notes
title: "Class 3: Data Center Economics — From Electrons to Tokens"
course: MSE435 Economics of the AI Supercycle
university: Stanford
lecture_id: "03"
video: https://youtube.com/watch?v=4zk-hJ50vmU
tags: [data-centers, crusoe, energy, infrastructure, capex, gpu-economics]
timestamp: 2026-06-15T00:00:00Z
---

# Class 3: Data Center Economics — From Electrons to Tokens

**Course:** Economics of the AI Supercycle
**Video:** [YouTube](https://youtube.com/watch?v=4zk-hJ50vmU)

## TL;DR
Chase Lochmiller (Crusoe founder/CEO) delivers a deeply detailed breakdown of AI data center economics. A gigawatt data center costs ~$60B total ($20M/MW for building + power plant, $40M/MW for IT/GPUs). Of GPU spend, ~75% goes to Nvidia. Crusoe takes an energy-first, vertically integrated approach, building in locations with abundant low-cost power (Abilene, TX; Claude, TX). The Abilene campus hosts Project Stargate for Oracle/OpenAI at 2.1 GW with 9,000 construction workers. Revenue per megawatt is ~$15M/year (bare compute) to ~$30M/year (managed services), implying 2-4 year payback. H100 spot prices have actually risen despite being 3 years old due to agent-driven demand. Labor is the biggest emerging bottleneck.

## Key Takeaways
- Hyperscaler AI CapEx is the second-largest investment in history, behind only the US defense budget — larger than the space program, highway system, or Manhattan Project
- A data center is fundamentally "a building with power and cooling where you plug in computers"
- Total cost per gigawatt: ~$60B ($20B building/power + $40B IT infrastructure)
- GPU allocation of $40M/MW IT spend: $30M GPUs, $4M networking, $3M CPUs/storage, $3M tenant fit-out
- Crusoe's Abilene, TX campus: 2.1 GW total, 8 buildings for Oracle/OpenAI (Project Stargate), expansion for Microsoft, 9,000 construction workers, 5,000-car parking lot
- Built own 350 MW natural gas power plant and 1 GW substation (largest privately owned in US)
- Each building has ~1M gallons of recirculating water for cooling; near-zero net water consumption
- Energy-first approach: locate where power is abundant and cheap (West Texas renewables with negative spot prices)
- Labor costs are $4.7M/MW and rising — electricians, plumbers, welders are the biggest bottleneck
- H100 spot pricing has increased above launch price due to agent demand; Blackwell pricing following same trend
- Revenue: ~$15M/MW/year for bare GPU rental, up to ~$30M/MW/year with managed inference services → 2-year payback possible
- Data center building depreciation is 6+ years; actual asset life may be longer than expected
- Crusoe Spark: modular self-contained AI data center units (500 kW air-cooled, 2 MW liquid-cooled) that reduce costs 30-50%
- Space data centers: interesting long-term (no foundations, permitting, or cabling needed) but thermal management and maintenance are unsolved; not material for 10+ years
- Chase is bearish on traditional electrical equipment companies (Eaton, Schneider) long-term due to lack of innovation; bullish on open-source models taking share from closed-source

## Detailed Notes

### [00:00-03:00] The Scale of AI CapEx
Hyperscaler CapEx spend on AI is going "up and to the right fast." Contextualizing: this is bigger than the space program, US highway system, and Manhattan Project — second only to the US defense budget. Chase Lochmiller introduced as Crusoe founder/CEO, avid mountaineer (5 of 7 summits including Everest), Stanford alum.

### [03:00-10:00] What Is a Data Center? The Equation of AI Production
AI = Data + Algorithms + Compute + Energy + Data Centers. A data center is fundamentally power + cooling + computers. At very large scale it becomes incredibly complex, drawing from chemical, mechanical, electrical, and computer engineering. Crusoe is vertically integrated across energy development, data center construction, GPU cluster deployment, and managed services. The core bottleneck today is "powered, energized data centers" — places where you can actually plug in and turn on chips.

### [10:00-18:00] Abilene Campus — Project Stargate
Crusoe's flagship: Abilene, TX — chosen because West Texas has abundant wind and solar with production tax credits that created negative power prices. No historical data center market → greenfield opportunity. The campus has 8 buildings for Oracle/OpenAI (Project Stargate), a 200 MW + 1 GW substation (largest privately-owned in US), a 350 MW natural gas plant, and expansion for Microsoft to total 2.1 GW. The entire campus operates as one coherent GPU cluster via high-performance backend networking. 9,000 workers on-site daily; 5,000-car parking lot. Population of Abilene: 120,000. Steady-state operations: ~2,000 permanent jobs.

### [18:00-28:00] Cost Breakdown: Building + Power Plant ($20M/MW)
Per-megawatt breakdown: labor ($4.7M — the biggest single line item and a rising bottleneck), soft costs (insurance, financing, commissioning), gas power plant ($2-3M, costs have tripled), tenant fit-out (remote power panels, hot aisle containment, fan walls, cooling distribution units), electrical equipment (transformers, switchgear), mechanical equipment (chillers, plumbing), materials (steel, concrete — Crusoe has on-site batch plant). Each building has ~1M gallons recirculating water; annual consumption equals a single-family home. Gas turbine manufacturers (GE Vernova, Siemens, MHI) have limited capacity expansion; prices went from $1M to $3M/MW. All costs trending up due to demand.

### [28:00-35:00] IT CapEx ($40M/MW) and GPU Economics
GPU spend dominates at $30M/MW out of $40M total IT CapEx. Networking: $4M/MW (InfiniBand/RoCE for inter-rack connectivity beyond NVLink domains). CPUs/storage: $3M/MW — experiencing surprise shortage due to agentic workloads. Bloomberg H100 spot pricing chart shows prices rising above original launch price due to agent demand. Blackwell pricing following same trajectory. Depreciation standard is ~6 years; actual useful life may be longer. Crusoe builds managed services that abstract away hardware generation differences.

### [35:00-42:00] Revenue, Payback, and Modular Data Centers
Total CapEx: ~$60M/MW. OpEx: ~$1-2M/MW/year (power, insurance, labor, repairs). Revenue from bare GPU rental: ~$15M/MW/year → 4-year payback. With managed inference services: up to ~$30M/MW/year → 2-year payback. Crusoe Spark: modular self-contained data centers manufactured centrally (500 kW air-cooled, 2 MW liquid-cooled), reducing costs 30-50% through standardization and centralized labor.

### [42:00-49:00] Long/Short, Space Data Centers, Student Advice
Chase is bearish long-term on electrical equipment companies (Eaton, Schneider) that haven't innovated in 100 years — solid-state transformers and power electronics will disrupt them, though they'll do well near-term. Bullish on open source taking share from closed-source models. On space data centers (Starcloud partnership): no foundations, permitting, or fiber cabling needed, but thermal management and operations are very challenging — "not material for 10 years" but potentially big long-term. For students: focus on "the how" rather than "the what" — the infinite growth loop of continuous self-improvement is the most valuable asset.

## Notable Quotes
- "A data center is a building that has power and cooling. And you can plug in computers. That's pretty much what it is."
- "A gigawatt is basically what powers the whole city of Denver. So it's basically a city of Denver size worth of power to power computers."
- "We have roughly 9,000 people on site every single day working to bring this campus to life."
- "That parking lot is a 5,000 car parking lot and you can see it's totally full."
- "We don't have enough electricians. We don't have enough welders. We don't have enough plumbers."

## Concepts Introduced
- [[Electrons to Tokens]] — The full value chain from power generation to serving AI inference
- [[Energy-First Data Center Strategy]] — Locating where power is abundant rather than where data centers traditionally exist
- [[Across-the-Meter Power]] — On-site generation (wind, solar, gas) that can sell surplus to grid and draw when needed
- [[Data Center Cost Stack]] — $20M/MW building + $40M/MW IT = $60M/MW total per gigawatt campus
- [[GPU Spot Price Dynamics]] — H100 prices rising above launch price due to agent-driven demand
- [[Modular Data Centers]] — Crusoe Spark: prefabricated units reducing cost 30-50%
- [[Labor as AI Bottleneck]] — Electricians, welders, plumbers becoming the critical constraint

## Connections to Other Lectures
- Lecture 01: The data center is the physical manifestation of the "bottom of the triangle" where most AI revenue currently sits
- Lecture 02: Brad/Sunny discussed the $50B per gigawatt "inference factory" concept — Chase details exactly what that looks like
- Lecture 05: Sachin Katti (OpenAI) discusses the demand side — Chase shows the supply side of getting compute online
- Lecture 04: Ali Ghodsi argues value accrues to apps; Chase shows the massive infrastructure bet required at the base

## Open Questions
- Will data center construction costs plateau or keep rising with demand?
- How does Crusoe's vertically integrated model compare to hyperscaler self-build?
- Can modular data centers (Crusoe Spark) meaningfully solve the labor bottleneck?
- When (if ever) will space-based data centers become economically viable?
- What happens to asset values if AI demand growth slows before depreciation payback?
