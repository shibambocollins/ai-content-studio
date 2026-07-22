import { useState } from 'react';
import { Wand2, Sparkles, Copy, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';

export const PromptEnhancerView = () => {
  const { refreshHistory } = useApp();
  const [original, setOriginal] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');

  const handleEnhance = async () => {
    if (!original) return;
    setIsEnhancing(true);
    setError('');
    setEnhanced('');
    try {
      const { result } = await api.enhancePrompt(original);
      setEnhanced(result);
      refreshHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Prompt Enhancer</h2>
        <p className="text-gray-500 mt-2">Turn basic ideas into engineered prompts for maximum AI performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center">1</div>
            <h3 className="font-semibold text-gray-900">Original Prompt</h3>
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste your basic prompt here..."
            className="w-full flex-1 resize-none rounded-lg border border-gray-300 bg-white p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <Button onClick={handleEnhance} isLoading={isEnhancing} className="w-full mt-4" icon={Sparkles}>
            Enhance Prompt
          </Button>
        </Card>

        <Card className="flex flex-col h-[500px] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center">2</div>
              <h3 className="font-semibold text-gray-900">Engineered Result</h3>
            </div>
            {enhanced && (
              <Button variant="secondary" size="sm" icon={Copy} onClick={() => navigator.clipboard.writeText(enhanced)}>
                Copy
              </Button>
            )}
          </div>

          <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-4 overflow-y-auto relative z-10">
            {isEnhancing ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : enhanced ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">{enhanced}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <p>Your optimized prompt will appear here.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
