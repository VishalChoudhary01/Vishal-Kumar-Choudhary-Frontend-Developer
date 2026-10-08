import HomePage from "./components/HomePage";
import JsonLd from "./components/seo/JsonLd";
import { buildHomeMetadata, buildHomeJsonLd } from "./lib/seo/metadata";
import { portfolio } from "./data/portfolio";

/*
 * Homepage — server component (spec §2).
 *
 * Owns head metadata (canonical, Open Graph, Twitter/X) and the
 * server-rendered JSON-LD graph (WebSite → ProfilePage → Person),
 * guaranteed present in the initial HTML regardless of the client
 * loader. The visible UI lives in components/HomePage.js.
 */
export const metadata = buildHomeMetadata();

export default function Home() {
  const jsonLd = buildHomeJsonLd(portfolio.socialLinks);

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <HomePage />
    </>
  );
}
