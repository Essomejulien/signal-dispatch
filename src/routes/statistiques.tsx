import { createFileRoute } from '@tanstack/react-router';
import { StatisticsPage } from '@/features/service/pages';
export const Route = createFileRoute('/statistiques')({
 head:()=>({meta:[{title:'Statistiques & rapports — Rakuev'},{name:'description',content:'Analyser la répartition et la résolution des signalements d’éclairage public.'},{property:'og:title',content:'Statistiques & rapports — Rakuev'},{property:'og:description',content:'Analyser la répartition et la résolution des signalements d’éclairage public.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:StatisticsPage,
});
