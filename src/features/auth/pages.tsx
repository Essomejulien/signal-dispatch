import { Link, useNavigate } from '@tanstack/react-router';
import { useState, type ReactNode, type InputHTMLAttributes } from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, Eye, EyeOff, Lightbulb, Loader2, MapPin, ShieldCheck, Wrench, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import doualaPort from '@/assets/douala-port.jpg';
import { Brand, PartnerLogos } from '@/components/brand';
import { useAuth } from './store';
import { validateInscription, type InscriptionForm, type Errors } from './logic';

export function Field({ label, error, id, children, ...props }: { label: string; error?: string | undefined; id: string; children?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}{props.required && <span className="req"> *</span>}</label>
      {children ?? <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={error ? 'has-error' : ''} {...props} />}
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </div>
  );
}

function PasswordField(props: { id: string; label: string; value: string; error?: string | undefined; placeholder: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={props.label} id={props.id} error={props.error} required>
      <div className="pw-wrap">
        <input id={props.id} type={show ? 'text' : 'password'} value={props.value} placeholder={props.placeholder} autoComplete={props.autoComplete}
          aria-invalid={!!props.error} className={props.error ? 'has-error' : ''} onChange={(e) => props.onChange(e.target.value)} />
        <Button variant="ghost" size="icon" type="button" onClick={() => setShow(!show)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
      </div>
    </Field>
  );
}

function AuthLayout({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="auth-page">
      <header className="auth-header"><span /><Link to="/" className="auth-back">Retour à l’accueil <ArrowRight size={15} /></Link></header>
      <div className="auth-frame">
        <aside className="auth-aside">
          <img className="auth-cover" src={doualaPort} alt="Le port et la ville de Douala" />
          <div className="auth-aside-inner"><div className="auth-aside-brand"><Brand /></div>{aside}<PartnerLogos /><p className="auth-aside-foot">Une ville plus lumineuse. Ensemble.</p></div>
        </aside>
        <main className="auth-main">{children}</main>
      </div>
      <div className="auth-mobile-partners"><PartnerLogos compact /></div>
      <footer className="auth-page-footer"><span>© 2026 Rakuev · Ville de Douala</span><span><ShieldCheck size={14} /> Espace sécurisé</span></footer>
    </div>
  );
}

export function HomePage() {
  const { session } = useAuth();
  const features = [
    { icon: MapPin, title: 'Signaler une panne', text: 'Indiquez un lampadaire éteint ou endommagé dans votre quartier.' },
    { icon: ClipboardList, title: 'Suivre votre signalement', text: 'Consultez l’état de prise en charge par le service.' },
    { icon: Wrench, title: 'Interventions planifiées', text: 'Les équipes techniques sont assignées et suivies.' },
  ];
  return (
    <div className="home">
      <header className="home-nav">
        <div className="home-brand-group"><Brand /><PartnerLogos compact /></div>
        <nav>
          {session?.kind === 'interne' ? <Button asChild><Link to="/tableau-de-bord">Mon espace</Link></Button> : session?.kind === 'citoyen' ? <Button asChild><Link to="/signaler">Signaler un problème</Link></Button> : <>
            <Button variant="ghost" asChild><Link to="/connexion">Se connecter</Link></Button>
            <Button asChild><Link to="/inscription">Créer un compte</Link></Button></>}
        </nav>
      </header>
      <section className="home-hero"><img className="home-cover" src={doualaPort} alt="Vue aérienne du port de Douala" />
        <div className="home-hero-inner">
          <p className="eyebrow">VILLE DE DOUALA · SERVICE DE L’ÉCLAIRAGE PUBLIC</p>
          <h1>Rakuev<span className="brand-dot">.</span><span className="hero-line">Votre ville, sous un nouveau jour.</span></h1>
          <p>Rakuev permet aux citoyens de signaler les pannes d’éclairage public et aux équipes municipales de les traiter rapidement.</p>
          {session?.kind === 'citoyen' ? <div className="home-cta"><p className="home-welcome"><CheckCircle2 size={16} /> Connecté en tant que {session.name}</p><Button size="lg" asChild><Link to="/signaler">Signaler un problème <ArrowRight /></Link></Button></div> :
            <div className="home-cta"><Button size="lg" asChild><Link to="/inscription">Créer mon compte citoyen <ArrowRight /></Link></Button><Button size="lg" variant="outline" asChild><Link to="/connexion">Se connecter</Link></Button></div>}
        </div>
      </section>
      <section className="home-features">
        {features.map((f) => <article key={f.title} className="stat-card"><span className="stat-icon tone-blue"><f.icon size={18} /></span><h2>{f.title}</h2><p>{f.text}</p></article>)}
      </section>
      <footer className="app-footer home-footer"><span>© 2026 Rakuev · Ville de Douala</span><span><ShieldCheck size={14} /> Les comptes des agents sont créés par l’administration.</span></footer>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "L'adresse e-mail est obligatoire.";
    if (!password) next.password = 'Le mot de passe est obligatoire.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) return setErrors({ form: res.error });
    toast.success(`Bienvenue, ${res.session.name}`);
    navigate({ to: res.session.kind === 'interne' ? '/tableau-de-bord' : '/signaler' });
  }

  return (
    <AuthLayout aside={<div className="auth-aside-text"><h2>Heureux de vous revoir.</h2><p>Citoyens, chefs de service, chefs d’unité, chefs d’équipe et techniciens utilisent le même accès. Votre espace est déterminé par votre rôle.</p></div>}>
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Se connecter</h1>
        <p className="auth-sub">Accédez à votre espace Rakuev.</p>
        {errors.form && <div className="form-alert" role="alert">{errors.form}</div>}
        <Field id="email" label="Adresse e-mail" type="email" required autoComplete="email" placeholder="exemple@domaine.com" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField id="password" label="Mot de passe" value={password} error={errors.password} placeholder="Votre mot de passe" autoComplete="current-password" onChange={setPassword} />
        <div className="auth-row"><Link to="/mot-de-passe-oublie" className="auth-link">Mot de passe oublié ?</Link></div>
        <Button type="submit" className="auth-submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Connexion…</> : <>Se connecter <ArrowRight size={17} /></>}</Button>
        <p className="auth-switch">Pas encore de compte citoyen ? <Link to="/inscription" className="auth-link">Créer un compte</Link></p>
        <p className="demo-hint">Démo chef de service : alain.kouame@ville-douala.cm / demo1234</p>
      </form>
    </AuthLayout>
  );
}

const EMPTY: InscriptionForm = { nom: '', prenom: '', email: '', telephone: '', adresse: '', mot_de_passe: '', confirmation: '' };

export function RegisterPage() {
  const { register, emailTaken } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<InscriptionForm>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const set = (k: keyof InscriptionForm) => (v: string) => { setF((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined })); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateInscription(f, emailTaken(f.email));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const res = await register(f);
    setLoading(false);
    if (!res.ok) return setErrors({ email: res.error });
    setDone(res.id);
    toast.success('Compte créé avec succès');
    setTimeout(() => navigate({ to: '/connexion' }), 2500);
  }

  return (
    <AuthLayout aside={<div className="auth-aside-text"><h2>Une petite action.
Un quartier plus lumineux.</h2><p>Votre compte citoyen vous permet de signaler une panne et de suivre son traitement par le service de l’éclairage public.</p></div>}>
      {done ? (
        <div className="auth-card auth-success" role="status">
          <CheckCircle2 size={44} />
          <h1>Compte créé avec succès</h1>
          <p className="auth-sub">Votre identifiant citoyen : <strong>{done}</strong></p>
          <p className="auth-sub">Redirection vers la page de connexion…</p>
          <Button asChild className="auth-submit"><Link to="/connexion">Se connecter maintenant</Link></Button>
        </div>
      ) : (
        <form className="auth-card" onSubmit={submit} noValidate>
          <h1>Créer un compte citoyen</h1>
          <p className="auth-sub">Accédez aux services de signalement de l’éclairage public.</p>
          <div className="auth-grid-2">
            <Field id="nom" label="Nom" required placeholder="Votre nom" autoComplete="family-name" maxLength={100} value={f.nom} error={errors.nom} onChange={(e) => set('nom')(e.target.value)} />
            <Field id="prenom" label="Prénom" required placeholder="Votre prénom" autoComplete="given-name" maxLength={100} value={f.prenom} error={errors.prenom} onChange={(e) => set('prenom')(e.target.value)} />
          </div>
          <Field id="email" label="Adresse e-mail" type="email" required placeholder="exemple@domaine.com" autoComplete="email" maxLength={255} value={f.email} error={errors.email} onChange={(e) => set('email')(e.target.value)} />
          <Field id="telephone" label="Téléphone" type="tel" required placeholder="Votre numéro de téléphone" autoComplete="tel" maxLength={20} value={f.telephone} error={errors.telephone} onChange={(e) => set('telephone')(e.target.value)} />
          <Field id="adresse" label="Adresse" required placeholder="Quartier, rue ou localisation" autoComplete="street-address" maxLength={255} value={f.adresse} error={errors.adresse} onChange={(e) => set('adresse')(e.target.value)} />
          <PasswordField id="mot_de_passe" label="Mot de passe" value={f.mot_de_passe} error={errors.mot_de_passe} placeholder="Créer un mot de passe (8 caractères min.)" autoComplete="new-password" onChange={set('mot_de_passe')} />
          <PasswordField id="confirmation" label="Confirmer le mot de passe" value={f.confirmation} error={errors.confirmation} placeholder="Saisir à nouveau le mot de passe" autoComplete="new-password" onChange={set('confirmation')} />
          <Button type="submit" className="auth-submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Création du compte…</> : 'Créer mon compte'}</Button>
          <p className="auth-switch">Vous avez déjà un compte ? <Link to="/connexion" className="auth-link">Se connecter</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Saisissez une adresse e-mail valide.');
    setError(''); setLoading(true); await new Promise((r) => setTimeout(r, 800)); setLoading(false); setSent(true);
  }
  return (
    <AuthLayout aside={<div className="auth-aside-text"><h2>Récupération sécurisée</h2><p>Un lien de réinitialisation est envoyé à l’adresse associée à votre compte.</p></div>}>
      {sent ? <div className="auth-card auth-success" role="status"><Mail size={42} /><h1>Vérifiez vos e-mails</h1><p className="auth-sub">Si un compte existe pour {email}, un lien de réinitialisation vient d’être envoyé.</p><Button asChild className="auth-submit"><Link to="/connexion">Retour à la connexion</Link></Button></div> :
        <form className="auth-card" onSubmit={submit} noValidate>
          <h1>Mot de passe oublié</h1>
          <p className="auth-sub">Indiquez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
          <Field id="email" label="Adresse e-mail" type="email" required placeholder="exemple@domaine.com" value={email} error={error} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="auth-submit" disabled={loading}>{loading ? <><Loader2 className="animate-spin" /> Envoi…</> : 'Envoyer le lien'}</Button>
          <p className="auth-switch"><Link to="/connexion" className="auth-link">Retour à la connexion</Link></p>
        </form>}
    </AuthLayout>
  );
}
