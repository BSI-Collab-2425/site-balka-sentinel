import React, { useState } from 'react';
import styles from './DeleteAccountForm.module.css';

interface Props {
  onCancel?: () => void;
}

type Reason =
  | ''
  | 'no_longer_needed'
  | 'privacy_concerns'
  | 'switching_service'
  | 'technical_issues'
  | 'other';

interface FormState {
  email: string;
  reason: Reason;
  details: string;
  confirm: boolean;
}

const REASONS: { value: Reason; label: string }[] = [
  { value: 'no_longer_needed', label: "Je n'utilise plus le service" },
  { value: 'privacy_concerns', label: 'Préoccupations liées à la vie privée' },
  { value: 'switching_service', label: 'Je passe à un autre service' },
  { value: 'technical_issues', label: 'Problèmes techniques récurrents' },
  { value: 'other', label: 'Autre raison' },
];

const DeleteAccountForm: React.FC<Props> = ({ onCancel }) => {
  const [form, setForm] = useState<FormState>({
    email: '',
    reason: '',
    details: '',
    confirm: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid =
    form.email.includes('@') &&
    form.reason !== '' &&
    form.confirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h4 className={styles.successTitle}>Demande enregistrée</h4>
        <p className={styles.successDesc}>
          Votre demande de suppression a bien été transmise à notre équipe.
          Vous recevrez une confirmation à <strong>{form.email}</strong> sous 48h.
          La suppression effective interviendra sous <strong>30 jours</strong>.
        </p>
        <div className={styles.successRef}>
          <span className={styles.refLabel}>Référence</span>
          <span className={styles.refValue}>DEL-{Date.now().toString(36).toUpperCase()}</span>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHead}>
        <h4 className={styles.formTitle}>Demande de <em>suppression</em></h4>
        <p className={styles.formSub}>
          Cette action est irréversible. Toutes vos données personnelles seront définitivement effacées.
        </p>
      </div>

      <div className={styles.fields}>

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="del-email">
            Adresse e-mail associée au compte
          </label>
          <input
            id="del-email"
            type="email"
            className={styles.input}
            placeholder="vous@exemple.fr"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
        </div>

        {/* Raison */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="del-reason">
            Motif de la demande
          </label>
          <select
            id="del-reason"
            className={styles.select}
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value as Reason }))}
          >
            <option value="">— Sélectionner un motif —</option>
            {REASONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Détails optionnels */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="del-details">
            Précisions <span className={styles.optional}>(optionnel)</span>
          </label>
          <textarea
            id="del-details"
            className={styles.textarea}
            placeholder="Partagez des détails supplémentaires si vous le souhaitez…"
            rows={3}
            value={form.details}
            onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
          />
        </div>

        {/* Confirmation */}
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.checked }))}
          />
          <span className={styles.checkLabel}>
            Je comprends que cette action est <strong>irréversible</strong> et que toutes mes données seront définitivement supprimées sous 30 jours.
          </span>
        </label>

      </div>

      {/* Actions */}
      <div className={styles.formActions}>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Annuler
          </button>
        )}
        <button
          type="submit"
          className={`${styles.submitBtn} ${!isValid ? styles.submitDisabled : ''}`}
          disabled={!isValid || loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Envoi en cours…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              </svg>
              Confirmer la suppression
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default DeleteAccountForm;