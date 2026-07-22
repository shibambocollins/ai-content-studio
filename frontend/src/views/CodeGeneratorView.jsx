import { useState } from 'react';
import { Code, Share2, Download, Copy, AlertCircle } from 'lucide-react';
import { GeneratorLayout } from '../components/GeneratorLayout.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';
import { SyntaxHighlightedCode } from '../components/SyntaxHighlightedCode.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { clsx } from '../lib/utils.js';

const ACTIONS = [
  { value: 'generate', label: 'Generate Code' },
  { value: 'explain', label: 'Explain Code' },
  { value: 'refactor', label: 'Refactor' },
  { value: 'debug', label: 'Debug' },
];
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript / React' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML/CSS' },
  { value: 'java', label: 'Java' },
];
const EXTENSIONS = { javascript: 'js', python: 'py', typescript: 'ts', html: 'html', java: 'java' };

export const CodeGeneratorView = () => {
  const { refreshHistory } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState('');
  const [provider, setProvider] = useState('');
  const [error, setError] = useState('');

  const [action, setAction] = useState('generate');
  const [language, setLanguage] = useState('javascript');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');
    try {
      const { result, provider: usedProvider } = await api.generateCode({ prompt, action, language });
      setCode(result);
      setProvider(usedProvider);
      refreshHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => code && navigator.clipboard.writeText(code);

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-code.${EXTENSIONS[language] || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <GeneratorLayout
      title="Code Generator"
      description="Generate, debug, and refactor robust code instantly."
      icon={Code}
      configPanel={
        <div className="space-y-5 h-full flex flex-col">
          <Select label="Action" options={ACTIONS} value={action} onChange={(e) => setAction(e.target.value)} />
          <Select label="Language" options={LANGUAGES} value={language} onChange={(e) => setLanguage(e.target.value)} />

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Describe what you need</label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder="e.g., A complete, robust React component for a data table..."
              className={clsx(
                'w-full flex-1 min-h-[150px] resize-none rounded-lg border bg-white p-4 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500',
                error ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 flex items-start gap-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <Button onClick={handleGenerate} isLoading={isGenerating} icon={Code} className="w-full mt-auto">
            Generate Code
          </Button>
        </div>
      }
      resultPanel={
        <div className="h-full flex flex-col bg-gray-50 text-gray-900 font-mono text-sm relative">
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
            <span className="text-xs text-gray-500 font-sans font-medium">
              Output Viewer {provider && <span className="text-gray-400">· via {provider}</span>}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" icon={Share2} className="text-gray-600 font-sans" onClick={handleCopy} disabled={!code}>
                Share
              </Button>
              <Button variant="ghost" size="sm" icon={Download} className="text-gray-600 font-sans" onClick={handleDownload} disabled={!code}>
                Download
              </Button>
              <Button variant="ghost" size="sm" icon={Copy} className="text-gray-600 font-sans" onClick={handleCopy} disabled={!code}>
                Copy
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6 bg-white">
            {isGenerating ? (
              <div className="space-y-3 animate-pulse opacity-60">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : code ? (
              <SyntaxHighlightedCode code={code} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 font-sans">
                <Code className="w-16 h-16 mb-4 opacity-20" />
                <p>Awaiting compilation...</p>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};
