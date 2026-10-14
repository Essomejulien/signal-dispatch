import { createFileRoute } from '@tanstack/react-router';
import { CitizenReportPage } from '@/features/citizen/report-page';
export const Route = createFileRoute('/signaler')({
 head:()=>({meta:[{title:'Signaler une panne — Rakuev'},{name:'description',content:'Signalez un lampadaire éteint ou endommagé à Douala, avec photo.'},{property:'og:title',content:'Signaler une panne — Rakuev'},{property:'og:description',content:'Signalez un lampadaire éteint ou endommagé à Douala, avec photo.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:CitizenReportPage,
});
