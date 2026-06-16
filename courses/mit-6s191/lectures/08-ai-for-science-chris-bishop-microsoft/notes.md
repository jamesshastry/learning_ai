---
type: Lecture Notes
title: "AI for Science"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "08"
video: https://youtube.com/watch?v=rZACoZD8AG8
tags: [ai-for-science, emulators, physics, dft, molecular-dynamics, weather-forecasting, drug-discovery]
timestamp: 2026-06-15T00:00:00Z
---

# AI for Science

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=rZACoZD8AG8)

## TL;DR
Chris Bishop (Microsoft Technical Fellow) presents how deep learning emulators can revolutionize scientific discovery by learning to approximate physics simulations at 1000x+ speedup. He covers the no-free-lunch theorem's implications for science (scarce data but rich inductive bias from known equations), weather forecasting emulators, density functional theory (DFT) for molecular simulation, the machine-learned exchange correlation functional "Scala," and extending from molecules to protein dynamics via hierarchical emulation.

## Key Takeaways
- Science has a unique advantage over typical ML: known equations provide extremely rich inductive bias, but data is scarce and expensive
- The "bitter lesson" (Rich Sutton, 2019) says more data always beats clever inductive bias -- but in science, we can generate unlimited synthetic training data from simulations
- Deep learning emulators train on synthetic data from physics simulators, then produce equivalent predictions 1000x+ faster
- Emulator benefits: unlimited perfectly-labeled data, no privacy concerns, amortized cost over millions of future uses
- Weather forecasting emulators produce UK 8-day forecasts in 1 minute on a single A100 GPU
- Density Functional Theory (DFT) reduces Schrodinger's equation from exponential to cubic cost via electron density -- Walter Kohn's Nobel Prize (1998)
- The exchange correlation functional is universal (one function for all of chemistry) but unknown analytically; "Scala" learns it via ML, achieving chemical accuracy
- Hierarchical emulation extends quantum calculations to protein dynamics (10,000+ atoms), combining DFT with coarse-grained molecular dynamics

## Detailed Notes

### The Power of Mathematical Physics [00:26-04:13]
The world is described by remarkably simple mathematics with extraordinary precision (electron magnetic moment agrees to 13 significant figures). Yet solving these equations for practical applications (drug design, materials) is computationally intractable. Dirac noted in 1929 that the equations are completely known but "too complicated to be soluble."

### No Free Lunch and Scientific Inductive Bias [07:54-11:10]
The no-free-lunch theorem: learning requires combining data with assumptions (inductive bias). LLMs use massive data with lightweight assumptions. Science inverts this: data is scarce and expensive, but inductive bias (equations, symmetries, conservation laws) is extraordinarily rich. The challenge: how to exploit equations (Schrodinger's), invariances (rotation), equivariances, and conservation laws effectively.

### The Bitter Lesson and Emulators [12:20-15:52]
Rich Sutton's bitter lesson: more data eventually beats clever priors. Reconciliation: use equations to generate unlimited synthetic training data, then train neural network emulators. The emulator replaces the expensive iterative simulator with a fast feed-forward network. Typically 1000x+ speedup. Cost is amortized: expensive data generation and training happen once; fast inference happens millions of times.

### Weather Forecasting Emulator [19:15-22:26]
Numerical weather prediction requires supercomputers solving PDEs with fine time steps on 3D grids, faster than real weather evolves. Foundation model approach: train on diverse data from many simulators at different scales. Fine-tuning for specific applications (e.g., nitrogen oxide pollution prediction) dramatically outperforms direct training on sparse pollution data alone. UK 8-day forecast in 1 minute on single A100.

### Density Functional Theory [29:01-35:12]
Schrodinger's equation: exponential cost in electron count (caffeine molecule with 100 electrons is already intractable). Walter Kohn's breakthrough (1965, Nobel 1998): replace wave function (high-dimensional) with electron density (3D only) -- exact transformation from exponential to cubic cost. Catch: the exchange correlation functional is universal but has no known analytical form. 60+ years of handcrafted approximations (~800 functionals), each domain-specific.

### Scala: Machine-Learned Exchange Correlation Functional [36:01-40:04]
Microsoft's AI for Science team spent 3+ years learning the exchange correlation functional using ML. Key innovations: message-passing architecture between electron density point cloud and atom centers for scalability, and 10x more training data than all previous public data combined. Scala achieves chemical accuracy (~1 kcal/mol) with cubic scaling for main-group molecular chemistry. Currently limited to molecules (not materials) and main-group elements.

### From Molecules to Protein Dynamics [40:14-45:42]
Molecular dynamics simulates atom movements via Newton's laws, but requires quantum force calculations at each step. Curse of sequentiality: femtosecond time steps needed for atomic vibrations, but interesting biology happens on millisecond scales (10^6-10^15 sequential steps). Hierarchical emulation: group atoms into chunks, compute inter-chunk forces via DFT, train emulator, run fast coarse-grained MD. Achieves molecular dynamics for proteins up to 10,000 atoms. Published in Science.

## Notable Quotes
- "The most extraordinary thing that science has ever uncovered is the fact that our world is described by mathematics." [01:34]
- "The difficulty is only that the exact application of these laws leads to equations much too complicated to be soluble." -- Paul Dirac, ~1929 [03:44]
- "Every single one of you by the end of today should take five minutes and go and read this blog [The Bitter Lesson]." [12:34]
- "This is an exact transformation of an exponential problem into a cubic problem. And that's so extraordinary that Walter Kohn was given the Nobel Prize." [31:53]
- "We're really hitting hard on a 50-year-old grand challenge at the heart of physics." [40:07]

## Concepts Introduced
- [[Deep Learning Emulator]] -- neural network trained on simulation data as fast proxy for physics solvers
- [[No Free Lunch Theorem]] -- learning requires combining data with assumptions
- [[Bitter Lesson]] -- more data eventually beats clever inductive bias
- [[Density Functional Theory]] -- exact reduction of quantum mechanics from exponential to cubic cost
- [[Exchange Correlation Functional]] -- universal unknown function at the heart of DFT
- [[Chemical Accuracy]] -- ~1 kcal/mol precision threshold for practical computational chemistry
- [[Molecular Dynamics]] -- simulating atom movements via Newton's laws with quantum forces
- [[Foundation Model for Science]] -- single model trained on diverse scientific data, fine-tuned for specific applications

## Connections to Other Lectures
- Emulator concept parallels model distillation discussed in Lecture 09
- Diffusion models from Lecture 06 appear in MataGen crystal generation
- No-free-lunch theorem connects to Lecture 01's overfitting and generalization
- The bitter lesson contextualizes why scaling (Lecture 09) consistently wins

## Open Questions
- Can Scala extend to transition metals and periodic systems (crystals)?
- How far can hierarchical emulation push -- can we simulate entire subcellular systems?
- Will foundation models for science follow the same emergent ability patterns as LLMs?
