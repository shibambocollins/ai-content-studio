import { FileText, Image as ImageIcon, Wand2, Clock, Zap, Code, ChevronRight, Mail } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatNumber, formatTimeAgo } from '../lib/utils.js';

export const DashboardView = () => {
  const { setCurrentView, user, history } = useApp();

  const wordsGenerated = history.filter((h) => h.type === 'text').reduce((sum, h) => sum + (h.words || 0), 0);
  const imagesCreated = history.filter((h) => h.type === 'image').length;
  const promptsEnhanced = history.filter((h) => h.type === 'enhance').length;
  const codeGenerated = history.filter((h) => h.type === 'code').length;

  const timeSavedMins = (wordsGenerated / 500) * 10 + imagesCreated * 15 + promptsEnhanced * 5 + codeGenerated * 15;
  const timeSavedHrs = (timeSavedMins / 60).toFixed(1);

  const stats = [
    { label: 'Words Generated', value: formatNumber(wordsGenerated), trend: wordsGenerated > 0 ? '+Active' : '-', icon: FileText },
    { label: 'Images Created', value: formatNumber(imagesCreated), trend: imagesCreated > 0 ? '+Active' : '-', icon: ImageIcon },
    { label: 'Prompts Enhanced', value: formatNumber(promptsEnhanced), trend: promptsEnhanced > 0 ? '+Active' : '-', icon: Wand2 },
    { label: 'Time Saved (hrs)', value: timeSavedHrs, trend: timeSavedHrs > 0 ? '+Active' : '-', icon: Clock },
  ];

  const quickActions = [
    { title: 'Draft an Email', desc: 'Professional outreach', icon: Mail, view: 'text' },
    { title: 'Write a Blog Post', desc: 'SEO optimized articles', icon: FileText, view: 'text' },
    { title: 'Generate Code', desc: 'Functions and components', icon: Code, view: 'code' },
    { title: 'Create Image', desc: 'High-quality visuals', icon: ImageIcon, view: 'image' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back, {user.name.split(' ')[0]}. Here's your overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <span className="text-xs font-semibold text-green-600">{stat.trend}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Zap className="w-5 h-5 text-gray-400" /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setCurrentView(action.view)}
                className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all text-left group"
              >
                <div className="p-2.5 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
            </h3>
          </div>
          <Card className="p-0 border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {history.length > 0 ? (
                history.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-500 flex-shrink-0">
                        {item.type === 'text' && <FileText className="w-4 h-4" />}
                        {item.type === 'image' && <ImageIcon className="w-4 h-4" />}
                        {item.type === 'code' && <Code className="w-4 h-4" />}
                        {item.type === 'enhance' && <Wand2 className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(item.date)}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">No activity yet. Start generating!</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
