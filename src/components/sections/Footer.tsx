import React from 'react';
import styles from './Footer.module.css';
import DataProtection from './DataProtection';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Colonne brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>Balka-sentinel</div>
            <p className={styles.tagline}>
              Une solution pensée pour simplifier votre quotidien.
            </p>
          </div>

          {/* Colonne navigation */}
          <div className={styles.col}>
            <span className={styles.colTitle}>Navigation</span>
            <ul className={styles.linkList}>
              <li><a href="#" className={styles.link}>Accueil</a></li>
              <li><a href="#" className={styles.link}>Offres</a></li>
              <li><a href="#" className={styles.link}>Démo</a></li>
              <li><a href="#" className={styles.link}>Newsletter</a></li>
            </ul>
          </div>

          {/* Colonne légal */}
          <div className={styles.col}>
            <span className={styles.colTitle}>Légal</span>
            <ul className={styles.linkList}>
              <li><a href="#" className={styles.link}>Mentions légales</a></li>
              <li><a href="#" className={styles.link}>CGU</a></li>
              <li><a href="#" className={styles.link}>Politique de confidentialité</a></li>
              <li><a href="#" className={styles.link}>Cookies</a></li>
            </ul>
          </div>

          {/* Colonne contact */}
          <div className={styles.col}>
            <span className={styles.colTitle}>Contact</span>
            <ul className={styles.linkList}>
              <li><a href="mailto:" className={styles.link}>balka-sentinel@proton.me</a></li>
              <li><a href="#" className={styles.link}>Support</a></li>
            </ul>
          </div>

        </div>

        {/* Séparateur */}
        <div className={styles.divider} />

        {/* Section protection des données */}
        <DataProtection />

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <span className={styles.copy}>© {new Date().getFullYear()} Balka-sentinel — Tous droits réservés</span>
          <span className={styles.rgpd}>🇪🇺 Conforme RGPD</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;