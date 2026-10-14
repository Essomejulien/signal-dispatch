import { useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Layers, Lightbulb, MapPin, Radio, Search, TriangleAlert, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useService } from './store';
import { buildLamps, DOUALA_CENTER, type Lamp, type LampState } from './gis';
import { formatDate } from './data';

const LABEL: Record<LampState, string> = { fonctionnel: 'Fonctionnel', defectueux: 'Défectueux', intervention: 'En intervention' };
const TILES = {
  plan: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Imagerie © Esri' },
};
type Filter = 'tous' | LampState | 'signales';

export function GisMapPage() {
  const { reports } = useService();
  const lamps = useMemo(() => buildLamps(reports), [reports]);
  const [filter, setFilter] = useState<Filter>('tous');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Lamp | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [dark, setDark] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const visible = lamps.filter(l => (filter === 'tous' || (filter === 'signales' ? !!l.report : l.state === filter)) && `${l.id} ${l.street} ${l.zone} ${l.report?.id ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  const count = (s: LampState) => lamps.filter(l => l.state === s).length;
  const rate = Math.round((count('fonctionnel') / lamps.length) * 100);

  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    let cancelled = false;
    import('leaflet').then(mod => {
      const L = mod.default ?? mod;
      if (cancelled || !mapEl.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapEl.current, { zoomControl: false, attributionControl: true }).setView(DOUALA_CENTER, 13);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      tileRef.current = L.tileLayer(TILES.plan.url, { attribution: TILES.plan.attr, maxZoom: 19 }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);
      setSelected(s => s);
    });
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const L = LRef.current; if (!L || !tileRef.current) return;
    const t = dark ? TILES.satellite : TILES.plan; tileRef.current.setUrl(t.url); tileRef.current.options.attribution = t.attr;
  }, [dark]);

  useEffect(() => {
    const L = LRef.current, layer = layerRef.current; if (!L || !layer) return;
    layer.clearLayers();
    visible.forEach(l => {
      const icon = L.divIcon({ className: '', html: `<span class="gis-pin gis-${l.state}${l.report ? ' gis-reported' : ''}${l.report?.photo ? ' gis-hasphoto' : ''}${selected?.id === l.id ? ' gis-selected' : ''}"><i></i></span>`, iconSize: [22, 22], iconAnchor: [11, 11] });
      L.marker([l.lat, l.lng], { icon }).on('click', () => focus(l)).addTo(layer);
    });
  });

  function focus(l: Lamp) { setSelected(l); mapRef.current?.flyTo([l.lat, l.lng], 16, { duration: 0.8 }); }

  const filters: { k: Filter; label: string; n: number }[] = [
    { k: 'tous', label: 'Tous', n: lamps.length }, { k: 'defectueux', label: 'Défectueux', n: count('defectueux') },
    { k: 'intervention', label: 'Intervention', n: count('intervention') }, { k: 'fonctionnel', label: 'Fonctionnels', n: count('fonctionnel') },
    { k: 'signales', label: 'Signalés', n: lamps.filter(l => l.report).length },
  ];

  return <>
    <div className="page-heading"><div><p className="eyebrow">SYSTÈME D’INFORMATION GÉOGRAPHIQUE</p><h1>Carte SIG du réseau</h1><p>Localisez chaque lampadaire de Douala et les signalements citoyens en temps réel.</p></div>
      <div className="gis-live"><span className="gis-live-dot" />En direct<small>{now ? now.toLocaleTimeString('fr-FR') : '--:--:--'}</small></div></div>
    <div className="gis-kpis">
      <div className="gis-kpi"><Lightbulb size={18} /><div><strong>{lamps.length}</strong><small>Lampadaires suivis</small></div></div>
      <div className="gis-kpi gis-kpi-red"><TriangleAlert size={18} /><div><strong>{count('defectueux')}</strong><small>Défectueux</small></div></div>
      <div className="gis-kpi gis-kpi-amber"><Wrench size={18} /><div><strong>{count('intervention')}</strong><small>En intervention</small></div></div>
      <div className="gis-kpi gis-kpi-green"><Radio size={18} /><div><strong>{rate}%</strong><small>Disponibilité du réseau</small></div></div>
    </div>
    <div className="gis-layout">
      <aside className="gis-panel">
        <label className="search-field"><Search size={16} /><input placeholder="Lampadaire, rue, zone, signalement…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className="gis-filters">{filters.map(f => <button key={f.k} className={`gis-chip ${filter === f.k ? 'gis-chip-on' : ''}`} onClick={() => setFilter(f.k)}>{f.label}<span>{f.n}</span></button>)}</div>
        <div className="gis-list">{visible.slice().sort((a, b) => Number(!!b.report) - Number(!!a.report) || (a.state === 'fonctionnel' ? 1 : -1)).map(l =>
          <button key={l.id} className={`gis-item ${selected?.id === l.id ? 'gis-item-on' : ''}`} onClick={() => focus(l)}>
            <span className={`gis-dot gis-${l.state}`} /><span className="gis-item-main"><strong>{l.id}</strong><small>{l.street} · {l.zone}</small></span>
            {l.report?.photo && <img className="gis-thumb" src={l.report.photo} alt="" />}{l.report && <span className="gis-tag">{l.report.id.slice(-4)}</span>}
          </button>)}
          {visible.length === 0 && <p className="gis-empty">Aucun lampadaire ne correspond.</p>}
        </div>
      </aside>
      <div className="gis-map-wrap">
        <div ref={mapEl} className="gis-map" />
        <div className="gis-tools">
          <Button variant="outline" size="icon" aria-label="Recentrer sur Douala" onClick={() => mapRef.current?.flyTo(DOUALA_CENTER, 13)}><Crosshair /></Button>
          <Button variant="outline" size="icon" aria-label="Basculer plan / satellite" title={dark ? "Vue plan" : "Vue satellite"} onClick={() => setDark(d => !d)}><Layers /></Button>
        </div>
        <div className="gis-legend">{(['fonctionnel', 'defectueux', 'intervention'] as LampState[]).map(s => <span key={s}><i className={`gis-dot gis-${s}`} />{LABEL[s]}</span>)}<span><i className="gis-dot gis-ring" />Signalé par un citoyen</span></div>
        {selected && <div className="gis-card">
          <button className="gis-card-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button>
          <span className={`gis-badge gis-${selected.state}`}>{LABEL[selected.state]}</span>
          <h3>{selected.id}</h3>
          <p className="gis-card-loc"><MapPin size={14} />{selected.street}, {selected.zone}</p>
          <dl><div><dt>Puissance</dt><dd>{selected.power} W</dd></div><div><dt>Coordonnées</dt><dd>{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</dd></div></dl>
          {selected.report && <div className="gis-card-report"><small>SIGNALEMENT CITOYEN</small><strong>{selected.report.id} · {selected.report.type}</strong><p>{selected.report.citizen} · {formatDate(selected.report.date)}</p><p>Statut : {selected.report.status} · Priorité {selected.report.priority}</p>{selected.report.photo ? <button type="button" className="gis-photo" onClick={() => setZoom(selected.report!.photo!)} aria-label="Agrandir la photo"><img src={selected.report.photo} alt={`Photo du signalement ${selected.report.id}`} /><span>Agrandir</span></button> : <p className="gis-nophoto">Aucune photo jointe par le citoyen.</p>}</div>}
        </div>}
      </div>
    </div>
    {zoom && <div className="gis-lightbox" onClick={() => setZoom(null)} role="dialog" aria-label="Photo du signalement"><img src={zoom} alt="Photo du signalement" /><button type="button" aria-label="Fermer">×</button></div>}
  </>;
}
