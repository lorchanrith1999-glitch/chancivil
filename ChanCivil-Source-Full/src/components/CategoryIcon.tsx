import {
  BookOpen,
  Box,
  Building2,
  Compass,
  Cuboid,
  Grid3x3,
  Hammer,
  HardHat,
  Layers,
  Network,
  Ruler,
  Sigma,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  building: Building2,
  layers: Layers,
  hardhat: HardHat,
  hammer: Hammer,
  sigma: Sigma,
  ruler: Ruler,
  cuboid: Cuboid,
  grid: Grid3x3,
  network: Network,
  box: Box,
  compass: Compass,
  book: BookOpen,
};

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}
