import { Link } from '@tanstack/react-router';
import cityLogoSrc from '@/assets/logo-douala-transparent.png';
import roadsLogoSrc from '@/assets/logo-2rc-transparent.png';

export function Brand({ sidebar = false }: { sidebar?: boolean }) {
  return <Link to="/" className={sidebar ? 'brand' : 'auth-brand'}><span className="brand-logo"><img src={roadsLogoSrc} alt="2RC — Régie des Routes et Constructions" /></span><span className="brand-name">Rakuev<span className="brand-dot">.</span><small>ÉCLAIRAGE PUBLIC · DOUALA</small></span></Link>;
}
export function PartnerLogos({ compact = false }: { compact?: boolean }) {
  return <div className={`partner-logos ${compact ? 'partner-compact' : ''}`} aria-label="Ville de Douala"><img src={cityLogoSrc} alt="Ville de Douala" /></div>;
}
