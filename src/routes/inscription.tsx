import { createFileRoute } from '@tanstack/react-router';
import { RegisterPage } from '@/features/auth/pages';
export const Route = createFileRoute('/inscription')({
 head:()=>({meta:[{title:'Inscription citoyen — Rakuev'},{name:'description',content:'Créez votre compte citoyen pour signaler une panne d’éclairage.'},{property:'og:title',content:'Inscription citoyen — Rakuev'},{property:'og:description',content:'Créez votre compte citoyen pour signaler une panne d’éclairage.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:RegisterPage,
});
