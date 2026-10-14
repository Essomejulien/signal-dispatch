import { createFileRoute } from '@tanstack/react-router';
import { GisMapPage } from '@/features/service/gis-map';
export const Route = createFileRoute('/carte-sig')({
  head: () => ({
    meta: [{ title: 'Carte SIG — Rakuev' }, { name: 'description', content: 'Localiser en temps réel les lampadaires fonctionnels, défectueux et signalés à Douala.' }, { property: 'og:title', content: 'Carte SIG — Rakuev' }, { property: 'og:description', content: 'Localiser en temps réel les lampadaires fonctionnels, défectueux et signalés à Douala.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }],
    links: [{ rel: 'stylesheet', href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' }],
  }),
  component: GisMapPage,
});
