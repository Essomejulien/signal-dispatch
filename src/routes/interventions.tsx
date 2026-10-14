import { createFileRoute } from '@tanstack/react-router';
import { InterventionsPage } from '@/features/service/pages';
export const Route = createFileRoute('/interventions')({
 head:()=>({meta:[{title:'Interventions — Rakuev'},{name:'description',content:'Suivre les interventions en cours et les travaux terminés à Douala.'},{property:'og:title',content:'Interventions — Rakuev'},{property:'og:description',content:'Suivre les interventions en cours et les travaux terminés à Douala.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:InterventionsPage,
});
