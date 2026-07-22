import { Loader2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Layout } from './components/Layout.jsx';
import { AuthView } from './views/AuthView.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { TextGeneratorView } from './views/TextGeneratorView.jsx';
import { CodeGeneratorView } from './views/CodeGeneratorView.jsx';
import { ImageGeneratorView } from './views/ImageGeneratorView.jsx';
import { PromptEnhancerView } from './views/PromptEnhancerView.jsx';
import { PromptLibraryView } from './views/PromptLibraryView.jsx';
import { SettingsView } from './views/SettingsView.jsx';

const VIEWS = {
  dashboard: DashboardView,
  text: TextGeneratorView,
  code: CodeGeneratorView,
  image: ImageGeneratorView,
  enhancer: PromptEnhancerView,
  library: PromptLibraryView,
  settings: SettingsView,
};

const AppShell = () => {
  const { user, currentView, bootstrapping } = useApp();

  if (bootstrapping) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthView />;

  const View = VIEWS[currentView] || DashboardView;
  return (
    <Layout>
      <View />
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
