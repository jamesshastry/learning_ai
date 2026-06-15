---
type: Lecture Notes
title: "Scott Nolan from General Matter on Energy Bottlenecks"
course: CS153 Frontier Systems
university: Stanford
lecture_id: "05"
video: https://youtube.com/watch?v=wisccQYTRQc
tags: [energy, nuclear, infrastructure, scaling, uranium-enrichment]
timestamp: 2026-06-09T00:00:00Z
---

# Stanford CS153 Frontier Systems | Scott Nolan from General Matter on Energy Bottlenecks

**Course:** Frontier Systems
**Video:** [YouTube](https://youtube.com/watch?v=wisccQYTRQc)

## TL;DR
The rapid scaling of AI capabilities is creating an unprecedented demand for energy, making it a critical bottleneck even upstream of compute. Scott Nolan from General Matter highlights that traditional and even initial "stranded energy" solutions are insufficient, necessitating massive net new power generation. Nuclear energy emerges as the long-term, scalable, clean, and safe solution, but its adoption is currently bottlenecked by the lack of domestic uranium enrichment capacity in the US, a problem General Matter is rapidly working to solve with significant government support.

## Key Takeaways
1.  **Energy is the Primary AI Bottleneck:** While compute is critical, the sheer demand for power to run AI data centers is becoming the most significant upstream bottleneck, as acknowledged by industry leaders like Sam Altman, Jensen Huang, and Elon Musk.
2.  **Shift from Stranded Energy to Net New Generation:** Initial AI infrastructure (like Bitcoin mining) leveraged "stranded energy" (e.g., remote hydro, flared natural gas). However, the scale of AI demand now requires massive net new, reliable power production.
3.  **Nuclear Energy as the Long-Term Solution:** Nuclear power is identified as the optimal long-term solution for AI's energy needs due to its base load capabilities (high uptime), lowest carbon emissions, and excellent safety record, despite historical public perception issues.
4.  **Uranium Enrichment is the Immediate Nuclear Bottleneck:** The US currently produces less than 0.1% of its own uranium enrichment, making it completely reliant on foreign sources (including Russia). This missing step prevents the country from scaling nuclear fuel production and, consequently, nuclear power for AI.
5.  **AI is a Catalyst for New Infrastructure and Jobs:** Companies like General Matter are leveraging a "primitive" approach (solving fundamental bottlenecks) to rapidly build critical infrastructure. This re-ignited demand from AI is creating thousands of new, high-value jobs across engineering, manufacturing, and construction, challenging narratives about AI's impact on employment.

## Detailed Notes

### Introduction: AI's Energy Bottleneck [00:08-07:34]
*   **Great Transition:** The course began discussing the transition from an old system stack to a new one, particularly focusing on the "AI factory" model (frontier pre-training, mid-training, post-training, deployment to agents).
*   **AI Lab Excitement vs. System Reality:** While AI labs are generating exciting new capabilities, delivering these to the world requires a complex ecosystem of systems.
*   **Compute as a Bottleneck:** Compute was previously highlighted as a critical bottleneck (e.g., chip tape-out times, data center stand-up).
*   **Energy: The Upstream Bottleneck:** The lecture emphasizes a macro-systems view, zooming out from AI labs to the broader infrastructure. Powering data centers requires **energy** and **electricity**, which is an even more fundamental bottleneck.
*   **Historical Context of AI Demand & Supply Chain:**
    *   **ChatGPT (late 2022):** Identified as the "consumer killer app" for language models, making AI legible to everyday people.
    *   **Compute Crunch (early 2023):** The supply chain (chips, data centers) was unprepared for the sudden demand surge, leading to a compute and short-term energy crunch.
    *   **Enterprise Killer App (Dec 2023 - Claude 4.6):** Similar to ChatGPT, enterprise-focused AI tools created another surge in demand, confirming the continuous and growing pressure on infrastructure.
*   **Urgency of Energy:** The instructor's diagram shows electricity as significantly larger than the data center, visually representing its urgency and criticality. Without power, data centers are useless.
*   **Ideal vs. Reality:** Ideally, modular data centers with modular reactors could be co-located. Currently, power generation and data centers are geographically separated, adding complexity.

### Scott Nolan's Background & The Energy Problem [07:34-13:12]
*   **Scott Nolan's Journey:**
    *   Mechanical/Aerospace engineer (Cornell), then business master's (Stanford).
    *   Early career at SpaceX.
    *   Over a decade at Founders Fund VC, focused on "hard tech" including energy.
    *   Became interested in nuclear energy, noting the reliance of new nuclear companies on Russian fuel by 2020.
    *   Dug into the problem in 2023, founding General Matter to address the missing uranium enrichment step.
*   **Industry Leaders on Energy as a Bottleneck:**
    *   **Sam Altman (OpenAI):** Testified to Senate that "everything is going to converge to the cost of energy to the cost of electricity." Chips and models get cheaper, but energy is fundamental.
    *   **Jensen Huang (Nvidia):** Even he, whose incentive is to highlight chips, admits on Joe Rogan's podcast that energy is the bottleneck.
    *   **Elon Musk (Tesla, SpaceX):** Also emphasizes energy as a key bottleneck, with SpaceX exploring in-orbit power production.
*   **Mainstream Acknowledgment:** The Financial Times also recognizes power as the upstream bottleneck to data centers and compute.
*   **Scale of the Problem:**
    *   Energy demand for AI is "super linear." Forecasts suggest reaching a terawatt in a decade.
    *   Historical US grid expansion has been stagnant for 50+ years (flat line on chart).
    *   The US needs to shift to a "China-like slope" (vertical growth) to meet demand, requiring fundamentally different activities.
    *   Conclusion: Electricity is "overwhelmingly obvious" as the bottleneck to AI.

### Solving the Energy Challenge: From Stranded Power to Nuclear [13:12-18:29]
*   **Early Solutions: Stranded Energy (5 years ago):**
    *   **Concept:** Utilizing existing energy sources that lack nearby demand (e.g., rural hydroelectric dams, isolated geothermal, West Texas wind, flared natural gas).
    *   **Early Adopters:** Bitcoin mining centers were the first to leverage stranded power due to lower connectivity requirements.
    *   **Example: Crusoe Energy:** Started by converting flared natural gas (a major source of emissions) into power for Bitcoin mining, effectively reducing emissions while creating value. They then expanded to AI infrastructure (Stargate project) with wind and natural gas.
    *   **Limitations:** Most easily accessible stranded resources have been claimed, and their capacity is insufficient for current AI demand.
*   **Shift to Net New Power Production:** The focus is now on creating massive, net new power.
*   **Diverse Approaches to New Power:**
    *   **Crusoe:** Building data centers linked to various power sources.
    *   **SpaceX:** Exploring in-orbit power production.
    *   **Panthalasa:** Distributed energy in the ocean.
    *   **Dominant Focus:** Land-based power production remains primary.
*   **Data Center Requirements for Power:**
    *   **Uptime (Extreme Reliability):** Critical for continuous AI operations. Solar/wind require extensive, costly battery storage for sufficient uptime, making them currently less viable alone.
    *   **Natural Gas Turbines:** Common recently, but lead times are now multiple years, and production isn't scaling fast enough.
    *   **Base Load:** Need constant, reliable power.
*   **Evaluating Power Sources (Beyond Natural Gas):**
    *   **Carbon Emissions:** Low carbon footprint desired.
    *   **Safety:** Prioritizing safety.
    *   **Nuclear's Advantages:**
        *   Lowest carbon emissions of all power sources.
        *   Safest (tied with wind) based on historical statistics (deaths per TWh).
        *   Provides base load power.
*   **Hyperscalers and Nuclear:** All major hyperscalers are looking towards nuclear as the long-term solution.
*   **Timeline for Nuclear:** Nuclear power ramping is expected in the next 5-10 years. The immediate future (next couple of years) will be challenging, relying on stranded power, available turbines, or cost-insensitive solar/battery solutions.
*   **Conclusion:** If electricity is the bottleneck to AI, and nuclear is the long-term scaling limiter for electricity, then "nuclear is actually the bottleneck to AI scaling" on land.

### The Nuclear Bottleneck: Uranium Enrichment [18:29-21:49]
*   **Nuclear Reactor Fuel Cycle:** Nuclear reactors require constant fuel. The fuel cycle involves five steps:
    1.  Mining (Uranium ore)
    2.  Conversion (U3O8 to UF6 gas)
    3.  **Enrichment (UF6 gas)** – The critical missing step in the US.
    4.  Deconversion (UF6 gas back to solid)
    5.  Fuel Fabrication (into pellets)
*   **US Enrichment Deficit:** The US has less than 0.1% market share in uranium enrichment. It cannot produce its own nuclear fuel at scale and relies on European firms and even Russia (despite sanctions).
*   **Impact of Enrichment Bottleneck:** Inability to scale enrichment means inability to scale nuclear power, which means inability to scale data centers and AI.
*   **Cost Implications:** Enrichment is a significant portion of advanced nuclear fuel costs, and cost will become increasingly important as the industry matures.
*   **General Matter's Mission:** To rapidly bring scalable, cost-effective uranium enrichment back online in the US.
*   **Government Support:**
    *   No Russian uranium ban or AI boom when General Matter started.
    *   Biden administration focused on advanced fuel and energy production.
    *   Cross-administration, bipartisan support for this initiative.
    *   August groundbreaking of General Matter's facility in Kentucky, with support from across the political spectrum.
*   **Broader Implications:** Energy is upstream of everything – AI, manufacturing, all industries. The US is currently unprepared to scale energy as needed.

### Bitcoin Mining as a Dress Rehearsal & The "Primitive" Approach [21:49-30:01]
*   **Decoupling Cultural Commentary from Fundamental Progress:** The instructor points out that negative cultural commentary around Bitcoin/crypto can obscure underlying, valuable infrastructural progress.
*   **Bitcoin Mining as a Dress Rehearsal for AI:** Bitcoin mining pioneered the utilization of stranded energy and modular data center deployments, providing valuable learnings for the AI era.
*   **Crusoe Example:** Crusoe, initially a Bitcoin mining company, innovated in leveraging stranded energy and reducing methane emissions, which directly translated to building AI infrastructure. This is an "update" or "pivot" but more fundamentally, it's about building a **primitive**.
*   **The "Primitive" Concept:**
    *   Focus on building fundamental, foundational building blocks (primitives) that can be leveraged for various applications.
    *   **SpaceX Example:** Reduced the cost of launch capacity ($/kilo to orbit), a primitive that enabled the commercial space economy.
    *   **General Matter Example:** Enrichment is a primitive – refining uranium based on isotope. Enabling enrichment allows for diverse fuel grades (5% fuel, HALEU) to supply both existing (20% of US grid) and advanced (SMRs) reactors.
*   **Navigating Public Perception (Nuclear):**
    *   Don't get caught up in surface-level narratives or political/social divisiveness.
    *   "Go a lot of clicks deeper" to understand the fundamentals: base load, cleanliness, scalability, safety.
    *   Empirical data shows nuclear has the lowest carbon emissions and is among the safest power sources, despite famous (but few) accidents (e.g., Three Mile Island, Fukushima).
    *   The US was meant to achieve abundant, clean, power-dense energy (like space exploration) but sidelined nuclear for 50 years.
    *   Industry, government, and public all share blame for the past stagnation, but it's time to act.
*   **Calibrating for Impact:** Focus on "the really important problem that's not getting solved by someone else that somehow your skill set lines you up to be really useful for."

### Accelerating Progress & Government Partnership [30:01-39:27]
*   **General Matter's Rapid Progress:**
    *   Scott Nolan, a first-time founder, started General Matter as a company in January 2024 (after a year of research/incubation).
    *   Within 24 months, General Matter was awarded a $900 million DOE contract for uranium enrichment. This demonstrates extraordinary progress and alignment.
*   **Behind the Scenes of the DOE Contract:**
    *   **Alignment:** General Matter identified a problem (enrichment deficit) that the DOE and Congress already recognized as critical and requiring urgent action. Programs were already in place.
    *   **Team Building:** Handpicked a team with diverse expertise: National Labs, nuclear energy companies, and people from Tesla/SpaceX (for their experience in breaking into capital-intensive, stagnant industries).
    *   **Intense Effort:** First few months involved 100-hour weeks to button up the plan.
    *   **Site Selection:** Crucial to find a supportive community and location. Chose Paducah, Kentucky (former DOE commercial enrichment site) for its history and a perfect undeveloped 100-acre site.
    *   **Partnership:** The DOE has been "extremely supportive" of new entrants solving this problem.
*   **Government Support for Science & Engineering:**
    *   Scott confirms the federal government is "definitely not asleep at the wheel."
    *   Bipartisan, cross-administration support for bringing back domestic enrichment (for both HALEU and LEU fuels).
    *   Career professionals within DOE's nuclear energy department are deeply committed to the field.
    *   Support is "very consistent" across the political spectrum, transcending day-to-day political "memes" and public opinion fluctuations.

### Job Creation & European Lessons [39:27-52:58]
*   **AI as a Job Creator:**
    *   General Matter expects to create hundreds (potentially thousands) of jobs over the next four years in both California (knowledge sector, engineering) and Kentucky (construction, manufacturing).
    *   Scott argues this is "living proof" that AI is creating entirely new jobs in the physical world to unblock its own bottlenecks.
    *   General Matter faces a "deficit" of skilled people, actively looking to hire across engineering, construction, finance, etc.
*   **Dealing with Public Perception (Nuclear) and Lessons from Europe:**
    *   **Germany's Tragic Example:** Germany shut down working nuclear plants with the intent to replace them with renewables. Empirically, they replaced nuclear with fossil fuels (coal, natural gas) for base load, leading to increased carbon emissions and worsened air quality. This serves as a "real life example of what not to do."
    *   **Cost of Building Nuclear:** Acknowledges the high upfront cost of building nuclear plants, which the industry is now working to solve (e.g., through SMRs built in factories, new nuclear development startups like The Nuclear Company, Elemental, Oppenheimer Energy).
    *   **Shifting Perception:** Public perception of nuclear is "getting much better" due to these examples and growing awareness of grid expansion needs and clean energy. Charts show a shift from mostly negative to positive in recent years.

### Uranium Supply Chain & Geopolitics [52:58-1:00:23]
*   **Global Uranium Mining:** Kazakhstan is a huge producer (40% worldwide), along with Canada and Australia, due to rich ore deposits.
*   **Ideal Supply Chain:** Ideally, the chemical processing steps (conversion, enrichment, deconversion) should be collocated for efficiency, unlike the scattered US historical setup.
*   **General Matter's Vision for Enrichment:**
    *   Bring enrichment technology back to the US at a much lower cost structure, leveraging modern progress.
    *   Supply allies with low-cost enrichment.
    *   **Non-Proliferation Benefits:** Making enrichment widely available and affordable from trusted sources reduces the incentive for other countries to develop their own enrichment capabilities, mitigating the risk of nuclear weapons proliferation. This is a significant geopolitical benefit.
*   **Detailed 5-Step Uranium Fuel Cycle:**
    1.  **Mining:** Extract uranium ore.
    2.  **Conversion:** Transform U3O8 (mined product) into UF6 gas (gaseous form suitable for enrichment).
    3.  **Enrichment:** Separate UF6 gas to increase the concentration of fissile U235 isotope (the material that undergoes chain reaction for heat). General Matter's process is separation, not a nuclear or chemical reaction; it avoids critical mass by spreading material.
    4.  **Deconversion:** Convert UF6 gas back into a solid.
    5.  **Fuel Fabrication:** Form the solid into desired fuel pellet shapes for reactors.
*   **Why US Enrichment Declined Historically:**
    *   **Peak in 1980s:** US had 86% worldwide enrichment capacity, running government-owned DOE sites (Manhattan Project/Cold War legacy).
    *   **Post-Cold War Shift:** Fall of Berlin Wall led to more free trade and the "Megatons to Megawatts" program, where disarmed Russian warheads were downblended for US reactors.
    *   **Economic Uncompetitiveness:** US enrichment technology was expensive compared to Russia/Europe. US plants were sunsetted, with the last closing in 2013.
    *   **Path Dependency:** A specific, uncompetitive technology + geopolitical shifts led to divestment. The need for domestic enrichment is returning "much more quickly than people would have expected."
*   **Back to the Future:** The current moment is a "re-enrichment" era, reignited by AI, akin to the re-ignition of the space industry. It's not just rebuilding old tech but starting clean-sheet, leveraging modern progress to address exciting engineering challenges.

## Notable Quotes
> "everything is going to converge to the cost of energy to the cost of electricity" — Sam Altman [09:37]
> "electricity is the bottleneck to AI...maybe Jensen and Sam and Elon are all on the same page because this is so overwhelmingly obvious that you have to solve this." — Scott Nolan [13:04]
> "nuclear is actually the bottleneck to AI scaling." — Scott Nolan [18:23]
> "I wouldn't worry so much about what the what the public narrative of it is or what very surface level treatment of it tells you. I would go a lot of clicks deeper...what are we actually solving for here?" — Scott Nolan [28:30]
> "AI is actually net new is igniting a renaissance in in physical in the physical world that that we will end up in a place where jobs that didn't exist before are going to be created." — Instructor [41:35]

## Concepts Introduced
- [[AI Factory]] — A mental model for how intelligence is manufactured, involving frontier pre-training, mid-training, post-training, and deployment to agents.
- [[Energy Bottleneck]] — The constraint on AI scaling and broader industrial progress due to insufficient or unreliable power supply.
- [[Stranded Energy]] — Energy generated in locations without sufficient local demand or transmission infrastructure, often wasted (e.g., flared gas, remote hydro).
- [[Net New Power Production]] — The creation of entirely new energy generation capacity, distinct from utilizing existing "stranded" resources.
- [[Uranium Enrichment]] — A key step in the nuclear fuel cycle where the concentration of fissile uranium-235 isotope is increased to make it suitable for nuclear reactors.
- [[UF6 Gas]] — Uranium hexafluoride, the gaseous form of uranium used in the enrichment process.
- [[U235]] — The fissile isotope of uranium, necessary for chain reactions in nuclear reactors.
- [[HALEU]] — High-Assay, Low-Enriched Uranium, a type of nuclear fuel with a higher concentration of U-235 (typically 5-20%) needed for advanced reactors.
- [[LEU]] — Low-Enriched Uranium, the standard nuclear fuel (typically less than 5% U-235) used in most existing commercial reactors.
- [[Megatons to Megawatts Program]] — A US-Russian program (also known as the HEU-LEU deal) where highly enriched uranium (HEU) from dismantled Russian nuclear warheads was downblended to low-enriched uranium (LEU) for use in US nuclear power plants.
- [[Primitive (Infrastructure)]] — A fundamental building block or capability in an industry (e.g., launch capacity in space, uranium enrichment in nuclear) that, once made cheaper and more abundant, can unlock massive downstream innovation and growth.

## Connections to Other Lectures
*   **AI Workload Reliability Shift:** The emphasis on "uptime" for data centers directly connects to the extreme reliability requirements for AI workloads discussed in other lectures.
*   **Amdahl's Law / System Balance:** The discussion of identifying the *true* bottleneck (energy upstream of compute) rather than just the immediate one, mirrors the systems thinking approach of Amdahl's Law and optimizing the overall system.
*   **The Bitter Lesson (AI Scaling):** The drive for massive power generation to support AI scaling aligns with the idea that scale is a primary driver of AI progress.
*   **AI-Native Company / 1000x Productivity for Founders:** General Matter's rapid progress and the large DOE contract in a short time frame could be seen as an example of the potential for accelerated impact when focusing on fundamental bottlenecks, especially in an era potentially influenced by AI-driven efficiency for founders.
*   **Government-Technology Interaction:** The successful partnership between General Matter and the DOE highlights effective government support for critical technology infrastructure, a recurring theme in frontier systems.

## Open Questions
*   What specific technologies or innovations is General Matter using to achieve a "highly scalable method" for enrichment that can "win on cost," given historical US uncompetitiveness?
*   How will the industry address the "hardest" next couple of years for energy supply before nuclear power can truly scale (5-10 year timeframe)? What temporary solutions will bridge this gap beyond stranded power and scarce turbines?
*   What are the specific technical challenges SpaceX faces with "in-orbit power production," and how might an "AI engineering agent" accelerate Blue Origin's progress to create a comparable space-based energy solution?
*   Beyond making nuclear power "much cheaper to build up front," what other regulatory, policy, or public engagement strategies are crucial for overcoming lingering historical "confusion, politics, [and] social divisiveness" surrounding nuclear energy in the US?