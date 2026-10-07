import { useState } from "react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import { sendContact } from "../api/client";
import { useReservation } from "../reservations/context";
import facade from "../assets/photos/facade-jour.jpg";
import "./ContactPage.css";

const TOPICS = [
  { id: "grande-table", label: "Grande table" },
  { id: "reservation", label: "Réservation" },
  { id: "particulier", label: "Demande particulière" },
] as const;

type Draft = {
  topic: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  website: string;
};

const empty: Draft = {
  topic: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};

export default function ContactPage() {
  const { open } = useReservation();
  const [draft, setDraft] = useState<Draft>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendContact(draft);
      setDone(true);
      setDraft(empty);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le message n’a pas pu partir.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <div className="contact-page">
        <PageHeader
          kicker="Écrire au quai"
          title="Contact"
          intro="Grande table, privatisation, allergie ou question : laissez-nous un mot, on vous répond depuis le 20 Quai de l’Océan."
        />

        <div className="container contact-layout">
          <motion.div
            className="contact-form-wrap"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            {done ? (
              <div className="contact-success">
                <p className="script">C’est noté</p>
                <p>
                  Votre message a rejoint le quai. L’équipe de La Marine vous
                  répond dès que possible.
                </p>
                <button type="button" className="contact-submit" onClick={() => setDone(false)}>
                  Écrire un autre mot
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit}>
                <fieldset className="contact-topics">
                  <legend>Objet</legend>
                  <div>
                    {TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        className={draft.topic === topic.id ? "is-on" : ""}
                        onClick={() => setDraft((prev) => ({ ...prev, topic: topic.id }))}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label>
                  <span>Nom</span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    autoComplete="name"
                  />
                </label>
                <label>
                  <span>Téléphone</span>
                  <input
                    value={draft.phone}
                    onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </label>
                <label>
                  <span>E-mail</span>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Votre message</span>
                  <textarea
                    rows={5}
                    value={draft.message}
                    onChange={(e) => setDraft((prev) => ({ ...prev, message: e.target.value }))}
                    required
                    minLength={10}
                    maxLength={2500}
                    placeholder="Date souhaitée, nombre de couverts, allergie, privatisation…"
                  />
                </label>
                <label className="contact-hp" aria-hidden>
                  Site web
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={draft.website}
                    onChange={(e) => setDraft((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </label>

                {error && <p className="contact-error">{error}</p>}

                <button type="submit" className="contact-submit" disabled={busy || !draft.topic}>
                  {busy ? "Envoi…" : "Envoyer le message"}
                </button>
              </form>
            )}
          </motion.div>

          <motion.aside
            className="contact-aside"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <figure className="contact-photo">
              <img src={facade} alt="La façade de La Marine, quai de l’Océan" />
            </figure>
            <div className="contact-infos">
              <div>
                <h3>Adresse</h3>
                <p>
                  20 Quai de l’Océan
                  <br />
                  Port Maria — 56170 Quiberon
                </p>
              </div>
              <div>
                <h3>Téléphone</h3>
                <p>
                  <a href="tel:0297500981">02 97 50 09 81</a>
                </p>
              </div>
              <div>
                <h3>Horaires</h3>
                <p>
                  Midi — jusqu’à 15h00
                  <br />
                  Soir — dès 18h00
                </p>
              </div>
            </div>
            <p className="contact-aside-note">
              Pour une table dans la journée, le plus simple est encore de{" "}
              <button type="button" onClick={open}>
                réserver en ligne
              </button>{" "}
              ou de nous appeler.
            </p>
          </motion.aside>
        </div>
      </div>
    </PageTransition>
  );
}
