export type InternalRole = 'chef_service' | 'chef_unite' | 'chef_equipe' | 'technicien';
export const ROLE_LABELS: Record<InternalRole, string> = {
  chef_service: 'Chef de service',
  chef_unite: "Chef d'unité",
  chef_equipe: "Chef d'équipe",
  technicien: 'Technicien',
};

export interface Citoyen {
  id_citoyen: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  mot_de_passe: string;
}

export interface CompteInterne {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: InternalRole;
  identifiant_pro: string;
  statut: 'actif' | 'desactive';
  mot_de_passe: string;
}

export type InscriptionForm = Omit<Citoyen, 'id_citoyen'> & { confirmation: string };
export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9 ]{8,15}$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmailTaken(email: string, citoyens: Citoyen[], internes: CompteInterne[]) {
  const e = normalizeEmail(email);
  return citoyens.some((c) => c.email === e) || internes.some((i) => i.email === e);
}

/** Identifiant citoyen : CIT-<année>-<numéro sur 4 chiffres>, séquentiel. */
export function nextCitoyenId(citoyens: Citoyen[], year = new Date().getFullYear()) {
  const prefix = `CIT-${year}-`;
  const max = citoyens
    .filter((c) => c.id_citoyen.startsWith(prefix))
    .reduce((m, c) => Math.max(m, Number(c.id_citoyen.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export function validateInscription(f: InscriptionForm, taken: boolean): Errors<InscriptionForm> {
  const e: Errors<InscriptionForm> = {};
  if (!f.nom.trim()) e.nom = 'Le nom est obligatoire.';
  if (!f.prenom.trim()) e.prenom = 'Le prénom est obligatoire.';
  if (!f.email.trim()) e.email = "L'adresse e-mail est obligatoire.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Adresse e-mail invalide.';
  else if (taken) e.email = 'Cette adresse e-mail est déjà utilisée.';
  if (!f.telephone.trim()) e.telephone = 'Le téléphone est obligatoire.';
  else if (!PHONE_RE.test(f.telephone.trim())) e.telephone = 'Numéro de téléphone invalide.';
  if (!f.adresse.trim()) e.adresse = "L'adresse est obligatoire.";
  if (!f.mot_de_passe) e.mot_de_passe = 'Le mot de passe est obligatoire.';
  else if (f.mot_de_passe.length < 8) e.mot_de_passe = 'Au moins 8 caractères.';
  if (!f.confirmation) e.confirmation = 'Veuillez confirmer le mot de passe.';
  else if (f.confirmation !== f.mot_de_passe) e.confirmation = 'Les mots de passe ne correspondent pas.';
  return e;
}

export type CompteForm = Omit<CompteInterne, 'id' | 'mot_de_passe'>;
export function validateCompte(f: CompteForm, taken: boolean): Errors<CompteForm> {
  const e: Errors<CompteForm> = {};
  if (!f.nom.trim()) e.nom = 'Le nom est obligatoire.';
  if (!f.prenom.trim()) e.prenom = 'Le prénom est obligatoire.';
  if (!f.email.trim()) e.email = "L'adresse e-mail professionnelle est obligatoire.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Adresse e-mail invalide.';
  else if (taken) e.email = 'Cette adresse e-mail est déjà utilisée.';
  if (!f.telephone.trim()) e.telephone = 'Le téléphone est obligatoire.';
  else if (!PHONE_RE.test(f.telephone.trim())) e.telephone = 'Numéro de téléphone invalide.';
  return e;
}
