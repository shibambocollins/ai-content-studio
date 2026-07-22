import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { clsx } from '../lib/utils.js';

const NAV_GROUPS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'text', label: 'Text' },
  { id: 'code', label: 'Code' },
  { id: 'image', label: 'Image' },
  { id: 'enhancer', label: 'Enhancer' },
  { id: 'library', label: 'Library' },
  { id: 'settings', label: 'Settings' },
];

export const Layout = ({ children }) => {
  const { currentView, setCurrentView, user, logout } = useApp();

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50 text-gray-900 font-sans transition-colors duration-300">
      <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
        <div className="flex items-center gap-8">
          <span
            className="font-extrabold text-2xl tracking-tighter text-gray-900 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            AI Content Studio
          </span>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_GROUPS.map((nav) => (
              <button
                key={nav.id}
                onClick={() => setCurrentView(nav.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  currentView === nav.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {nav.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
            <button onClick={logout} className="text-gray-400 hover:text-gray-700 p-1 ml-1" title="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex p-2 gap-1 w-max">
          {NAV_GROUPS.map((nav) => (
            <button
              key={nav.id}
              onClick={() => setCurrentView(nav.id)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                currentView === nav.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative bg-gray-50 scroll-smooth">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full h-full">{children}</div>
      </main>
    </div>
  );
};
