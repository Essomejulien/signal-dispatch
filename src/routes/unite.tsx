import { createFileRoute } from '@tanstack/react-router';
import { UnitDashboard } from '@/features/unit/pages';
export const Route = createFileRoute('/unite')({
 head:()=>({meta:[{title:'Espace chef d’unité — Rakuev'},{name:'description',content:'Prise en charge des signalements transmis et organisation des interventions.'},{property:'og:title',content:'Espace chef d’unité — Rakuev'},{property:'og:description',content:'Prise en charge des signalements transmis et organisation des interventions.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:UnitDashboard,
});
