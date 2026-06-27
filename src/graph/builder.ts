import { resolve } from 'path';
import { writeText, writeJson, writeYaml, ensureDir, readText } from '../utils/files.js';
import { info, success, warn } from '../utils/logger.js';
import { mergeAllConcepts, type MergedConcept, type MergeResult } from './merge.js';

/**
 * Graph data structure for JSON export and D3.js visualization.
 */
interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphNode {
  id: string;
  name: string;
  definition: string;
  tags: string[];
  nodeType: 'concept' | 'paper';
  sourceCount: number;
  sources: Array<{ course: string; lecture: string }>;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  note?: string;
}

/**
 * Build the full knowledge graph:
 * 1. Merge all concepts.yaml files
 * 2. Generate Obsidian-compatible concept .md files
 * 3. Generate graph.json for D3.js visualization
 * 4. Generate interactive HTML visualization
 * 5. Rebuild concept-index.txt
 */
export function buildGraph(projectRoot: string): MergeResult {
  const graphDir = resolve(projectRoot, 'knowledge-graph');
  const conceptsDir = resolve(graphDir, 'concepts');
  ensureDir(conceptsDir);

  // Step 1: Merge all concepts
  const result = mergeAllConcepts(projectRoot);

  // Step 2: Generate Obsidian concept files
  for (const concept of result.concepts) {
    const slug = slugifyConcept(concept.name);
    const filePath = resolve(conceptsDir, `${slug}.md`);
    writeText(filePath, generateConceptMarkdown(concept));
  }
  success(`Generated ${result.concepts.length} concept files in knowledge-graph/concepts/`);

  // Step 3: Generate graph.json
  const graphData = buildGraphData(result.concepts);
  writeJson(resolve(graphDir, 'graph.json'), graphData);
  info(`Generated graph.json with ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);

  // Step 4: Generate HTML visualization
  const html = generateVisualizationHTML(graphData);
  writeText(resolve(graphDir, 'index.html'), html);
  success('Generated interactive visualization: knowledge-graph/index.html');

  // Step 5: Rebuild concept index
  const indexPath = resolve(graphDir, 'concept-index.txt');
  const indexContent = result.concepts.map(c => c.name).sort().join('\n') + '\n';
  writeText(indexPath, indexContent);

  // Step 6: Write merge log if there are ambiguities
  if (result.ambiguities.length > 0) {
    writeYaml(resolve(graphDir, 'merge-log.yaml'), { ambiguities: result.ambiguities });
    warn(`Wrote ${result.ambiguities.length} ambiguities to merge-log.yaml`);
  }

  return result;
}

/**
 * Generate Obsidian-compatible markdown for a concept.
 */
export function generateConceptMarkdown(concept: MergedConcept): string {
  const frontmatter = [
    '---',
    `aliases: [${concept.aliases.map(a => `"${a}"`).join(', ')}]`,
    `tags: [${concept.tags.join(', ')}]`,
    `type: ${concept.nodeType}`,
    `first_seen: ${concept.first_seen}`,
    'sources:',
    ...concept.sources.map(s =>
      `  - course: ${s.course}\n    lecture: "${s.lecture}"\n    timestamps: [${s.timestamps.map(t => `"${t}"`).join(', ')}]`
    ),
    '---',
  ].join('\n');

  const body = [
    '',
    `# ${concept.name}`,
    '',
    concept.definition,
    '',
  ];

  // Key points from sources
  if (concept.sources.length > 0) {
    body.push('## Key Points from Sources', '');
    for (const source of concept.sources) {
      body.push(`- **${source.course} Lecture ${source.lecture}**`);
    }
    body.push('');
  }

  // Related concepts with wiki-links
  if (concept.relations.length > 0) {
    body.push('## Related Concepts', '');
    for (const rel of concept.relations) {
      const relType = rel.type.replace(/_/g, ' ');
      const note = rel.note ? ` — ${rel.note}` : '';
      body.push(`- [[${rel.target}]] (${relType})${note}`);
    }
    body.push('');
  }

  return frontmatter + body.join('\n');
}

/**
 * Build the graph data structure for D3.js.
 */
export function buildGraphData(concepts: MergedConcept[]): GraphData {
  const conceptNames = new Set(concepts.map(c => c.name));

  const nodes: GraphNode[] = concepts.map(c => ({
    id: slugifyConcept(c.name),
    name: c.name,
    definition: c.definition,
    tags: c.tags,
    nodeType: c.nodeType,
    sourceCount: c.sources.length,
    sources: c.sources.map(s => ({ course: s.course, lecture: s.lecture })),
  }));

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (const concept of concepts) {
    for (const rel of concept.relations) {
      // Only add edges to concepts that exist in the graph
      if (!conceptNames.has(rel.target)) continue;

      const edgeKey = `${concept.name}|${rel.target}|${rel.type}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      edges.push({
        source: slugifyConcept(concept.name),
        target: slugifyConcept(rel.target),
        type: rel.type,
        note: rel.note,
      });
    }
  }

  return { nodes, edges };
}

/**
 * Generate a self-contained interactive HTML visualization using D3.js.
 */
function generateVisualizationHTML(graphData: GraphData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Knowledge Graph — Learning AI</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; overflow: hidden; }
    #app { display: flex; height: 100vh; }
    #graph { flex: 1; }
    #sidebar { width: 350px; background: #161b22; border-left: 1px solid #30363d; padding: 20px; overflow-y: auto; display: none; }
    #sidebar.visible { display: block; }
    #sidebar h2 { color: #f0f6fc; margin-bottom: 8px; font-size: 18px; }
    #sidebar p { color: #8b949e; margin-bottom: 12px; line-height: 1.5; }
    #sidebar .tag { display: inline-block; background: #21262d; border: 1px solid #30363d; border-radius: 12px; padding: 2px 10px; margin: 2px; font-size: 12px; color: #58a6ff; }
    #sidebar .source { padding: 6px 0; border-bottom: 1px solid #21262d; font-size: 13px; }
    #sidebar .relation { padding: 4px 0; font-size: 13px; }
    #sidebar .relation .type { color: #8b949e; }
    #controls { position: fixed; top: 16px; left: 16px; z-index: 10; }
    #controls input { background: #21262d; border: 1px solid #30363d; border-radius: 6px; padding: 8px 12px; color: #c9d1d9; width: 250px; font-size: 14px; }
    #controls input:focus { outline: none; border-color: #58a6ff; }
    .node circle { cursor: pointer; stroke-width: 2; }
    .node text { fill: #c9d1d9; font-size: 11px; pointer-events: none; }
    .link { stroke: #30363d; stroke-opacity: 0.6; }
    .node.highlighted circle { stroke: #f0f6fc !important; stroke-width: 3; }
    .node.dimmed { opacity: 0.15; }
    .link.dimmed { opacity: 0.05; }
    h3 { color: #c9d1d9; margin: 16px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    #close-btn { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #8b949e; cursor: pointer; font-size: 20px; }
  </style>
</head>
<body>
  <div id="app">
    <div id="graph">
      <div id="controls">
        <input type="text" id="search" placeholder="Search concepts..." autocomplete="off">
      </div>
    </div>
    <div id="sidebar">
      <button id="close-btn">&times;</button>
      <h2 id="concept-name"></h2>
      <p id="concept-def"></p>
      <div id="concept-tags"></div>
      <h3>Sources</h3>
      <div id="concept-sources"></div>
      <h3>Related Concepts</h3>
      <div id="concept-relations"></div>
    </div>
  </div>
  <script>
    const data = ${JSON.stringify(graphData).replace(/</g, '\\u003c')};

    const tagColors = {};
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    function getTagColor(tags) {
      const tag = tags[0] || 'other';
      if (!tagColors[tag]) tagColors[tag] = colorScale(Object.keys(tagColors).length);
      return tagColors[tag];
    }

    const width = document.getElementById('graph').clientWidth;
    const height = window.innerHeight;

    const svg = d3.select('#graph').append('svg')
      .attr('width', width).attr('height', height);

    const g = svg.append('g');

    // Zoom
    svg.call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', (e) => g.attr('transform', e.transform)));

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.sourceCount) * 8 + 20));

    const link = g.append('g').selectAll('line')
      .data(data.edges).enter().append('line')
      .attr('class', 'link').attr('stroke-width', 1);

    const node = g.append('g').selectAll('.node')
      .data(data.nodes).enter().append('g')
      .attr('class', 'node')
      .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended));

    // Concepts: circles; Papers: diamonds (rotated squares)
    node.each(function(d) {
      const el = d3.select(this);
      const size = Math.sqrt(d.sourceCount) * 5 + 6;
      const color = getTagColor(d.tags);
      if (d.nodeType === 'paper') {
        el.append('rect')
          .attr('width', size * 1.6).attr('height', size * 1.6)
          .attr('x', -size * 0.8).attr('y', -size * 0.8)
          .attr('rx', 3)
          .attr('transform', 'rotate(45)')
          .attr('fill', color)
          .attr('stroke', d3.color(color).darker(0.5))
          .attr('stroke-width', 2)
          .style('cursor', 'pointer');
      } else {
        el.append('circle')
          .attr('r', size)
          .attr('fill', color)
          .attr('stroke', d3.color(color).darker(0.5))
          .attr('stroke-width', 2)
          .style('cursor', 'pointer');
      }
    });

    node.append('text').text(d => d.name)
      .attr('dx', d => Math.sqrt(d.sourceCount) * 5 + 10).attr('dy', 4);

    node.on('click', (event, d) => showSidebar(d));

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });

    function dragstarted(e) { if (!e.active) simulation.alphaTarget(0.3).restart(); e.subject.fx = e.subject.x; e.subject.fy = e.subject.y; }
    function dragged(e) { e.subject.fx = e.x; e.subject.fy = e.y; }
    function dragended(e) { if (!e.active) simulation.alphaTarget(0); e.subject.fx = null; e.subject.fy = null; }

    function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    function showSidebar(d) {
      document.getElementById('sidebar').classList.add('visible');
      document.getElementById('concept-name').textContent = d.name;
      document.getElementById('concept-def').textContent = d.definition;
      document.getElementById('concept-tags').innerHTML = d.tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('');
      document.getElementById('concept-sources').innerHTML = d.sources.map(s => '<div class="source">' + esc(s.course) + ' / Lecture ' + esc(s.lecture) + '</div>').join('');

      const relEdges = data.edges.filter(e => (e.source.id || e.source) === d.id || (e.target.id || e.target) === d.id);
      document.getElementById('concept-relations').innerHTML = relEdges.map(e => {
        const other = (e.source.id || e.source) === d.id ? (e.target.name || e.target) : (e.source.name || e.source);
        return '<div class="relation">' + esc(other) + ' <span class="type">(' + esc(e.type.replace(/_/g, ' ')) + ')</span></div>';
      }).join('');

      // Highlight connected nodes
      const connected = new Set([d.id]);
      relEdges.forEach(e => { connected.add(e.source.id || e.source); connected.add(e.target.id || e.target); });
      node.classed('highlighted', n => n.id === d.id).classed('dimmed', n => !connected.has(n.id));
      link.classed('dimmed', l => !connected.has(l.source.id || l.source) || !connected.has(l.target.id || l.target));
    }

    document.getElementById('close-btn').onclick = () => {
      document.getElementById('sidebar').classList.remove('visible');
      node.classed('highlighted', false).classed('dimmed', false);
      link.classed('dimmed', false);
    };

    document.getElementById('search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      if (!q) { node.classed('dimmed', false); link.classed('dimmed', false); return; }
      const matching = new Set();
      data.nodes.forEach(n => { if (n.name.toLowerCase().includes(q) || n.tags.some(t => t.includes(q))) matching.add(n.id); });
      node.classed('dimmed', n => !matching.has(n.id));
      link.classed('dimmed', l => !matching.has(l.source.id || l.source) && !matching.has(l.target.id || l.target));
    });
  </script>
</body>
</html>`;
}

/**
 * Convert a concept name to a URL-safe slug for file names.
 */
export function slugifyConcept(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
