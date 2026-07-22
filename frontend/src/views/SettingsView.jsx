import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { useApp } from '../context/AppContext.jsx';

export const SettingsView = () => {
  const { user } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700">Profile</button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Public Profile</h3>
            <div className="flex items-center gap-6">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border border-gray-200 shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" defaultValue={user.name} disabled />
              <Input label="Email Address" defaultValue={user.email} disabled />
            </div>
            {/*
              Editing name/email/avatar requires a PATCH /api/auth/me endpoint
              on the backend, which isn't built yet — intentionally left as a
              read-only view rather than a button that pretends to save.
              Add that route + a form here when you're ready to wire it up.
            */}
            <p className="text-xs text-gray-400">Profile editing isn't wired up yet — these fields are read-only for now.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
