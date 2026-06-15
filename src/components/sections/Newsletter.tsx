import { useState } from 'react'
import styles from './Newsletter.module.css'

interface Article {
  tag: string
  tagAccent: string
  date: string
  title: string
  excerpt: string
  readTime: string
}

const articles: Article[] = [
  {
    tag: 'Détection', tagAccent: 'terra',
    date: '12 jan. 2025', readTime: '5 min',
    title: 'Comment Snort détecte les scans Nmap en temps réel',
    excerpt: 'Analyse des règles SID 1418 et 1421, et comment les affiner pour réduire les faux positifs dans un environnement de production.',
  },
  {
    tag: 'Ticketing', tagAccent: 'olive',
    date: '3 jan. 2025', readTime: '4 min',
    title: 'Automatiser la création de tickets GLPI depuis Wazuh',
    excerpt: 'Mise en place d\'un pipeline d\'alertes → tickets avec gestion des priorités et assignation automatique au SOC.',
  },
  {
    tag: 'Architecture', tagAccent: 'gold',
    date: '27 déc. 2024', readTime: '8 min',
    title: 'Raspberry Pi comme sonde IDS : bilan après 6 mois',
    excerpt: 'Retour d\'expérience sur l\'utilisation d\'un Raspberry Pi 4 comme capteur réseau passif avec port SPAN et Snort.',
  },
  {
    tag: 'Sécurité', tagAccent: 'rust',
    date: '20 déc. 2024', readTime: '6 min',
    title: 'Brute force SSH : détection et contre-mesures',
    excerpt: 'Les attaquants frappent en rafales. Découvrez comment identifier les patterns et bloquer automatiquement les sources malveillantes.',
  },
  {
    tag: 'Guide', tagAccent: 'denim',
    date: '15 déc. 2024', readTime: '10 min',
    title: 'Construire un SOC maison avec des outils open source',
    excerpt: 'De zéro à un SOC fonctionnel : Snort + Wazuh + GLPI + pfSense, pour moins de 200 € de matériel.',
  },
]



export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Veuillez entrer votre adresse e-mail.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Adresse e-mail invalide.'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubscribed(true) }, 1200)
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Hero subscribe block ── */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>Newsletter</div>
            <h1 className={styles.title}>Restez à la <em>pointe</em> de la cybersécurité</h1>
            <p className={styles.desc}>
              Deux fois par mois, recevez des analyses techniques, des tutoriels pratiques
              et les dernières actualités sur la détection d'intrusion et la supervision réseau.
            </p>
          </div>

          <div className={styles.heroRight}>
            {subscribed ? (
              <div className={styles.successBox}>
                <div className={styles.successIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className={styles.successTitle}>Vous êtes abonné·e !</div>
                <div className={styles.successDesc}>Bienvenue dans la communauté Sentinel. Vérifiez votre boîte mail pour confirmer votre inscription.</div>
                <button className={styles.resetLink} onClick={() => { setSubscribed(false); setEmail('') }}>
                  S'inscrire avec une autre adresse
                </button>
              </div>
            ) : (
              <div className={styles.subscribeCard}>
                <div className={styles.cardLabel}>Inscription gratuite</div>
                <p className={styles.cardHint}>Pas de spam. Désabonnement en un clic. Contenu 100 % technique.</p>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
                    <span className={styles.inputIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                    <input
                      className={styles.input}
                      type="email" placeholder="votre@email.com"
                      value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                      autoComplete="email"
                    />
                  </div>
                  {error && <div className={styles.errorMsg}>{error}</div>}
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading
                      ? <><span className={styles.spinner}/>Inscription…</>
                      : <>S'abonner gratuitement
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </>
                    }
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── Articles ── */}
        <div className={styles.articlesSection}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>Dernières <em>éditions</em></div>
            <div className={styles.sectionSub}>Un aperçu de ce qui vous attend</div>
          </div>
          <div className={styles.articlesGrid}>
            {articles.map(a => (
              <article key={a.title} className={styles.articleCard}>
                <div className={styles.articleMeta}>
                  <span className={`${styles.articleTag} ${styles[`tag_${a.tagAccent}`]}`}>{a.tag}</span>
                  <span className={styles.articleDate}>{a.date}</span>
                  <span className={styles.readTime}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {a.readTime}
                  </span>
                </div>
                <h3 className={styles.articleTitle}>{a.title}</h3>
                <p className={styles.articleExcerpt}>{a.excerpt}</p>
                <button className={styles.readMore}>
                  Lire l'édition
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </article>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className={styles.bottomCta}>
          <div className={styles.bottomCtaInner}>
            <div className={styles.bottomCtaText}>
              <div className={styles.bottomCtaTitle}>Prêt à sécuriser votre infrastructure ?</div>
              <div className={styles.bottomCtaDesc}>Rejoignez des centaines de professionnels qui font confiance à Sentinel.</div>
            </div>
            <div className={styles.bottomCtaBtns}>
              <button className={styles.btnPrimary}>
                Demander une démo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button className={styles.btnSecondary}>Voir les offres</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
