'use client';

import { ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ScrollComet() {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <a
      className="scroll-comet"
      href="#today-mission"
      aria-label="Scroll to today's plan"
      title="Explore today's plan"
      style={{ marginBottom: isSmallScreen ? '1rem' : '-2rem' }}
    >
      <span className="scroll-comet__orbit" aria-hidden="true">
        <span className="scroll-comet__ring scroll-comet__ring--outer" />
        <span className="scroll-comet__ring scroll-comet__ring--inner" />
        <span className="scroll-comet__tail" />
        <span className="scroll-comet__core">
          <ArrowDown size={18} strokeWidth={2.5} />
        </span>
      </span>
      <span className="scroll-comet__caption">Explore the next step</span>
    </a>
  );
}
