import { Link, useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { Camera, CheckCircle2, ImagePlus, Lightbulb, Loader2, LocateFixed, LogOut, MapPin, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/store';
import { useService } from '@/features/service/store';
import { PANNE_TYPES, formatDate } from '@/features/service/data';
import { StatusBadge } from '@/features/service/reports';

function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(1, 800 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s; c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.7)); };
    img.onerror = reject; img.src = url;
  });
}

export function CitizenReportPage() {
  const { session, logout } = useAuth();
  const { reports, addReport } = useService();
  const navigate = useNavigate();
  const [type, setType] = useState(''); const [location, setLocation] = useState(''); const [description, setDescription] = useState('');
  const [geo, setGeo] = useState<{ lat: number; lng: number; accuracy: number }>(); const [locating, setLocating] = useState(false); const [geoError, setGeoError] = useState('');
  function locate() {
    if (!('geolocation' in navigator)) { setGeoError('La géolocalisation n’est pas disponible sur cet appareil.'); return; }
    setLocating(true); setGeoError('');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const g = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) }; setGeo(g);
      try { const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${g.lat}&lon=${g.lng}&zoom=18&accept-language=fr`); const d = await res.json(); const a = d.address ?? {}; const label = [a.road, a.suburb ?? a.neighbourhood ?? a.quarter, a.city ?? a.town ?? 'Douala'].filter(Boolean).join(', '); setLocation(label || `${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}`); }
      catch { setLocation(`${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}`); }
      setLocating(false);
    }, (e) => { setLocating(false); setGeoError(e.code === 1 ? 'Autorisez l’accès à votre position dans votre navigateur, puis réessayez.' : 'Position introuvable. Réessayez ou saisissez l’adresse.'); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
  const [photo, setPhoto] = useState<string>(); const [errors, setErrors] = useState<Partial<Record<'type'|'location'|'description'|'photo', string>>>({});
  const [sending, setSending] = useState(false); const [sent, setSent] = useState<string>();
  const cam = useRef<HTMLInputElement>(null); const gal = useRef<HTMLInputElement>(null);

  if (!session || session.kind !== 'citoyen') return (
    <main className="auth-main citizen-gate"><div className="auth-card"><h1>Espace citoyen</h1><p className="auth-sub">Connectez-vous avec votre compte citoyen pour signaler un problème d’éclairage.</p>
      <Button asChild><Link to="/connexion">Se connecter</Link></Button><Button variant="outline" asChild><Link to="/inscription">Créer un compte citoyen</Link></Button></div></main>);

  const mine = reports.filter((r) => r.citizen === session.name);
  async function onFile(f?: File) { if (!f) return; if (!f.type.startsWith('image/')) { setErrors((e) => ({ ...e, photo: 'Choisissez une image.' })); return; } setPhoto(await resize(f)); setErrors(({ photo: _p, ...e }) => e); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Partial<Record<'type'|'location'|'description'|'photo', string>> = {};
    if (!type) err.type = 'Sélectionnez le type de panne.';
    if (location.trim().length < 3) err.location = 'Indiquez la localisation du lampadaire.';
    if (description.trim().length < 10) err.description = 'Décrivez le problème (10 caractères minimum).';
    setErrors(err); if (Object.keys(err).length) return;
    setSending(true); await new Promise((r) => setTimeout(r, 700));
    if (!session || session.kind !== 'citoyen') return;
    const r = addReport({ citizen: session.name, type, location, description, photo, lat: geo?.lat, lng: geo?.lng, accuracy: geo?.accuracy });
    setSending(false); setSent(r.id); setType(''); setLocation(''); setDescription(''); setPhoto(undefined);
  }

  return (
    <div className="citizen-page">
      <main className="citizen-main">
        <form className="auth-card citizen-form" onSubmit={submit} noValidate>
          <h1>Signaler un problème d’éclairage</h1>
          <p className="auth-sub">Décrivez le problème et ajoutez une photo du lampadaire concerné.</p>
          {sent && <div className="action-notice" role="status"><CheckCircle2 size={16} />Signalement {sent} envoyé. Il est en attente de validation par le Chef de Service.<Button type="button" variant="ghost" size="icon" aria-label="Fermer" onClick={() => setSent(undefined)}><X /></Button></div>}
          <div className="auth-field"><label htmlFor="type">Type de panne<span className="req"> *</span></label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)} className={errors.type ? 'has-error' : ''}><option value="">Sélectionner le type de panne</option>{PANNE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            {errors.type && <p className="field-error">{errors.type}</p>}</div>
          <div className="auth-field"><label htmlFor="loc">Localisation du lampadaire<span className="req"> *</span></label>
            <input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex. : Douala, Akwa, près du carrefour" className={errors.location ? 'has-error' : ''} />
            <Button type="button" variant="outline" className="geo-button" onClick={locate} disabled={locating}>{locating ? <Loader2 className="animate-spin" /> : <LocateFixed />}{locating ? 'Localisation en cours…' : geo ? 'Actualiser ma position' : 'Utiliser ma position actuelle'}</Button>
            {geo && <p className="geo-info"><MapPin size={13} />Position GPS : {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)} · précision ±{geo.accuracy} m</p>}
            {geoError && <p className="field-error">{geoError}</p>}
            {errors.location && <p className="field-error">{errors.location}</p>}</div>
          <div className="auth-field"><label htmlFor="desc">Description du problème<span className="req"> *</span></label>
            <textarea id="desc" rows={4} className={`form-field comment-field ${errors.description ? 'has-error' : ''}`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le problème constaté…" />
            {errors.description && <p className="field-error">{errors.description}</p>}</div>
          <div className="auth-field"><label>Photo du lampadaire défectueux</label>
            <div className="photo-drop">{photo ? <><img src={photo} alt="Aperçu du lampadaire" /><Button type="button" variant="outline" size="sm" onClick={() => setPhoto(undefined)}><X />Retirer la photo</Button></> : <>
              <Camera size={20} /><strong>Ajouter une photo du lampadaire</strong><span>Prenez une photo avec votre appareil ou sélectionnez une image existante.</span>
              <div className="photo-actions"><Button type="button" variant="outline" size="sm" onClick={() => cam.current?.click()}><Camera />Prendre une photo</Button><Button type="button" variant="outline" size="sm" onClick={() => gal.current?.click()}><ImagePlus />Choisir une image</Button></div></>}
              <input ref={cam} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} />
              <input ref={gal} hidden type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} /></div>
            {errors.photo && <p className="field-error">{errors.photo}</p>}</div>
          <div className="auth-field"><label htmlFor="date">Date du signalement</label><input id="date" disabled placeholder="Renseignée automatiquement" /></div>
          <div className="auth-field"><label>Priorité</label><p className="auth-sub" style={{ marginTop: 0 }}>Déterminée par le système selon le type de panne.</p></div>
          <Button type="submit" size="lg" disabled={sending}>{sending ? <Loader2 className="animate-spin" /> : <Send />}Envoyer le signalement</Button>
        </form>
        {mine.length > 0 && <section id="mes-signalements" className="auth-card citizen-form"><h2>Mes signalements</h2>{mine.map((r) => <div key={r.id} className="citizen-report-row"><div><strong>{r.type}</strong><small>{r.id} · {r.location} · {formatDate(r.date)}</small></div><StatusBadge status={r.status} /></div>)}</section>}
      </main>
    </div>
  );
}
