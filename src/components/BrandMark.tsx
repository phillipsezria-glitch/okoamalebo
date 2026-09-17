import { Leaf } from 'lucide-react';

interface BrandMarkProps {
  size?: 'sm' | 'lg';
}

export function BrandMark({ size = 'sm' }: BrandMarkProps) {
  const isLarge = size === 'lg';

  return (
    <div
      className={`brand-mark ${isLarge ? 'brand-mark--large' : ''}`}
      aria-hidden="true"
    >
      <Leaf className="brand-mark__leaf" size={isLarge ? 31 : 22} strokeWidth={2.3} />
    </div>
  );
}
