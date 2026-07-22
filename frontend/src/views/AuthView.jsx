import { useState } from 'react';
import { AlertCircle, Mail, Lock, User } from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useApp } from '../context/AppContext.jsx';

export const AuthView = () => {
  const { login, register, authError } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!isLogin && name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!emailRegex.test(email)) errors.email = 'Please enter a valid email address';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-gray-200">
        <div className="text-center mb-8 pt-4">
          <h1 className="font-extrabold text-3xl tracking-tighter text-gray-900 mb-2">AI Content Studio</h1>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 mt-4">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? 'Enter your details to access your workspace.' : 'Start creating amazing content.'}
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!isLogin && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Sterling"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
            />
          )}
          <Input
            label="Email address"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 pb-2">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFieldErrors({});
            }}
            className="font-medium text-blue-600 hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </Card>
    </div>
  );
};
