import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import "./MentionsPage.css";

const sections = [
  {
    title: "Éditeur du site",
    body: (
      <>
        <p>
          Le présent site est édité par la <strong>SARL LE RUYET</strong>,
          exploitant l’enseigne <strong>La Marine</strong>, bistrot · restaurant
          · bar, plus vieux restaurant de Quiberon.
        </p>
        <ul>
          <li>
            <span>Enseigne</span> La Marine
          </li>
          <li>
            <span>Raison sociale</span> SARL LE RUYET
          </li>
          <li>
            <span>Adresse</span> 20 Quai de l’Océan — Port Maria
            <br />
            56170 Quiberon
          </li>
          <li>
            <span>Téléphone</span>{" "}
            <a href="tel:0297500981">02 97 50 09 81</a>
          </li>
          <li>
            <span>E-mail</span>{" "}
            <a href="mailto:lamarine1712@gmail.com">lamarine1712@gmail.com</a>
          </li>
          <li>
            <span>SIRET</span> 823 957 279 00016
          </li>
          <li>
            <span>RCS</span> Lorient 823 957 279
          </li>
          <li>
            <span>Capital</span> 5 000 €
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Directeur de la publication",
    body: (
      <p>
        David Le Ruyet, gérant de la SARL LE RUYET.
      </p>
    ),
  },
  {
    title: "Hébergement",
    body: (
      <>
        <p>Le site est hébergé par :</p>
        <ul>
          <li>
            <span>Société</span> Railway Corporation
          </li>
          <li>
            <span>Adresse</span> 548 Market St, PMB 68956
            <br />
            San Francisco, CA 94104 — États-Unis
          </li>
          <li>
            <span>Site</span>{" "}
            <a href="https://railway.com" target="_blank" rel="noreferrer">
              railway.com
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Conception",
    body: (
      <p>
        Conception et développement : Maxime Farineau, développeur web —
        6 rue du Puits, 56550 Locoal-Mendon —
        {" "}
        <a href="mailto:Contact@maximefarineau.com">Contact@maximefarineau.com</a>
        .
      </p>
    ),
  },
  {
    title: "Propriété intellectuelle",
    body: (
      <p>
        L’ensemble du site (textes, photographies, graphisme, logo, structure) est
        protégé. Toute reproduction, même partielle, est interdite sans
        l’autorisation écrite de La Marine, sauf usage privé et copies destinées
        à un usage strictement personnel.
      </p>
    ),
  },
  {
    title: "Données personnelles",
    body: (
      <>
        <p>
          Les informations recueillies via le module de réservation et le
          formulaire de contact (nom, téléphone, e-mail, message) sont destinées
          uniquement à La Marine, pour répondre à votre demande ou retenir une
          table. Elles ne sont ni vendues ni cédées à des tiers.
        </p>
        <p>
          Les réservations sont conservées jusqu’à un mois après la date du
          repas, puis supprimées. Conformément au RGPD, vous pouvez demander
          l’accès, la rectification ou l’effacement de vos données en écrivant à{" "}
          <a href="mailto:lamarine1712@gmail.com">lamarine1712@gmail.com</a> ou
          via la page <Link to="/contact">Contact</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        Le site n’utilise pas de cookies publicitaires ni de traceurs de mesure
        d’audience. Un cookie de session, strictement technique, est déposé
        uniquement lorsque le restaurateur se connecte à l’espace d’administration.
      </p>
    ),
  },
];

export default function MentionsPage() {
  return (
    <PageTransition>
      <div className="mentions-page">
        <PageHeader
          kicker="Informations légales"
          title="Mentions"
          intro="Les informations prévues par la loi, pour que tout soit clair entre le quai et vous."
        />

        <div className="container mentions-list">
          {sections.map((section, i) => (
            <motion.article
              key={section.title}
              className="mentions-block"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ delay: i * 0.04, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.body}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
