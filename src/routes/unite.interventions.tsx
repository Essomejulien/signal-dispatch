import { createFileRoute } from '@tanstack/react-router';
import { UnitInterventionsPage } from '@/features/unit/pages';
export const Route = createFileRoute('/unite/interventions')({
 head:()=>({meta:[{title:'Suivi des interventions — Rakuev'},{name:'description',content:'Avancement et retours des techniciens.'},{property:'og:title',content:'Suivi des interventions — Rakuev'},{property:'og:description',content:'Avancement et retours des techniciens.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:UnitInterventionsPage,
});
