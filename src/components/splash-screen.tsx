import { useEffect, useState } from 'react';
import roadsLogo from '@/assets/logo-2rc-transparent.png';
import cityLogo from '@/assets/logo-douala-transparent.png';

export function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'leave' | 'gone'>('show');
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('leave'), 2200);
    const t2 = setTimeout(() => setPhase('gone'), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === 'gone') return null;
  return (
    <div className={`splash ${phase === 'leave' ? 'splash-leave' : ''}`} role="status" aria-label="Chargement de Rakuev">
      <div className="splash-glow" />
      <div className="splash-logos">
        <img src={cityLogo} alt="Ville de Douala" className="splash-logo splash-logo-city" />
        <span className="splash-sep" />
        <img src={roadsLogo} alt="2RC — Régie des Routes et Constructions" className="splash-logo splash-logo-2rc" />
      </div>
      <h1 className="splash-name">Rakuev<span className="brand-dot">.</span></h1>
      <p className="splash-tag">ÉCLAIRAGE PUBLIC · DOUALA</p>
      <div className="splash-bar"><span /></div>
    </div>
  );
}
