import json, glob
from pathlib import Path
from graphify.cache import save_semantic_cache

# Step B3: Merge Chunks
chunks = sorted(glob.glob('graphify-out/.graphify_chunk_*.json'))
all_nodes, all_edges, all_hyperedges = [], [], []
total_in, total_out = 0, 0
for c in chunks:
    d = json.loads(Path(c).read_text())
    all_nodes += d.get('nodes', [])
    all_edges += d.get('edges', [])
    all_hyperedges += d.get('hyperedges', [])
    total_in += d.get('input_tokens', 0)
    total_out += d.get('output_tokens', 0)
new_data = {
    'nodes': all_nodes, 'edges': all_edges, 'hyperedges': all_hyperedges,
    'input_tokens': total_in, 'output_tokens': total_out,
}
Path('graphify-out/.graphify_semantic_new.json').write_text(json.dumps(new_data, indent=2))

# Save cache
saved = save_semantic_cache(new_data.get('nodes', []), new_data.get('edges', []), new_data.get('hyperedges', []))

# Merge cached + new
cached_path = Path('graphify-out/.graphify_cached.json')
cached = json.loads(cached_path.read_text()) if cached_path.exists() else {'nodes':[],'edges':[],'hyperedges':[]}

all_nodes = cached['nodes'] + new_data.get('nodes', [])
all_edges = cached['edges'] + new_data.get('edges', [])
all_hyperedges = cached.get('hyperedges', []) + new_data.get('hyperedges', [])
seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

merged = {
    'nodes': deduped,
    'edges': all_edges,
    'hyperedges': all_hyperedges,
    'input_tokens': new_data.get('input_tokens', 0),
    'output_tokens': new_data.get('output_tokens', 0),
}
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(merged, indent=2))

# Part C: Merge AST + Semantic
ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text())
sem = json.loads(Path('graphify-out/.graphify_semantic.json').read_text())

seen = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in sem['nodes']:
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast['edges'] + sem['edges']
merged_hyperedges = sem.get('hyperedges', [])
final_merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': sem.get('input_tokens', 0),
    'output_tokens': sem.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(final_merged, indent=2))
