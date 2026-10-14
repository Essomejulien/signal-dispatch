import type React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialReports, initialHistory, canDecide, decideReport, createReport, type Report, type HistoryEntry } from './data';
// Démonstration : signalements conservés dans le navigateur (partagés entre citoyen et chef de service). À remplacer par l'API.
type NewReport = { citizen: string; type: string; location: string; description: string; photo?: string | undefined; lat?: number | undefined; lng?: number | undefined; accuracy?: number | undefined };
interface Store { reports: Report[]; history: HistoryEntry[]; decide: (id: string,status:'Validé'|'Rejeté',comment:string)=>void; addReport:(r:NewReport)=>Report; profile: {name:string;email:string}; saveProfile:(name:string,email:string)=>void; signedOut:boolean; setSignedOut:(value:boolean)=>void }
// Keep one context instance across hot reloads so providers and consumers always match.
const g=globalThis as unknown as {__rakuevServiceCtx?: React.Context<Store | null>};
const Context=g.__rakuevServiceCtx ??= createContext<Store | null>(null);
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ } };
export function ServiceProvider({children}:{children:ReactNode}) { const [reports,setReports]=useState<Report[]>(initialReports); const [history,setHistory]=useState<HistoryEntry[]>(initialHistory); const [ready,setReady]=useState(false); const [profile,setProfile]=useState({name:'Alain Kouamé',email:'alain.kouame@ville-douala.cm'}); const [signedOut,setSignedOut]=useState(false);
useEffect(()=>{ setReports(load('eclaire.reports',initialReports)); setHistory(load('eclaire.history',initialHistory)); setReady(true);
  const onStorage=(e:StorageEvent)=>{ if(e.key==='eclaire.reports') setReports(load('eclaire.reports',initialReports)); if(e.key==='eclaire.history') setHistory(load('eclaire.history',initialHistory)); };
  window.addEventListener('storage',onStorage); return ()=>window.removeEventListener('storage',onStorage); },[]);
useEffect(()=>{ if(ready) save('eclaire.reports',reports); },[reports,ready]);
useEffect(()=>{ if(ready) save('eclaire.history',history); },[history,ready]);
function decide(id:string,status:'Validé'|'Rejeté',comment:string) { const report=reports.find(r=>r.id===id); if (!report || !canDecide(report)) return; const date=new Date().toISOString(); setReports(prev=>prev.map(r=>r.id===id?decideReport(r,status,comment,date):r)); setHistory(prev=>[{id:`h-${Date.now()}`,reportId:id,action:status==='Validé'?'Signalement validé':'Signalement rejeté',comment,date},...prev]); }
function addReport(input:NewReport) { const date=new Date().toISOString(); const r=createReport(reports,input,date); setReports(prev=>[r,...prev]); setHistory(prev=>[{id:`h-${Date.now()}`,reportId:r.id,action:'Signalement créé',comment:`Envoyé par ${r.citizen}.`,date},...prev]); return r; }
return <Context.Provider value={{reports,history,decide,addReport,profile,saveProfile:(name,email)=>setProfile({name,email}),signedOut,setSignedOut}}>{children}</Context.Provider>;
}
export function useService() { const value=useContext(Context); if (!value) throw new Error('ServiceProvider required'); return value; }
