import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-500">{user.email}</span>
          <Avatar name={user.name} size="sm" />
        </div>
      )}
    </header>
  );
}
