import { useState } from 'react'
import type { Section } from '../App'
import styles from './Navbar.module.css'

interface Props {
  active: Section
  onNavigate: (s: Section) => void
}

const links: { id: Section; label: string }[] = [
  { id: 'presentation', label: 'Présentation' },
  { id: 'demo',        label: 'Démo' },
  { id: 'offres',      label: 'Offres' },
  { id: 'newsletter',  label: 'Newsletter' },
]

export default function Navbar({ active, onNavigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1
    setLogoClicks(newClicks)
    
    if (newClicks === 7) {
      setShowEasterEgg(true)
      setLogoClicks(0)
    }
    
    onNavigate('presentation')
  }

  const closeEasterEgg = () => {
    setShowEasterEgg(false)
  }

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          {/* Logo */}
          <button className={styles.logo} onClick={handleLogoClick}>
            <span className={styles.logoText}>Balka-sentinel</span>
          </button>

          {/* Desktop links */}
          <div className={styles.links}>
            {links.map(l => (
              <button
                key={l.id}
                className={`${styles.link} ${active === l.id ? styles.linkActive : ''}`}
                onClick={() => onNavigate(l.id)}
              >
                {l.label}
                {active === l.id && <span className={styles.linkDot} />}
              </button>
            ))}
          </div>

          {/* Status + CTA */}
          <div className={styles.right}>
            <div className={styles.statusPill}>
              <span className={styles.dot} />
              Système opérationnel
            </div>
            <button className={styles.cta} onClick={() => onNavigate('demo')}>
              Demander une démo
            </button>
            {/* Mobile burger */}
            <button className={styles.burger} onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu">
              <span className={menuOpen ? styles.burgerLineOpen1 : styles.burgerLine} />
              <span className={menuOpen ? styles.burgerLineOpen2 : styles.burgerLine} />
              <span className={menuOpen ? styles.burgerLineOpen3 : styles.burgerLine} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            {links.map(l => (
              <button key={l.id}
                className={`${styles.mobileLink} ${active === l.id ? styles.mobileLinkActive : ''}`}
                onClick={() => { onNavigate(l.id); setMenuOpen(false) }}>
                {l.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div className={styles.easterEggOverlay} onClick={closeEasterEgg}>
          <div className={styles.easterEggModal} onClick={e => e.stopPropagation()}>
            <button className={styles.easterEggClose} onClick={closeEasterEgg}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img src="/balkany.jpg" alt="Easter Egg" className={styles.easterEggImage} />
          </div>
        </div>
      )}
    </>
  )
}
