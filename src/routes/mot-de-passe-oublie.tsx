import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordPage } from '@/features/auth/pages';
export const Route = createFileRoute('/mot-de-passe-oublie')({
 head:()=>({meta:[{title:'Mot de passe oublié — Rakuev'},{name:'description',content:'Récupérez l’accès à votre compte Rakuev.'},{property:'og:title',content:'Mot de passe oublié — Rakuev'},{property:'og:description',content:'Récupérez l’accès à votre compte Rakuev.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ForgotPasswordPage,
});
