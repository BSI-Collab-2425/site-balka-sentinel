import { useState } from 'react'
import styles from './Demo.module.css'

interface FormData {
  company: string
  firstName: string
  lastName: string
  email: string
  comment: string
}
interface FormErrors { [k: string]: string }

export default function Demo() {
  const [form, setForm] = useState<FormData>({ company:'', firstName:'', lastName:'', email:'', comment:'' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.company.trim())   e.company   = 'Le nom de l\'entreprise est requis'
    if (!form.firstName.trim()) e.firstName = 'Le prénom est requis'
    if (!form.lastName.trim())  e.lastName  = 'Le nom est requis'
    if (!form.email.trim())     e.email     = 'L\'adresse e-mail est requise'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse e-mail invalide'
    return e
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => { const n = {...p}; delete n[name]; return n })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1600)
  }

  if (submitted) return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className={styles.successTitle}>Demande envoyée</h2>
          <p className={styles.successDesc}>
            Merci <strong>{form.firstName} {form.lastName}</strong> — nous reviendrons vers vous
            à <strong>{form.email}</strong> dans les meilleurs délais.
          </p>
          <button className={styles.resetBtn} onClick={() => { setSubmitted(false); setForm({ company:'', firstName:'', lastName:'', email:'', comment:'' }) }}>
            Nouvelle demande
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>Demande de démonstration</div>
          <h1 className={styles.title}>Voyez <em>Sentinel</em><br />en action</h1>
          <p className={styles.desc}>Remplissez le formulaire ci-dessous — notre équipe vous contactera pour planifier une démonstration personnalisée.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Votre entreprise</div>
                <Field label="Nom de l'entreprise" id="company" name="company" value={form.company} onChange={handleChange} error={errors.company} placeholder="Acme Corp" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Vos coordonnées</div>
                <div className={styles.row2}>
                  <Field label="Prénom" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Jean" />
                  <Field label="Nom" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Dupont" />
                </div>
                <Field label="Adresse e-mail" id="email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="jean.dupont@acme.fr" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>} />
              </div>

              <div className={styles.formSection}>
                <div className={styles.formSectionTitle}>Votre besoin <span className={styles.optional}>— optionnel</span></div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="comment">Commentaire</label>
                  <textarea
                    className={styles.textarea}
                    id="comment" name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    placeholder="Décrivez votre contexte, vos besoins spécifiques, le périmètre réseau…"
                    rows={5}
                  />
                </div>
              </div>

              <div className={styles.formFooter}>
                <p className={styles.privacy}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Données traitées de façon confidentielle, jamais revendues.
                </p>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading
                    ? <><span className={styles.spinner}/>Envoi en cours…</>
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Envoyer la demande</>
                  }
                </button>
              </div>
            </form>
          </div>

          <div className={styles.aside}>
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Réponse rapide', desc: 'Notre équipe vous recontacte sous 24 h ouvrées.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Démo personnalisée', desc: 'Session adaptée à votre infrastructure et vos cas d\'usage.' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Sans engagement', desc: 'La démonstration est gratuite et ne vous engage en rien.' },
            ].map(item => (
              <div key={item.title} className={styles.asideItem}>
                <div className={styles.asideIcon}>{item.icon}</div>
                <div>
                  <div className={styles.asideTitle}>{item.title}</div>
                  <div className={styles.asideDesc}>{item.desc}</div>
                </div>
              </div>
            ))}

            <div className={styles.asideDivider} />

            <div className={styles.techStack}>
              <div className={styles.techTitle}>Technologies démontrées</div>
              {['Snort IDS', 'Wazuh SIEM', 'GLPI Ticketing', 'Raspberry Pi', 'OPENCTI'].map(t => (
                <span key={t} className={styles.techTag}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, name, type='text', value, onChange, error, placeholder, icon }: {
  label: string; id: string; name: string; type?: string
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string; placeholder?: string; icon?: React.ReactNode
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          className={`${styles.input} ${icon ? styles.inputWithIcon : ''}`}
          id={id} name={name} type={type}
          value={value} onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  )
}
