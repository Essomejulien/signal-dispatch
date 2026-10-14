import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/features/service/reports';
export const Route = createFileRoute('/signalements')({
 head:()=>({meta:[{title:'Gestion des signalements — Rakuev'},{name:'description',content:'Rechercher, consulter, valider et rejeter les signalements d’éclairage public.'},{property:'og:title',content:'Gestion des signalements — Rakuev'},{property:'og:description',content:'Rechercher, consulter, valider et rejeter les signalements d’éclairage public.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ReportsPage,
});
