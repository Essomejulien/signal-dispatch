import { createFileRoute } from '@tanstack/react-router';
import { UnitTechniciansPage } from '@/features/unit/pages';
export const Route = createFileRoute('/unite/techniciens')({
 head:()=>({meta:[{title:'Techniciens — Rakuev'},{name:'description',content:'Spécialités et disponibilité des équipes techniques.'},{property:'og:title',content:'Techniciens — Rakuev'},{property:'og:description',content:'Spécialités et disponibilité des équipes techniques.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
 component:UnitTechniciansPage,
});
