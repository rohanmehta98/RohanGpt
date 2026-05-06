# Graph Report - c:\Users\Win11\Desktop\RohanGpt  (2026-05-06)

## Corpus Check
- Corpus is ~3,849 words - fits in a single context window. You may not need a graph.

## Summary
- 20 nodes · 9 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 1,000 input · 500 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Mock Agent Logic|Mock Agent Logic]]
- [[_COMMUNITY_Semantic Chat Flow|Semantic Chat Flow]]
- [[_COMMUNITY_Agent Docs|Agent Docs]]

## God Nodes (most connected - your core abstractions)
1. `processQuery()` - 3 edges
2. `delay()` - 2 edges
3. `Chat API Route` - 2 edges
4. `ChatInterface Component` - 1 edges
5. `Portfolio Data` - 1 edges
6. `Next.js Agent Rules` - 0 edges

## Surprising Connections (you probably didn't know these)
- `ChatInterface Component` --calls--> `Chat API Route`  [EXTRACTED]
  src/components/ChatInterface.tsx → src/app/api/chat/route.ts
- `Chat API Route` --references--> `Portfolio Data`  [EXTRACTED]
  src/app/api/chat/route.ts → src/data/portfolioData.ts

## Communities (12 total, 2 thin omitted)

### Community 1 - "Semantic Chat Flow"
Cohesion: 0.67
Nodes (3): ChatInterface Component, Portfolio Data, Chat API Route

## Knowledge Gaps
- **3 isolated node(s):** `ChatInterface Component`, `Portfolio Data`, `Next.js Agent Rules`
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `ChatInterface Component`, `Portfolio Data`, `Next.js Agent Rules` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._