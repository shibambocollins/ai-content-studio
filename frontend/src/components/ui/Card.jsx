import { clsx } from '../../lib/utils.js';

export const Card = ({ children, className = '', noPadding = false }) => (
  <div
    className={clsx(
      'bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200',
      !noPadding && 'p-6',
      className
    )}
  >
    {children}
  </div>
);
