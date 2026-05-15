import { getInitials } from '../utils';

const COLORS = [
  'bg-rose-400', 'bg-orange-400', 'bg-amber-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-sky-400', 'bg-blue-400',
];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} ${colorForName(name)} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
