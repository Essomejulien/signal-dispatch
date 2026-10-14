import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/features/service/dashboard';
export const Route = createFileRoute('/tableau-de-bord')({
 head:()=>({meta:[{title:'Tableau de bord — Rakuev'},{name:'description',content:'Vue d’ensemble des signalements citoyens et des interventions d’éclairage public à Douala.'},{property:'og:title',content:'Tableau de bord — Rakuev'},{property:'og:description',content:'Vue d’ensemble des signalements citoyens et des interventions d’éclairage public à Douala.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:DashboardPage,
});
