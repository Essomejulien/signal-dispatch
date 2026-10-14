import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/auth/pages';
export const Route = createFileRoute('/connexion')({
 head:()=>({meta:[{title:'Connexion — Rakuev'},{name:'description',content:'Connectez-vous à votre espace Rakuev.'},{property:'og:title',content:'Connexion — Rakuev'},{property:'og:description',content:'Connectez-vous à votre espace Rakuev.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:LoginPage,
});
