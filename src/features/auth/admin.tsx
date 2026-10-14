import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from './store';
import { Field } from './pages';
import { ROLE_LABELS, validateCompte, type CompteForm, type Errors, type InternalRole } from './logic';

const EMPTY: CompteForm = { nom: '', prenom: '', email: '', telephone: '', role: 'technicien', identifiant_pro: '', statut: 'actif' };

export function InternalAccountsPage() {
  const { internes, createInterne, emailTaken, toggleStatut } = useAuth();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<CompteForm>>({});
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof CompteForm>(k: K, v: CompteForm[K]) => { setF((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateCompte(f, emailTaken(f.email));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const res = await createInterne(f);
    setLoading(false);
    if (!res.ok) return setErrors({ email: res.error });
    toast.success(`Compte créé pour ${res.compte.prenom} ${res.compte.nom}`, { description: `Mot de passe provisoire : ${res.compte.mot_de_passe}` });
    setF(EMPTY);
  }

  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Comptes internes</h1><p>Création des comptes des responsables et des techniciens. Cette page n’est pas accessible au public.</p></div></div>
      <div className="admin-grid">
        <form className="stat-card admin-form" onSubmit={submit} noValidate>
          <h2><UserPlus size={17} /> Nouveau compte</h2>
          <div className="auth-grid-2">
            <Field id="a-nom" label="Nom" required value={f.nom} error={errors.nom} onChange={(e) => set('nom', e.target.value)} placeholder="Nom" />
            <Field id="a-prenom" label="Prénom" required value={f.prenom} error={errors.prenom} onChange={(e) => set('prenom', e.target.value)} placeholder="Prénom" />
          </div>
          <Field id="a-email" label="Adresse e-mail professionnelle" type="email" required value={f.email} error={errors.email} onChange={(e) => set('email', e.target.value)} placeholder="prenom.nom@ville-douala.cm" />
          <div className="auth-grid-2">
            <Field id="a-tel" label="Téléphone" type="tel" required value={f.telephone} error={errors.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+237 6xx xx xx xx" />
            <Field id="a-idpro" label="Identifiant professionnel" value={f.identifiant_pro} onChange={(e) => set('identifiant_pro', e.target.value)} placeholder="Facultatif" />
          </div>
          <div className="auth-grid-2">
            <Field id="a-role" label="Fonction ou rôle" required>
              <select id="a-role" value={f.role} onChange={(e) => set('role', e.target.value as InternalRole)}>
                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field id="a-statut" label="Statut du compte" required>
              <select id="a-statut" value={f.statut} onChange={(e) => set('statut', e.target.value as CompteForm['statut'])}>
                <option value="actif">Actif</option><option value="desactive">Désactivé</option>
              </select>
            </Field>
          </div>
          <Button type="submit" className="auth-submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Création…</> : 'Créer le compte'}</Button>
        </form>
        <section className="stat-card">
          <h2>Comptes existants ({internes.length})</h2>
          <ul className="account-list">
            {internes.map((c) => (
              <li key={c.id}>
                <span className="avatar">{c.prenom[0]}{c.nom[0]}</span>
                <div><strong>{c.prenom} {c.nom}</strong><small>{ROLE_LABELS[c.role]} · {c.email}</small></div>
                <button type="button" className={`status-pill ${c.statut === 'actif' ? 'tone-green' : 'tone-neutral'}`} onClick={() => toggleStatut(c.id)} title="Changer le statut">{c.statut === 'actif' ? 'Actif' : 'Désactivé'}</button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
