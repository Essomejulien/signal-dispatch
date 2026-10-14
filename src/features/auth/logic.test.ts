import { describe, expect, it } from 'vitest';
import { isEmailTaken, nextCitoyenId, validateInscription, type Citoyen } from './logic';

const base = { nom: 'Ngo', prenom: 'Marie', email: 'marie@mail.cm', telephone: '690000000', adresse: 'Akwa', mot_de_passe: 'secret123', confirmation: 'secret123' };
const cit = (id: string, email = 'x@y.cm'): Citoyen => ({ ...base, id_citoyen: id, email });

describe('inscription citoyen', () => {
  it('refuse une confirmation différente du mot de passe', () => {
    expect(validateInscription({ ...base, confirmation: 'autre' }, false).confirmation).toBe('Les mots de passe ne correspondent pas.');
  });
  it('signale un e-mail déjà utilisé, sans tenir compte de la casse', () => {
    expect(isEmailTaken(' Marie@Mail.cm ', [cit('CIT-2026-0001', 'marie@mail.cm')], [])).toBe(true);
    expect(validateInscription(base, true).email).toBe('Cette adresse e-mail est déjà utilisée.');
  });
  it('exige tous les champs obligatoires', () => {
    const e = validateInscription({ nom: '', prenom: '', email: '', telephone: '', adresse: '', mot_de_passe: '', confirmation: '' }, false);
    expect(Object.keys(e).sort()).toEqual(['adresse', 'confirmation', 'email', 'mot_de_passe', 'nom', 'prenom', 'telephone']);
  });
  it('génère un identifiant citoyen séquentiel par année', () => {
    expect(nextCitoyenId([], 2026)).toBe('CIT-2026-0001');
    expect(nextCitoyenId([cit('CIT-2026-0001'), cit('CIT-2026-0007')], 2026)).toBe('CIT-2026-0008');
  });
});
