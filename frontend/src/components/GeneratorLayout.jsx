import { Card } from './ui/Card.jsx';

export const GeneratorLayout = ({ title, description, icon: Icon, configPanel, resultPanel, actionButtons }) => (
  <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">{actionButtons}</div>
    </div>

    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
      <Card className="w-full lg:w-80 flex-shrink-0 flex flex-col overflow-y-auto scrollbar-hide shadow-sm border-gray-200">
        {configPanel}
      </Card>
      <Card className="flex-1 flex flex-col overflow-hidden relative p-0 shadow-sm border-gray-200" noPadding>
        {resultPanel}
      </Card>
    </div>
  </div>
);
