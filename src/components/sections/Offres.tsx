import styles from './Offres.module.css'

const offres = [
  {
    tag: 'Balka-Essentiel',
    price: '—',
    accent: 'terra',
    desc: 'La solution d\'entrée pour démarrer votre supervision réseau avec Raspberry Pi.',
    features: ['Pack Raspberry Pi inclus', 'Détection d\'alertes en temps réel', 'Dashboard de supervision', 'Assistance support', 'Configuration initiale'],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    tag: 'Balka-Plus',
    price: '—',
    accent: 'ink',
    desc: 'Solution complète avec mini PC haute performance pour une infrastructure avancée.',
    features: ['Mini PC haute performance inclus', 'Collecte de logs centralisée', 'Détection d\'alertes avancée', 'Assistance prioritaire 24/7', 'Audit de sécurité','Mise à jour régulière'],
    cta: 'Choisir ce plan',
    highlighted: true,
  },
]

export default function Offres() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>Nos offres</div>
          <h1 className={styles.title}>Un plan pour <em>chaque besoin</em></h1>
          <p className={styles.desc}>Des tarifs transparents, sans surprise. Choisissez le niveau de protection adapté à votre infrastructure.</p>
        </div>

        <div className={styles.grid}>
          {offres.map(o => (
            <div key={o.tag} className={`${styles.card} ${o.highlighted ? styles.cardHighlighted : ''}`}>
              {o.highlighted && <div className={styles.popularBadge}>Le plus choisi</div>}
              <div className={styles.cardTop}>
                <span className={`${styles.tag} ${styles[`tag_${o.accent}`]}`}>{o.tag}</span>
                <div className={styles.price}>{o.price}</div>
                <p className={styles.cardDesc}>{o.desc}</p>
              </div>
              <ul className={styles.features}>
                {o.features.map(f => (
                  <li key={f} className={styles.feature}>
                    <span className={`${styles.check} ${styles[`check_${o.accent}`]}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`${styles.cta} ${o.highlighted ? styles.ctaHighlighted : styles[`ctaOutline_${o.accent}`]}`}>
                {o.cta}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className={styles.faq}>
          <div className={styles.faqTitle}>Questions fréquentes</div>
          <div className={styles.faqGrid}>
            {[
              { q:'Puis-je changer de plan à tout moment ?', a:'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre espace client.' },
              { q:'Faut-il un engagement minimum ?', a:'Aucun engagement. Les plans sont mensuels et résiliables à tout moment sans frais.' },
              { q:'Le support inclut-il la configuration initiale ?', a:'Oui, chaque plan inclut une session d\'onboarding pour vous aider à configurer votre environnement.' },
              { q:'Les données restent-elles sur nos serveurs ?', a:'Absolument. Sentinel est conçu pour fonctionner on-premise. Vos données ne quittent jamais votre infrastructure.' },
            ].map(item => (
              <div key={item.q} className={styles.faqItem}>
                <div className={styles.faqQ}>{item.q}</div>
                <div className={styles.faqA}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
