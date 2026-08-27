import PageTransition from "../components/PageTransition";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Histoire from "../components/Histoire";
import Carte from "../components/Carte";
import Bar from "../components/Bar";
import Galerie from "../components/Galerie";
import Avis from "../components/Avis";

export default function Home({ started }: { started: boolean }) {
  return (
    <PageTransition>
      <Hero started={started} />
      <Marquee />
      <Histoire />
      <Carte />
      <Bar />
      <Galerie />
      <Avis />
    </PageTransition>
  );
}
