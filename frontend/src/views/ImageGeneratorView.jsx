import { useState } from 'react';
import { Image as ImageIcon, Download, Share2, AlertCircle } from 'lucide-react';
import { GeneratorLayout } from '../components/GeneratorLayout.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { clsx } from '../lib/utils.js';

const STYLES = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'anime', label: 'Anime' },
];

export const ImageGeneratorView = () => {
  const { refreshHistory } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');
    setImage(null);
    try {
      const { result } = await api.generateImage({ prompt, style });
      setImage(result);
      refreshHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (image && navigator.share) {
      navigator.share({ title: 'Generated Image', text: 'Check out this image I generated!', url: window.location.href }).catch(() => {});
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  return (
    <GeneratorLayout
      title="Image Generator"
      description="Create stunning visuals from text prompts."
      icon={ImageIcon}
      configPanel={
        <div className="space-y-5 h-full flex flex-col">
          <Select label="Style" options={STYLES} value={style} onChange={(e) => setStyle(e.target.value)} />

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder="A minimalist desk setup with a computer and a plant..."
              className={clsx(
                'w-full flex-1 min-h-[120px] resize-none rounded-lg border bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
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

          <Button onClick={handleGenerate} isLoading={isGenerating} icon={ImageIcon} className="w-full mt-auto">
            Generate Image
          </Button>
        </div>
      }
      resultPanel={
        <div className="h-full bg-gray-50 p-6 flex flex-col items-center justify-center overflow-y-auto">
          {isGenerating ? (
            <div className="w-full max-w-lg aspect-square bg-gray-200 rounded-xl animate-pulse"></div>
          ) : image ? (
            <div className="flex flex-col items-center w-full max-w-lg">
              <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
                <img src={image} alt="Generated content" className="w-full h-full object-cover" />
              </div>
              <div className="w-full mt-6 flex items-center justify-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <a href={image} download="generated-image.png" className="flex-1">
                  <Button className="w-full" variant="secondary" icon={Download}>
                    Download
                  </Button>
                </a>
                <Button className="flex-1" variant="secondary" icon={Share2} onClick={handleShare}>
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>Your visuals will appear here.</p>
            </div>
          )}
        </div>
      }
    />
  );
};
