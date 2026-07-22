import { AlertCircle } from 'lucide-react';
import { clsx } from '../../lib/utils.js';

export const Input = ({ label, icon: Icon, error, className = '', ...props }) => (
  <div className={clsx('w-full', className)}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
      <input
        className={clsx(
          'w-full rounded-lg border bg-white px-4 py-2 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
          Icon ? 'pl-10' : '',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
          'placeholder:text-gray-400'
        )}
        {...props}
      />
    </div>
    {error && (
      <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" />
        {error}
      </p>
    )}
  </div>
);
