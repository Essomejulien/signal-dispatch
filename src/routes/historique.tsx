import { createFileRoute } from '@tanstack/react-router';
import { HistoryPage } from '@/features/service/pages';
export const Route = createFileRoute('/historique')({
 head:()=>({meta:[{title:'Historique des actions — Rakuev'},{name:'description',content:'Consulter la traçabilité des décisions du Chef de Service.'},{property:'og:title',content:'Historique des actions — Rakuev'},{property:'og:description',content:'Consulter la traçabilité des décisions du Chef de Service.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:HistoryPage,
});
