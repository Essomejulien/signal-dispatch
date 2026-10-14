import type React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { isEmailTaken, nextCitoyenId, normalizeEmail, type Citoyen, type CompteInterne, type CompteForm, type InscriptionForm } from './logic';

// Démonstration : données conservées dans le navigateur. À remplacer par les appels à l'API (base MySQL).
export type Session = { kind: 'citoyen'; id: string; name: string } | { kind: 'interne'; id: string; name: string; role: CompteInterne['role'] };

const SEED_INTERNES: CompteInterne[] = [
  { id: 'INT-0001', nom: 'Kouamé', prenom: 'Alain', email: 'alain.kouame@ville-douala.cm', telephone: '+237 690 00 00 01', role: 'chef_service', identifiant_pro: 'CS-001', statut: 'actif', mot_de_passe: 'demo1234' },
  { id: 'INT-0002', nom: 'Ndjock', prenom: 'Bernard', email: 'bernard.ndjock@ville-douala.cm', telephone: '+237 690 00 00 02', role: 'chef_unite', identifiant_pro: 'CU-001', statut: 'actif', mot_de_passe: 'demo1234' },
];

interface AuthStore {
  session: Session | null;
  citoyens: Citoyen[];
  internes: CompteInterne[];
  emailTaken: (email: string) => boolean;
  register: (f: InscriptionForm) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  login: (email: string, password: string) => Promise<{ ok: true; session: Session } | { ok: false; error: string }>;
  createInterne: (f: CompteForm) => Promise<{ ok: true; compte: CompteInterne } | { ok: false; error: string }>;
  toggleStatut: (id: string) => void;
  logout: () => void;
}

const ga = globalThis as unknown as { __rakuevAuthCtx?: React.Context<AuthStore | null> };
const Ctx = ga.__rakuevAuthCtx ??= createContext<AuthStore | null>(null);
const wait = (ms = 900) => new Promise((r) => setTimeout(r, ms));
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [citoyens, setCitoyens] = useState<Citoyen[]>([]);
  const [internes, setInternes] = useState<CompteInterne[]>(SEED_INTERNES);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCitoyens(load('eclaire.citoyens', []));
    setInternes(() => { const l = load<CompteInterne[]>('eclaire.internes', SEED_INTERNES); return [...l, ...SEED_INTERNES.filter((s) => !l.some((x) => x.email === s.email))]; });
    setSession(load('eclaire.session', null));
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('eclaire.citoyens', JSON.stringify(citoyens)); }, [citoyens, ready]);
  useEffect(() => { if (ready) localStorage.setItem('eclaire.internes', JSON.stringify(internes)); }, [internes, ready]);
  useEffect(() => { if (ready) localStorage.setItem('eclaire.session', JSON.stringify(session)); }, [session, ready]);

  const emailTaken = (email: string) => isEmailTaken(email, citoyens, internes);

  async function register(f: InscriptionForm) {
    await wait();
    if (emailTaken(f.email)) return { ok: false as const, error: 'Cette adresse e-mail est déjà utilisée.' };
    const id = nextCitoyenId(citoyens);
    const { confirmation: _c, ...rest } = f;
    setCitoyens((p) => [...p, { ...rest, email: normalizeEmail(f.email), nom: f.nom.trim(), prenom: f.prenom.trim(), id_citoyen: id }]);
    return { ok: true as const, id };
  }

  async function login(email: string, password: string) {
    await wait(700);
    const e = normalizeEmail(email);
    const i = internes.find((x) => x.email === e && x.mot_de_passe === password);
    if (i) {
      if (i.statut !== 'actif') return { ok: false as const, error: 'Ce compte est désactivé. Contactez l’administration.' };
      const s: Session = { kind: 'interne', id: i.id, name: `${i.prenom} ${i.nom}`, role: i.role };
      setSession(s); return { ok: true as const, session: s };
    }
    const c = citoyens.find((x) => x.email === e && x.mot_de_passe === password);
    if (c) { const s: Session = { kind: 'citoyen', id: c.id_citoyen, name: `${c.prenom} ${c.nom}` }; setSession(s); return { ok: true as const, session: s }; }
    return { ok: false as const, error: 'Adresse e-mail ou mot de passe incorrect.' };
  }

  async function createInterne(f: CompteForm) {
    await wait();
    if (emailTaken(f.email)) return { ok: false as const, error: 'Cette adresse e-mail est déjà utilisée.' };
    const compte: CompteInterne = { ...f, email: normalizeEmail(f.email), id: `INT-${String(internes.length + 1).padStart(4, '0')}`, mot_de_passe: Math.random().toString(36).slice(2, 10) };
    setInternes((p) => [...p, compte]);
    return { ok: true as const, compte };
  }

  return (
    <Ctx.Provider value={{ session, citoyens, internes, emailTaken, register, login, createInterne, logout: () => setSession(null),
      toggleStatut: (id) => setInternes((p) => p.map((x) => (x.id === id ? { ...x, statut: x.statut === 'actif' ? 'desactive' : 'actif' } : x))) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { const v = useContext(Ctx); if (!v) throw new Error('AuthProvider required'); return v; }
