import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text())
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text())
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text())

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

labels = {
    0: "Mock Agent Logic",
    1: "Semantic Chat Flow",
    2: "App Layout",
    3: "Home Page",
    4: "API Route",
    5: "ESLint",
    6: "Env Types",
    7: "Next Config",
    8: "PostCSS Config",
    9: "Portfolio Data",
    10: "Agent Types",
    11: "Agent Docs"
}

questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, 'c:\\Users\\Win11\\Desktop\\RohanGpt', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}))
print('Report updated with community labels')

from datetime import datetime, timezone
from graphify.detect import save_manifest

save_manifest(detection['files'])

cost_path = Path('graphify-out/cost.json')
if cost_path.exists():
    cost = json.loads(cost_path.read_text())
else:
    cost = {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}

cost['runs'].append({
    'date': datetime.now(timezone.utc).isoformat(),
    'input_tokens': tokens['input'],
    'output_tokens': tokens['output'],
    'files': detection.get('total_files', 0),
})
cost['total_input_tokens'] += tokens['input']
cost['total_output_tokens'] += tokens['output']
cost_path.write_text(json.dumps(cost, indent=2))

print(f"This run: {tokens['input']:,} input tokens, {tokens['output']:,} output tokens")
print(f"All time: {cost['total_input_tokens']:,} input, {cost['total_output_tokens']:,} output ({len(cost['runs'])} runs)")
