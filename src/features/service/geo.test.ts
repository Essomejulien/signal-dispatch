import { describe, it, expect } from 'vitest';
import { createReport, nearestZone } from './data';
import { reportPosition } from './gis';
describe('position GPS du signalement', () => {
  it('attribue la zone la plus proche', () => { expect(nearestZone(4.095, 9.738)).toBe('Bonamoussadi'); });
  it('la carte utilise la position exacte envoyée', () => {
    const r = createReport([], { citizen: 'A B', type: 'Lampadaire éteint', location: 'Rue X', description: 'xxxxxxxxxxxx', lat: 4.072, lng: 9.665 }, '2026-10-14T08:00:00Z');
    expect(r.zone).toBe('Bonabéri'); expect(reportPosition(r)).toEqual([4.072, 9.665]);
  });
});
