import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/auth/pages';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'Accueil — Rakuev'},{name:'description',content:'Signalez les pannes d’éclairage public à Douala et suivez leur traitement.'},{property:'og:title',content:'Accueil — Rakuev'},{property:'og:description',content:'Signalez les pannes d’éclairage public à Douala et suivez leur traitement.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:HomePage,
});
