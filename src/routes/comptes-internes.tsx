import { createFileRoute } from '@tanstack/react-router';
import { InternalAccountsPage } from '@/features/auth/admin';
export const Route = createFileRoute('/comptes-internes')({
 head:()=>({meta:[{title:'Comptes internes — Rakuev'},{name:'description',content:'Création des comptes responsables et techniciens.'},{property:'og:title',content:'Comptes internes — Rakuev'},{property:'og:description',content:'Création des comptes responsables et techniciens.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:InternalAccountsPage,
});
