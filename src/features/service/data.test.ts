import { describe, it, expect } from 'vitest';
import { initialReports, canDecide, decideReport, filterReports, getStats } from './data';
function reportAt(index:number) { const report=initialReports[index]; if(!report) throw new Error('Missing test report'); return report; }
describe('Chef de Service rules',()=>{
 it('only allows decisions for pending reports',()=>{for(const r of initialReports) expect(canDecide(r)).toBe(r.status==='En attente')});
 it('validates a pending report and retains its comment and validation date',()=>{const r=reportAt(0);const result=decideReport(r,'Validé','Transmis au Chef d’Unité','2026-10-08T10:00:00');expect(result.status).toBe('Validé');expect(result.comment).toBe('Transmis au Chef d’Unité');expect(result.validationDate).toBe('2026-10-08T10:00:00');});
 it('rejects a pending report without a validation date',()=>{expect(decideReport(reportAt(0),'Rejeté','Doublon','2026-10-08').status).toBe('Rejeté');expect(decideReport(reportAt(0),'Rejeté','Doublon','2026-10-08').validationDate).toBeUndefined();});
 it('does not change an already processed report',()=>{expect(decideReport(reportAt(2),'Rejeté','Test','2026-10-08')).toEqual(reportAt(2));});
 it('updates pending and validated statistics after a decision',()=>{const rows=initialReports.map((r,i)=>i===0?decideReport(r,'Validé','','2026-10-08'):r);expect(getStats(rows)).toEqual({total:12,pending:2,validated:3,rejected:1,ongoing:3,resolved:3});});
 it('combines search status priority and inclusive date range',()=>{const rows=filterReports(initialReports,'Akwa','En attente','Haute','2026-10-08','2026-10-08');expect(rows.map(r=>r.id)).toEqual(['SIG-2026-0148']);expect(filterReports(initialReports,'Akwa','En attente','Haute','2026-10-09','2026-10-10')).toHaveLength(0);});
});
import { createReport, priorityFor } from './data';
describe('Signalement citoyen',()=>{
 it('assigns priority from fault type',()=>{expect(priorityFor('Câble endommagé')).toBe('Haute');expect(priorityFor('Lampadaire éteint')).toBe('Moyenne');expect(priorityFor('Autre')).toBe('Basse');});
 it('creates a pending report with next id and detected zone',()=>{const r=createReport(initialReports,{citizen:'Ada Bell',type:'Poteau endommagé',location:'Douala, Akwa',description:'x'},'2026-10-12T08:00:00');expect(r.id).toBe('SIG-2026-0149');expect(r.status).toBe('En attente');expect(r.zone).toBe('Akwa');expect(r.priority).toBe('Haute');});
});
