import React, { useState } from 'react';
import styles from './DataProtection.module.css';
import DeleteAccountForm from './DeleteAccountForm';

const items = [
  {text: 'Vos données sont chiffrées et hébergées en Europe (RGPD)' },
  {text: 'Elles ne sont jamais revendues ni partagées avec des tiers' },
  {text: 'Droit d\'accès, de rectification et de portabilité garanti' },
  {text: 'Suppression définitive sous 30 jours sur simple demande' },
];

const DataProtection: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>Protection des données</span>
          <h3 className={styles.title}>Vos données vous <em>appartiennent</em></h3>
          <p className={styles.desc}>
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            nous nous engageons à traiter vos informations personnelles avec la plus grande transparence.
          </p>
        </div>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>🇪🇺</span>
          <span className={styles.badgeText}>RGPD</span>
          <span className={styles.badgeSub}>Conforme</span>
        </div>
      </div>

      <ul className={styles.list}>
        {items.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.itemText}>{item.text}</span>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${open ? styles.btnActive : ''}`}
          onClick={() => setOpen(!open)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          {open ? 'Annuler la demande' : 'Demander la suppression de mes données'}
        </button>
        <a href="#" className={styles.policyLink}>Lire notre politique de confidentialité →</a>
      </div>

      {open && (
        <div className={styles.formWrapper}>
          <DeleteAccountForm onCancel={() => setOpen(false)} />
        </div>
      )}
    </section>
  );
};

export default DataProtection;