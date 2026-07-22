import { useState } from 'react';
import { FileText, Wand2, RefreshCw, Maximize2, Copy, AlertCircle } from 'lucide-react';
import { GeneratorLayout } from '../components/GeneratorLayout.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { clsx } from '../lib/utils.js';

const TEXT_CATEGORIES = [
  { value: 'Blog posts', label: 'Blog posts' },
  { value: 'Email', label: 'Email' },
  { value: 'CV/Cover letters', label: 'CV/Cover letters' },
  { value: 'Tweets/X posts', label: 'Tweets/X posts' },
  { value: 'Social media captions', label: 'Social media captions' },
  { value: 'Essays', label: 'Essays' },
  { value: 'Stories/Poems/Lyrics/Scripts', label: 'Stories/Poems/Lyrics/Scripts' },
  { value: 'Study notes', label: 'Study notes' },
];
const TONES = ['Professional', 'Casual', 'Creative'].map((v) => ({ value: v, label: v }));
const LENGTHS = ['Short', 'Medium', 'Long'].map((v) => ({ value: v, label: v }));

export const TextGeneratorView = () => {
  const { refreshHistory } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [provider, setProvider] = useState('');
  const [error, setError] = useState('');

  const [category, setCategory] = useState('Blog posts');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');
    try {
      const { result: text, provider: usedProvider } = await api.generateText({ prompt, category, tone, length });
      setResult(text);
      setProvider(usedProvider);
      refreshHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExpand = async () => {
    if (!result) return;
    setIsGenerating(true);
    setError('');
    try {
      const { result: text, provider: usedProvider } = await api.generateText({
        prompt: `Please expand on the following text, adding more depth, details, and paragraphs while maintaining the original tone and context:\n\n${result}`,
        category,
        tone,
        length,
      });
      setResult(text);
      setProvider(usedProvider);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => result && navigator.clipboard.writeText(result);

  return (
    <GeneratorLayout
      title="Text Generator"
      description="Create blogs, emails, ads, and more."
      icon={FileText}
      configPanel={
        <div className="space-y-5 h-full flex flex-col">
          <Select label="Category" options={TEXT_CATEGORIES} value={category} onChange={(e) => setCategory(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tone" options={TONES} value={tone} onChange={(e) => setTone(e.target.value)} />
            <Select label="Length" options={LENGTHS} value={length} onChange={(e) => setLength(e.target.value)} />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What should we write about?</label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder="E.g., Write about the benefits of remote work..."
              className={clsx(
                'w-full flex-1 min-h-[150px] resize-none rounded-lg border bg-white p-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400',
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

          <Button onClick={handleGenerate} isLoading={isGenerating} icon={Wand2} className="w-full mt-auto">
            Generate Content
          </Button>
        </div>
      }
      resultPanel={
        <div className="h-full flex flex-col bg-white">
          <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleGenerate} disabled={!result || isGenerating}>
                Rewrite
              </Button>
              <Button variant="ghost" size="sm" icon={Maximize2} onClick={handleExpand} disabled={!result || isGenerating}>
                Expand
              </Button>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              {provider && <span className="text-xs text-gray-400">via {provider}</span>}
              <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopy} disabled={!result}>
                Copy
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {isGenerating ? (
              <div className="space-y-4 max-w-3xl mx-auto animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              </div>
            ) : result ? (
              <div className="max-w-3xl mx-auto text-gray-800 leading-relaxed whitespace-pre-wrap">{result}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p>Your generated content will appear here.</p>
              </div>
            )}
          </div>
        </div>
      }
    />
  );
};
