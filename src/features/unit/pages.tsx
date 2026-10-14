import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Inbox, LoaderCircle, BadgeCheck, Wrench, MapPin, Clock3, ArrowRight, Check, UserRound, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useService } from '@/features/service/store';
import { useAuth } from '@/features/auth/store';
import { StatusBadge, PriorityBadge } from '@/features/service/reports';
import { formatDate, rankTechnicians, specialtyFor, isAvailable, activeLoad, TECHNICIANS, type Report, type Intervention } from '@/features/service/data';

function useActor() { const { session } = useAuth(); return `${session?.name ?? 'Chef d’unité'} · Chef d’unité`; }
function Heading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>;
}

export function UnitDashboard() {
  const { reports, interventions } = useService();
  const received = reports.filter(r => r.status === 'Transmis');
  const cards = [
    { label: 'Signalements reçus', value: received.length, icon: Inbox, tone: 'amber', note: 'Transmis par le chef de service' },
    { label: 'En cours de traitement', value: reports.filter(r => r.status === 'En cours').length, icon: LoaderCircle, tone: 'cyan', note: 'Interventions organisées' },
    { label: 'Signalements résolus', value: reports.filter(r => r.status === 'Résolu').length, icon: BadgeCheck, tone: 'green', note: 'Dossiers clôturés' },
    { label: 'Techniciens disponibles', value: TECHNICIANS.filter(t => isAvailable(t.id, interventions)).length, icon: Wrench, tone: 'blue', note: `Sur ${TECHNICIANS.length} équipes` },
  ];
  return <>
    <Heading eyebrow="ESPACE CHEF D’UNITÉ" title="Tableau de bord opérationnel" description="Prenez en charge les signalements transmis et organisez les interventions." />
    <div className="stats-grid">{cards.map(c => <article className="stat-card" key={c.label}><div className="stat-card-top"><span>{c.label}</span><span className={`stat-icon tone-${c.tone}`}><c.icon size={19} /></span></div><div className="stat-value">{String(c.value).padStart(2, '0')}</div><p>{c.note}</p></article>)}</div>
    <UnitReportsTable reports={received} title="Signalements à organiser" />
  </>;
}

export function UnitReportsPage() {
  const { reports } = useService();
  const [filter, setFilter] = useState<'Transmis' | 'En cours' | 'Résolu'>('Transmis');
  const rows = reports.filter(r => r.status === filter);
  return <>
    <Heading eyebrow="SIGNALEMENTS TRANSMIS" title="Signalements reçus" description="Vérifiez la description, la localisation, la priorité et l’état avant d’organiser les travaux." />
    <div className="tab-bar">{(['Transmis', 'En cours', 'Résolu'] as const).map(s => <Button key={s} variant="ghost" className={filter === s ? 'tab-active' : ''} onClick={() => setFilter(s)}>{s === 'Transmis' ? 'À organiser' : s} <span>{reports.filter(r => r.status === s).length}</span></Button>)}</div>
    <UnitReportsTable reports={rows} title={filter === 'Transmis' ? 'À organiser' : filter} />
  </>;
}

function UnitReportsTable({ reports, title }: { reports: Report[]; title: string }) {
  const { assign, interventions, history } = useService();
  const actor = useActor();
  const [selected, setSelected] = useState<Report | null>(null);
  const [tech, setTech] = useState('');
  const [actions, setActions] = useState('');
  const [notice, setNotice] = useState('');
  function open(r: Report) { setSelected(r); setTech(rankTechnicians(r, interventions)[0]?.id ?? ''); setActions(''); }
  function submit() {
    if (!selected || !tech || !actions.trim()) return;
    const i = assign(selected.id, tech, actions.trim(), actor);
    if (i) setNotice(`${i.id} créée pour ${selected.id} — ${i.team} affectée.`);
    setSelected(null);
  }
  return <>
    {notice && <div className="action-notice" role="status"><Check size={16} />{notice}</div>}
    <section className="table-section"><div className="section-heading"><h2>{title} <span className="count-pill">{reports.length}</span></h2></div>
      <div className="table-scroll"><table className="reports-table"><thead><tr><th>ID / CITOYEN</th><th>TYPE DE PANNE</th><th>LOCALISATION</th><th>PRIORITÉ</th><th>DATE</th><th>STATUT</th><th className="actions-heading">ACTIONS</th></tr></thead>
        <tbody>{reports.map(r => <tr key={r.id}><td><span className="report-id">{r.id}</span><span className="citizen-name">{r.citizen}</span></td><td>{r.type}</td><td><span className="location-name">{r.location}</span><span className="zone-name"><MapPin size={11} />{r.zone}</span></td><td><PriorityBadge priority={r.priority} /></td><td className="date-cell">{formatDate(r.date)}</td><td><StatusBadge status={r.status} /></td>
          <td><div className="row-actions">{r.status === 'Transmis' ? <Button size="sm" onClick={() => open(r)}><Wrench />Organiser</Button> : <Button size="sm" variant="outline" asChild><Link to="/unite/interventions">Suivre</Link></Button>}</div></td></tr>)}</tbody></table>
        {reports.length === 0 && <div className="empty-state"><Inbox /><h3>Aucun signalement</h3><p>Rien à traiter pour le moment.</p></div>}</div></section>
    <Dialog open={!!selected} onOpenChange={o => { if (!o) setSelected(null); }}>
      <DialogContent className="report-dialog">{selected && <>
        <div className="dialog-eyebrow">{selected.id}</div>
        <DialogTitle>Organiser l’intervention</DialogTitle>
        <DialogDescription>{selected.type} · {selected.location}, {selected.zone}</DialogDescription>
        <div className="detail-badges"><StatusBadge status={selected.status} /><PriorityBadge priority={selected.priority} /></div>
        <div className="detail-description"><small>Description de la panne</small><p>{selected.description}</p></div>
        {selected.comment && <div className="detail-description"><small>Commentaire du chef de service</small><p>{selected.comment}</p></div>}
        <div className="detail-description"><small>Spécialité requise</small><p>{specialtyFor(selected.type)}</p></div>
        <label className="comment-label" htmlFor="unit-tech">Technicien / équipe</label>
        <select id="unit-tech" className="form-field" value={tech} onChange={e => setTech(e.target.value)}>
          {rankTechnicians(selected, interventions).map(t => <option key={t.id} value={t.id}>{t.name} — {t.specialty} · {t.zone} · {isAvailable(t.id, interventions) ? 'disponible' : 'occupé'}</option>)}
        </select>
        <label className="comment-label" htmlFor="unit-actions">Actions techniques à réaliser</label>
        <textarea id="unit-actions" className="form-field comment-field" rows={3} value={actions} onChange={e => setActions(e.target.value)} placeholder="Ex. remplacement de la lampe, contrôle du câblage…" />
        <p className="decision-hint">Le signalement passera « En cours » et l’affectation sera enregistrée dans l’historique.</p>
        <div className="dialog-actions"><Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button><Button disabled={!actions.trim() || !tech} onClick={submit}><ArrowRight />Créer l’intervention</Button></div>
        <div className="detail-history"><h4>Historique</h4>{history.filter(h => h.reportId === selected.id).map(h => <p key={h.id}><strong>{h.action}</strong> · {formatDate(h.date)}{h.author && <><br />Par {h.author}{h.recipient ? ` → ${h.recipient}` : ''}</>}{h.comment && <><br />{h.comment}</>}</p>)}</div>
      </>}</DialogContent>
    </Dialog>
  </>;
}

export function UnitInterventionsPage() {
  const { interventions } = useService();
  const [filter, setFilter] = useState('En cours');
  const [selected, setSelected] = useState<Intervention | null>(null);
  return <>
    <Heading eyebrow="SUIVI DES TRAVAUX" title="Interventions" description="Suivez l’avancement, vérifiez les retours des techniciens et clôturez les dossiers." />
    <div className="tab-bar">{['En cours', 'Terminée', ''].map(s => <Button key={s} variant="ghost" className={filter === s ? 'tab-active' : ''} onClick={() => setFilter(s)}>{s || 'Toutes'} <span>{interventions.filter(i => !s || i.status === s).length}</span></Button>)}</div>
    <div className="interventions-grid">{interventions.filter(i => !filter || i.status === filter).map(i => <article className="intervention-card" key={i.id}>
      <div className="intervention-card-top"><span className="stat-icon tone-blue"><Wrench /></span><StatusBadge status={i.status === 'Terminée' ? 'Résolu' : 'En cours'} /></div>
      <small>{i.id}</small><h2>{i.location}</h2><p><MapPin size={14} />{i.zone}</p>
      <div className="intervention-meta"><span>Technicien<strong>{i.team}</strong></span><span>Signalement<strong>{i.reportId}</strong></span></div>
      {i.actions && <p>Actions : {i.actions}</p>}
      {i.feedback && <p>Retour : {i.feedback}</p>}
      <div className="work-progress"><span>Avancement<strong>{i.progress}%</strong></span><progress max={100} value={i.progress} /></div>
      <div className="intervention-date"><Clock3 size={14} />{formatDate(i.date)}{i.status === 'En cours' && <Button size="sm" variant="outline" onClick={() => setSelected(i)}>Mettre à jour</Button>}</div>
    </article>)}</div>
    <FollowUpDialog intervention={selected} onClose={() => setSelected(null)} />
  </>;
}

function FollowUpDialog({ intervention, onClose }: { intervention: Intervention | null; onClose: () => void }) {
  const { updateIntervention, resolve } = useService();
  const actor = useActor();
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [key, setKey] = useState('');
  if (intervention && key !== intervention.id) { setKey(intervention.id); setProgress(intervention.progress); setFeedback(''); }
  return <Dialog open={!!intervention} onOpenChange={o => { if (!o) { onClose(); setKey(''); } }}>
    <DialogContent className="report-dialog">{intervention && <>
      <div className="dialog-eyebrow">{intervention.id} · {intervention.reportId}</div>
      <DialogTitle>Suivi de l’intervention</DialogTitle>
      <DialogDescription>{intervention.team} · {intervention.location}</DialogDescription>
      <label className="comment-label" htmlFor="fu-progress">Avancement : {progress}%</label>
      <input id="fu-progress" type="range" min={0} max={99} value={progress} onChange={e => setProgress(Number(e.target.value))} />
      <label className="comment-label" htmlFor="fu-feedback">Retour du technicien / commentaire</label>
      <textarea id="fu-feedback" className="form-field comment-field" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Constat, pièces remplacées, difficultés…" />
      <div className="dialog-actions">
        <Button variant="outline" onClick={() => { updateIntervention(intervention.id, progress, feedback.trim(), actor); onClose(); setKey(''); }}>Enregistrer le suivi</Button>
        <Button onClick={() => { resolve(intervention.id, feedback.trim(), actor); onClose(); setKey(''); }}><BadgeCheck />Marquer résolu</Button>
      </div>
    </>}</DialogContent>
  </Dialog>;
}

export function UnitTechniciansPage() {
  const { interventions } = useService();
  return <>
    <Heading eyebrow="ÉQUIPES TECHNIQUES" title="Techniciens" description="Spécialités, zones et disponibilité des équipes." />
    <div className="interventions-grid">{TECHNICIANS.map(t => <article className="intervention-card" key={t.id}>
      <div className="intervention-card-top"><span className="stat-icon tone-blue"><UserRound /></span><StatusBadge status={isAvailable(t.id, interventions) ? 'Résolu' : 'En cours'} /></div>
      <small>{t.id}</small><h2>{t.name}</h2><p><MapPin size={14} />{t.zone}</p>
      <div className="intervention-meta"><span>Spécialité<strong>{t.specialty}</strong></span><span>Interventions actives<strong>{activeLoad(t.id, interventions)}</strong></span></div>
      <div className="intervention-date"><Phone size={14} />{t.phone}<span>{isAvailable(t.id, interventions) ? 'Disponible' : 'Occupé'}</span></div>
    </article>)}</div>
  </>;
}
