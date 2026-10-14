import { createFileRoute } from '@tanstack/react-router';
import { UnitReportsPage } from '@/features/unit/pages';
export const Route = createFileRoute('/unite/signalements')({
 head:()=>({meta:[{title:'Signalements reçus — Rakuev'},{name:'description',content:'Signalements transmis par le chef de service.'},{property:'og:title',content:'Signalements reçus — Rakuev'},{property:'og:description',content:'Signalements transmis par le chef de service.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:UnitReportsPage,
});
