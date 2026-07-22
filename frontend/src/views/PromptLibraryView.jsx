import { useState } from 'react';
import { Search, Copy } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { clsx } from '../lib/utils.js';

const CATEGORIES = ['All', 'Writing', 'Marketing', 'Programming', 'Image Generation'];

const LIBRARY_DATA = [
  { id: 1, title: 'SEO Blog Post', category: 'Writing', desc: 'Create a fully optimized SEO blog post on a specific topic.', prompt: 'Act as an expert SEO copywriter. Write a comprehensive, 1000-word blog post about [TOPIC]. Include a catchy title, meta description, an introduction that hooks the reader, well-structured H2 and H3 headings, and a concluding call-to-action. Ensure keyword [KEYWORD] is naturally integrated.' },
  { id: 2, title: 'React Component Refactor', category: 'Programming', desc: 'Refactor messy code into clean, modern React hooks.', prompt: 'You are a Senior Frontend Engineer. Review the following React class component and refactor it into a modern functional component using React Hooks (useState, useEffect). Ensure performance optimizations and add PropTypes or TypeScript interfaces where applicable:\n\n[PASTE CODE]' },
  { id: 3, title: 'Cinematic Portrait', category: 'Image Generation', desc: 'Generate highly detailed, photorealistic portraits.', prompt: 'A cinematic, highly detailed close-up portrait of [SUBJECT] standing in a neon-lit cyberpunk street, moody volumetric lighting, shot on 35mm lens, f/1.8, realistic skin texture, 8k resolution, photorealistic.' },
  { id: 4, title: 'Cold Outreach Email', category: 'Marketing', desc: 'High-converting B2B sales outreach.', prompt: 'Write a persuasive B2B cold outreach email to a [JOB TITLE] at [COMPANY]. The goal is to get a 15-minute discovery call to discuss [YOUR PRODUCT]. Keep it under 150 words, tone should be professional yet conversational, and include a clear, low-friction Call to Action.' },
  { id: 5, title: 'API Documentation', category: 'Programming', desc: 'Generate standard REST API docs.', prompt: 'Create comprehensive API documentation for the following endpoint: [ENDPOINT URL]. Include the method, description, required headers, query parameters, request body structure, and examples of both success (200) and error (400, 500) JSON responses.' },
  { id: 6, title: 'Product Launch Tweet Thread', category: 'Marketing', desc: 'Viral Twitter thread structure for a launch.', prompt: 'Write a 5-part Twitter thread announcing the launch of [PRODUCT NAME], which helps [TARGET AUDIENCE] solve [SPECIFIC PROBLEM]. The first tweet should be a strong hook. The middle tweets should explain the features and benefits. The final tweet should link to the product and include a CTA.' },
];

export const PromptLibraryView = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = LIBRARY_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prompt Library</h2>
          <p className="text-gray-500 mt-1">Discover and use high-performing engineered prompts.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Card key={item.id} className="flex flex-col h-full hover:shadow-md transition-shadow group cursor-default">
              <div className="mb-2 flex items-start justify-between">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">{item.category}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">{item.desc}</p>

              <div className="relative p-3 bg-gray-50 rounded-lg border border-gray-100 group/code">
                <p className="text-xs font-mono text-gray-600 line-clamp-3">{item.prompt}</p>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent flex items-end justify-center p-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                  <Button size="sm" icon={Copy} onClick={() => navigator.clipboard.writeText(item.prompt)} className="shadow-md">
                    Copy Prompt
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <Search className="w-8 h-8 mx-auto text-gray-400 mb-3" />
            <p className="font-medium text-gray-900">No prompts found</p>
            <p className="text-sm">Try adjusting your search query or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
