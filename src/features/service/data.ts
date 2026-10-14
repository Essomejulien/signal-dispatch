export type Status = 'Nouveau' | 'Transmis' | 'Rejeté' | 'En cours' | 'Résolu';
export type Priority = 'Haute' | 'Moyenne' | 'Basse';
export interface Report { id: string; citizen: string; initials: string; type: string; location: string; zone: string; priority: Priority; date: string; status: Status; description: string; comment?: string | undefined; validationDate?: string | undefined; photo?: string | undefined; lat?: number | undefined; lng?: number | undefined; accuracy?: number | undefined }
export interface HistoryEntry { id: string; reportId: string; action: string; comment: string; date: string; author?: string | undefined; recipient?: string | undefined }
const rows: [string,string,string,string,string,Priority,Status][] = [
 ['Amélie Njoya','AN','Lampadaire éteint','Avenue de la Liberté','Akwa','Haute','Nouveau'],
 ['Jean Mballa','JM','Éclairage intermittent','Rue des Manguiers','Bonamoussadi','Moyenne','Nouveau'],
 ['Sarah Eboa','SE','Câble endommagé','Boulevard de la République','Deïdo','Haute','En cours'],
 ['Paul Tchoumi','PT','Lampadaire éteint','Carrefour Ndokoti','Ndokoti','Moyenne','Transmis'],
 ['Marie Ekambi','ME','Poteau endommagé','Rue du Marché','Bonabéri','Haute','Nouveau'],
 ['André Essomba','AE','Éclairage intermittent','Avenue des Palmiers','Bali','Basse','Résolu'],
 ['Claire Ngo','CN','Lampadaire éteint','Rue de la Mairie','Akwa','Moyenne','Résolu'],
 ['Thomas Foning','TF','Signalement en doublon','Rue des Écoles','Deïdo','Basse','Rejeté'],
 ['Fatima Bello','FB','Câble endommagé','Carrefour des Finances','Bonamoussadi','Haute','En cours'],
 ['Joseph Ngono','JN','Lampadaire éteint','Boulevard du Port','Bonabéri','Moyenne','Transmis'],
 ['Élise Manga','EM','Lampadaire éteint','Rue du Stade','Bali','Basse','Résolu'],
 ['David Kotto','DK','Poteau endommagé','Avenue du Général','Ndokoti','Haute','En cours'],
];
export const initialReports: Report[] = rows.map((r,i) => ({ id:`SIG-2026-${String(148-i).padStart(4,'0')}`, citizen:r[0], initials:r[1], type:r[2], location:r[3], zone:r[4], priority:r[5], status:r[6], date:`2026-10-${String(8-Math.floor(i/2)).padStart(2,'0')}T${String(9+i%8).padStart(2,'0')}:30:00`, description:`Un problème d’éclairage a été constaté à proximité de ${r[3]}. La zone est insuffisamment éclairée en soirée et nécessite une vérification.`, comment:r[6]==='Rejeté'?'Signalement déjà enregistré sous une autre référence.':undefined }));
export const initialHistory: HistoryEntry[] = [{id:'h1',reportId:'SIG-2026-0145',action:'Transmis au chef d’unité',comment:'Transmis au Chef d’Unité pour prise en charge.',date:'2026-10-08T08:45:00',author:'Alain Kouamé · Chef de service',recipient:'Bernard Ndjock · Chef d’unité'},{id:'h2',reportId:'SIG-2026-0143',action:'Signalement résolu',comment:'Intervention clôturée après contrôle de l’éclairage.',date:'2026-10-07T16:20:00',author:'Bernard Ndjock · Chef d’unité'}];
export const initialInterventions: Intervention[] = [{id:'INT-2026-0086',reportId:'SIG-2026-0146',location:'Boulevard de la République',zone:'Deïdo',team:'Équipe Centre',technicianId:'TEC-01',status:'En cours',date:'2026-10-08',progress:65},{id:'INT-2026-0085',reportId:'SIG-2026-0140',location:'Carrefour des Finances',zone:'Bonamoussadi',team:'Équipe Nord',technicianId:'TEC-02',status:'En cours',date:'2026-10-07',progress:35},{id:'INT-2026-0084',reportId:'SIG-2026-0137',location:'Avenue du Général',zone:'Ndokoti',team:'Équipe Est',technicianId:'TEC-03',status:'En cours',date:'2026-10-06',progress:80},{id:'INT-2026-0083',reportId:'SIG-2026-0143',location:'Avenue des Palmiers',zone:'Bali',team:'Équipe Centre',technicianId:'TEC-01',status:'Terminée',date:'2026-10-07',progress:100},{id:'INT-2026-0082',reportId:'SIG-2026-0142',location:'Rue de la Mairie',zone:'Akwa',team:'Équipe Centre',technicianId:'TEC-01',status:'Terminée',date:'2026-10-06',progress:100},{id:'INT-2026-0081',reportId:'SIG-2026-0138',location:'Rue du Stade',zone:'Bali',team:'Équipe Centre',technicianId:'TEC-01',status:'Terminée',date:'2026-10-05',progress:100}];
/** Cycle de vie : Nouveau → Transmis → En cours → Résolu (ou Nouveau → Rejeté). */
export const STATUS_FLOW: Record<Status, Status[]> = { 'Nouveau':['Transmis','Rejeté'], 'Transmis':['En cours'], 'En cours':['Résolu'], 'Rejeté':[], 'Résolu':[] };
export function canMove(from: Status, to: Status) { return STATUS_FLOW[from].includes(to); }
export function canDecide(report: Report) { return report.status === 'Nouveau'; }
export function decideReport(report: Report, status: 'Transmis' | 'Rejeté', comment: string, date: string): Report { if (!canDecide(report)) return report; return {...report,status,comment,validationDate:status==='Transmis'?date:undefined}; }
export type InterventionStatus = 'En cours' | 'Terminée';
export interface Intervention { id: string; reportId: string; location: string; zone: string; team: string; technicianId?: string | undefined; status: InterventionStatus; date: string; progress: number; actions?: string | undefined; feedback?: string | undefined }
export interface Technician { id: string; name: string; specialty: string; zone: string; phone: string }
export const TECHNICIANS: Technician[] = [
 {id:'TEC-01',name:'Équipe Centre',specialty:'Lampadaires et luminaires',zone:'Akwa',phone:'+237 690 10 10 01'},
 {id:'TEC-02',name:'Équipe Nord',specialty:'Câblage et réseau souterrain',zone:'Bonamoussadi',phone:'+237 690 10 10 02'},
 {id:'TEC-03',name:'Équipe Est',specialty:'Poteaux et structures',zone:'Ndokoti',phone:'+237 690 10 10 03'},
 {id:'TEC-04',name:'Équipe Ouest',specialty:'Lampadaires et luminaires',zone:'Bonabéri',phone:'+237 690 10 10 04'},
 {id:'TEC-05',name:'Équipe Électricité',specialty:'Câblage et réseau souterrain',zone:'Deïdo',phone:'+237 690 10 10 05'},
];
/** Spécialité requise selon la panne. */
export function specialtyFor(type: string) { if (type==='Câble endommagé'||type==='Éclairage intermittent') return 'Câblage et réseau souterrain'; if (type==='Poteau endommagé') return 'Poteaux et structures'; return 'Lampadaires et luminaires'; }
export function activeLoad(tech: string, list: Intervention[]) { return list.filter(i=>i.technicianId===tech&&i.status==='En cours').length; }
/** Disponible = moins de 2 interventions en cours. */
export function isAvailable(tech: string, list: Intervention[]) { return activeLoad(tech,list) < 2; }
/** Techniciens triés : spécialité adaptée, puis disponibilité, puis même zone. */
export function rankTechnicians(report: Report, list: Intervention[]) { const sp=specialtyFor(report.type); const score=(t:Technician)=>(t.specialty===sp?4:0)+(isAvailable(t.id,list)?2:0)+(t.zone===report.zone?1:0); return [...TECHNICIANS].sort((a,b)=>score(b)-score(a)); }
export function nextInterventionId(list: Intervention[], year = 2026) { const max=list.reduce((m,i)=>Math.max(m,Number(i.id.split('-')[2])||0),0); return `INT-${year}-${String(max+1).padStart(4,'0')}`; }
export function createIntervention(report: Report, list: Intervention[], tech: Technician, actions: string, date: string): Intervention | null { if (report.status!=='Transmis') return null; return { id:nextInterventionId(list), reportId:report.id, location:report.location, zone:report.zone, team:tech.name, technicianId:tech.id, status:'En cours', date:date.slice(0,10), progress:0, actions }; }
/** Ancien vocabulaire conservé dans le navigateur. */
export function migrateStatus(s: string): Status { return (s==='En attente'?'Nouveau':s==='Validé'?'Transmis':s) as Status; }
export function filterReports(reports: Report[], search: string, status: string, priority: string, start: string, end: string) { const q=search.toLocaleLowerCase('fr'); return reports.filter(r => `${r.id} ${r.citizen} ${r.type} ${r.location} ${r.zone}`.toLocaleLowerCase('fr').includes(q) && (!status || r.status===status) && (!priority || r.priority===priority) && (!start || r.date.slice(0,10)>=start) && (!end || r.date.slice(0,10)<=end)); }
export function getStats(reports: Report[]) { return {total:reports.length,pending:reports.filter(r=>r.status==='Nouveau').length,validated:reports.filter(r=>r.status==='Transmis').length,rejected:reports.filter(r=>r.status==='Rejeté').length,ongoing:reports.filter(r=>r.status==='En cours').length,resolved:reports.filter(r=>r.status==='Résolu').length}; }
export function formatDate(date: string) { return new Date(date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}); }
export const PANNE_TYPES = ['Lampadaire éteint','Éclairage intermittent','Câble endommagé','Poteau endommagé','Autre'] as const;
export const ZONES = ['Akwa','Bonamoussadi','Deïdo','Ndokoti','Bonabéri','Bali'];
/** Priorité déterminée par le système selon le type de panne (danger électrique/structurel = Haute). */
export function priorityFor(type: string): Priority { if (type==='Câble endommagé'||type==='Poteau endommagé') return 'Haute'; if (type==='Lampadaire éteint'||type==='Éclairage intermittent') return 'Moyenne'; return 'Basse'; }
export function zoneFor(location: string) { const l=location.toLocaleLowerCase('fr'); return ZONES.find(z=>l.includes(z.toLocaleLowerCase('fr'))) ?? 'Non précisée'; }
export function nextReportId(reports: Report[], year = 2026) { const max=reports.reduce((m,r)=>Math.max(m,Number(r.id.split('-')[2])||0),0); return `SIG-${year}-${String(max+1).padStart(4,'0')}`; }
export function createReport(reports: Report[], input:{citizen:string;type:string;location:string;description:string;photo?:string|undefined;lat?:number|undefined;lng?:number|undefined;accuracy?:number|undefined}, date:string): Report { const initials=input.citizen.split(' ').map(p=>p[0]??'').join('').slice(0,2).toUpperCase(); return { id:nextReportId(reports), citizen:input.citizen, initials, type:input.type, location:input.location.trim(), zone:input.lat!=null&&input.lng!=null?nearestZone(input.lat,input.lng):zoneFor(input.location), lat:input.lat, lng:input.lng, accuracy:input.accuracy, priority:priorityFor(input.type), date, status:'Nouveau', description:input.description.trim(), photo:input.photo }; }

const ZONE_CENTERS: Record<string,[number,number]> = { Akwa:[4.0511,9.7008], Bonamoussadi:[4.0950,9.7380], 'Deïdo':[4.0640,9.7080], Ndokoti:[4.0450,9.7400], 'Bonabéri':[4.0720,9.6650], Bali:[4.0430,9.6950] };
/** Zone municipale la plus proche d'un point GPS. */
export function nearestZone(lat:number,lng:number){ let best='Akwa',d=Infinity; for(const [z,[a,b]] of Object.entries(ZONE_CENTERS)){ const k=(a-lat)**2+(b-lng)**2; if(k<d){d=k;best=z;} } return best; }
