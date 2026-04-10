import { useChargen, useChargenDispatch } from '../../context/ChargenContext';
import templates from '../../data/claudemd-templates.json';

export function ClaudeMdEditor() {
  const { claudeMdSections, claudeMdMode, build } = useChargen();
  const dispatch = useChargenDispatch();

  const presets = templates.presets;

  function applyPreset(presetId: string) {
    const preset = presets.find((p) => p.id === presetId);
    if (preset) {
      dispatch({ type: 'APPLY_TEMPLATE', templateId: presetId, values: preset.values });
    }
  }

  // Generate preview markdown
  const preview = claudeMdSections
    .filter((s) => s.value.trim())
    .map((s) => `## ${s.label}\n\n${s.value}`)
    .join('\n\n');

  return (
    <div className="flex h-full">
      {/* Editor */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-gray-100 mb-4">CLAUDE.md Editor</h2>

          {/* Template selector */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-400">Template:</label>
            <select
              onChange={(e) => applyPreset(e.target.value)}
              className="bg-void-700 border border-void-600 rounded px-3 py-1.5 text-sm text-gray-100"
              defaultValue=""
            >
              <option value="" disabled>Choose a preset...</option>
              {presets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Merge/Replace toggle */}
          {build?.existingScan.hasCLAUDEmd && (
            <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-void-800 border border-void-600">
              <span className="text-sm text-gray-400">Existing CLAUDE.md detected:</span>
              <div className="flex rounded overflow-hidden border border-void-600">
                <button
                  onClick={() => dispatch({ type: 'SET_CLAUDEMD_MODE', mode: 'merge' })}
                  className={`px-3 py-1 text-xs ${claudeMdMode === 'merge' ? 'bg-arcane-600 text-white' : 'bg-void-700 text-gray-400'}`}
                >
                  Merge
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_CLAUDEMD_MODE', mode: 'replace' })}
                  className={`px-3 py-1 text-xs ${claudeMdMode === 'replace' ? 'bg-danger-500 text-white' : 'bg-void-700 text-gray-400'}`}
                >
                  Replace
                </button>
              </div>
            </div>
          )}

          {/* Section editors */}
          <div className="space-y-4">
            {claudeMdSections.map((section) => (
              <div key={section.id}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {section.label}
                  <span className="text-xs text-gray-500 font-normal ml-2">{section.description}</span>
                </label>
                <textarea
                  value={section.value}
                  onChange={(e) => dispatch({ type: 'SET_SECTION', sectionId: section.id, value: e.target.value })}
                  placeholder={section.placeholder}
                  className="w-full bg-void-700 border border-void-600 rounded-lg px-3 py-2 text-sm text-gray-100
                    placeholder-gray-600 focus:border-arcane-500 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="w-80 border-l border-void-600 p-4 overflow-auto bg-void-800/50">
        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Preview</h3>
        <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
          {preview || <span className="text-gray-600 italic">Fill in sections to see preview...</span>}
        </div>
      </div>
    </div>
  );
}
