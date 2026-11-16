import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Props {
  title: string;
  intro?: string;
  linkTo?: string;
  linkLabel?: string;
  action?: ReactNode;
}

export default function SectionHeading({ title, intro, linkTo, linkLabel }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {intro && <p className="mt-2 text-slate-600">{intro}</p>}
      </div>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-600">
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
