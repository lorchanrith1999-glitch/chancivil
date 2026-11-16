import { Link } from 'react-router-dom';

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="ChanCivil home">
      <img src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>
        Chan<span className="text-accent">Civil</span>
      </span>
    </Link>
  );
}
