import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/features/service/pages';
export const Route = createFileRoute('/profil')({
 head:()=>({meta:[{title:'Mon profil — Rakuev'},{name:'description',content:'Informations du Chef de Service de l’éclairage public de Douala.'},{property:'og:title',content:'Mon profil — Rakuev'},{property:'og:description',content:'Informations du Chef de Service de l’éclairage public de Douala.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ProfilePage,
});
