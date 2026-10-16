import { createFileRoute } from '@tanstack/react-router';
import { UnitWorkHistoryPage } from '@/features/unit/pages';
export const Route = createFileRoute('/unite/historique')({
 head:()=>({meta:[{title:'Historique des travaux — Rakuev'},{name:'description',content:'Interventions clôturées, actions et retours des techniciens.'},{property:'og:title',content:'Historique des travaux — Rakuev'},{property:'og:description',content:'Interventions clôturées, actions et retours des techniciens.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:UnitWorkHistoryPage,
});
