import type { Report } from './data';

export type LampState = 'fonctionnel' | 'defectueux' | 'intervention';
export interface Lamp { id: string; zone: string; street: string; lat: number; lng: number; state: LampState; power: number; report?: Report }

export const ZONES: Record<string, [number, number]> = {
  Akwa: [4.0511, 9.7008], Bonamoussadi: [4.0950, 9.7380], 'Deïdo': [4.0640, 9.7080],
  Ndokoti: [4.0450, 9.7400], 'Bonabéri': [4.0720, 9.6650], Bali: [4.0430, 9.6950],
};
export const DOUALA_CENTER: [number, number] = [4.0600, 9.7150];

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

export function reportPosition(r: Report): [number, number] {
  if (r.lat != null && r.lng != null) return [r.lat, r.lng];
  const [la, ln] = ZONES[r.zone] ?? DOUALA_CENTER;
  return [la + (hash(r.location) - 0.5) * 0.012, ln + (hash(r.location + 'x') - 0.5) * 0.012];
}

/** Statut d'un lampadaire lié à un signalement citoyen. */
export function stateFromReport(r: Report): LampState {
  if (r.status === 'En cours') return 'intervention';
  if (r.status === 'En attente' || r.status === 'Validé') return 'defectueux';
  return 'fonctionnel';
}

export function buildLamps(reports: Report[]): Lamp[] {
  const lamps: Lamp[] = [];
  Object.entries(ZONES).forEach(([zone, [la, ln]]) => {
    for (let i = 0; i < 14; i++) {
      const k = `${zone}-${i}`;
      lamps.push({ id: `LP-${zone.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`, zone, street: `Secteur ${zone} ${i + 1}`, lat: la + (hash(k) - 0.5) * 0.022, lng: ln + (hash(k + 'y') - 0.5) * 0.022, state: 'fonctionnel', power: 80 + Math.round(hash(k + 'p') * 70) });
    }
  });
  reports.filter(r => r.status !== 'Rejeté').forEach((r, i) => {
    const [lat, lng] = reportPosition(r);
    lamps.push({ id: `LP-SIG-${String(i + 1).padStart(3, '0')}`, zone: r.zone, street: r.location, lat, lng, state: stateFromReport(r), power: 120, report: r });
  });
  return lamps;
}
