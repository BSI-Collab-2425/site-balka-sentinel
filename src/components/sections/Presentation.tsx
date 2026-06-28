import { useState, useEffect, useRef } from 'react'
import styles from './Presentation.module.css'

type NodeState = 'idle' | 'active' | 'warning' | 'alert'
type LogLevel  = 'info' | 'success' | 'warning' | 'danger'
type StepState = '' | 'active' | 'done'
type AttackKey = 'portscan' | 'bruteforce' | 'ddos' | 'sqli'

interface LogEntry   { id: number; time: string; msg: string; level: LogLevel }
interface GlpiTicket { id: number; title: string; status: 'new'|'assigned'|'progress'|'closed'; priority: { class: string; label: string }; category: string; date: string; assignee: string }
interface WazuhEvent { id: number; ts: string; level: number; title: string; details: string; firedTimes: number }
interface AttackScenario { name: string; snortLogs: { msg: string; level: LogLevel }[]; nodeState: NodeState; wazuhLevel: number; wazuhTitle: string; wazuhDetails: string; glpiTitle: string; glpiPriority: { class: string; label: string }; glpiCategory: string }

const attacks: Record<AttackKey, AttackScenario> = {
  portscan: {
    name: 'Scan de ports',
    snortLogs: [
      { msg: '[1:1418:11] Nmap SYN Scan detected', level: 'warning' },
      { msg: '[1:469:3] ICMP PING NMAP — 192.168.1.10 → 192.168.1.20', level: 'warning' },
      { msg: '[1:1421:3] TCP Port Sweep — 254 ports en 2s', level: 'danger' },
      { msg: 'Priority 2 — TCP src=192.168.1.10:4444 dst=192.168.1.20', level: 'danger' },
    ],
    nodeState: 'warning', wazuhLevel: 8,
    wazuhTitle: 'Port scan détecté (Nmap)', wazuhDetails: 'Attempted Information Leak',
    glpiTitle: 'Scan de ports détecté — 192.168.1.10',
    glpiPriority: { class: 'high', label: 'Haute' }, glpiCategory: 'Reconnaissance',
  },
  bruteforce: {
    name: 'Brute force SSH',
    snortLogs: [
      { msg: '[1:2101201:4] GPL SSH CRC32 Overflow — 192.168.1.10 → :22', level: 'danger' },
      { msg: '[1:2001219:20] ET SCAN Potential SSH Scan', level: 'danger' },
      { msg: '47 tentatives SSH en 10s depuis 192.168.1.10', level: 'danger' },
      { msg: '[1:2003068:5] ET POLICY SSH session in progress', level: 'warning' },
    ],
    nodeState: 'alert', wazuhLevel: 12,
    wazuhTitle: 'SSH Brute Force Attack', wazuhDetails: 'Attempted Administrator Privilege Gain',
    glpiTitle: 'Brute force SSH — 47 tentatives',
    glpiPriority: { class: 'critical', label: 'Critique' }, glpiCategory: 'Accès',
  },
  ddos: {
    name: 'Attaque DDoS',
    snortLogs: [
      { msg: '[1:1000001:1] Possible DDoS — flood SYN détecté', level: 'danger' },
      { msg: 'Flood UDP — 12 000 pps depuis 192.168.1.10', level: 'danger' },
      { msg: '[1:254:2] DDOS Stacheldraht agent detected', level: 'danger' },
      { msg: 'Seuil bande passante dépassé — 980 Mb/s', level: 'danger' },
    ],
    nodeState: 'alert', wazuhLevel: 14,
    wazuhTitle: 'DDoS Flood Detected', wazuhDetails: 'Denial of Service Attack',
    glpiTitle: 'Attaque DDoS — saturation réseau',
    glpiPriority: { class: 'critical', label: 'Critique' }, glpiCategory: 'Disponibilité',
  },
  sqli: {
    name: 'Injection SQL',
    snortLogs: [
      { msg: "[1:9099:2] SQL Injection attempt — UNION SELECT", level: 'danger' },
      { msg: "[1:9100:1] XSS attempt — <script> tag detected", level: 'warning' },
      { msg: "HTTP 200 — payload: ' OR '1'='1", level: 'danger' },
      { msg: 'WAF rule triggered — SQLi pattern matched', level: 'danger' },
    ],
    nodeState: 'warning', wazuhLevel: 10,
    wazuhTitle: 'SQL Injection Detected', wazuhDetails: 'Web Application Attack',
    glpiTitle: 'Injection SQL — application web',
    glpiPriority: { class: 'high', label: 'Haute' }, glpiCategory: 'Application',
  },
}

let logCounter = 0
let ticketCounter = 1000

function getTime() {
  const n = new Date()
  return [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => v.toString().padStart(2, '0')).join(':')
}
function getFullTimestamp() {
  const n = new Date()
  const months = ['jan','fév','mar','avr','mai','jui','jui','aoû','sep','oct','nov','déc']
  return `${n.getDate()} ${months[n.getMonth()]}. ${n.getFullYear()} · ${[n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>v.toString().padStart(2,'0')).join(':')}`
}
function getDateStr() {
  const n = new Date()
  return `${n.getDate().toString().padStart(2,'0')}/${(n.getMonth()+1).toString().padStart(2,'0')}/${n.getFullYear()} ${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}`
}

export default function Presentation() {
  const [snortLogs,   setSnortLogs]   = useState<LogEntry[]>([
    { id: ++logCounter, time: '00:00:00', msg: 'Snort IDS démarré — règles chargées', level: 'info' },
    { id: ++logCounter, time: '00:00:01', msg: 'Interface eth0 en mode promiscuous', level: 'success' },
  ])
  const [wazuhLogs,   setWazuhLogs]   = useState<LogEntry[]>([
    { id: ++logCounter, time: '00:00:00', msg: 'Manager démarré — agent connecté', level: 'info' },
    { id: ++logCounter, time: '00:00:01', msg: 'Corrélation active — MITRE ATT&CK chargé', level: 'success' },
  ])
  const [wazuhEvents, setWazuhEvents] = useState<WazuhEvent[]>([])
  const [glpiTickets, setGlpiTickets] = useState<GlpiTicket[]>([])
  const [steps,       setSteps]       = useState<StepState[]>(Array(6).fill(''))
  const [nodes,       setNodes]       = useState<Record<string,NodeState>>({ pc:'idle', switch:'idle', raspberry:'idle', wazuh:'idle', glpi:'idle' })
  const [connectors,  setConnectors]  = useState<Record<number,string>>({1:'',2:'',3:'',4:''})
  const [stats,       setStats]       = useState({ packets: 1247, alerts: 0, blocked: 0, uptime: '00:00:00' })
  const [snortCount,  setSnortCount]  = useState(0)
  const [wazuhCount,  setWazuhCount]  = useState(0)
  const [toast,       setToast]       = useState<{type:string;title:string;msg:string}|null>(null)
  const [running,     setRunning]     = useState(false)
  const snortRef = useRef<HTMLDivElement>(null)
  const wazuhRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const t = setInterval(() => {
      const s = Math.floor((Date.now() - startRef.current) / 1000)
      const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
      setStats(p => ({ ...p, uptime: [h,m,sec].map(v=>v.toString().padStart(2,'0')).join(':') }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { if (snortRef.current) snortRef.current.scrollTop = snortRef.current.scrollHeight }, [snortLogs])
  useEffect(() => { if (wazuhRef.current) wazuhRef.current.scrollTop = wazuhRef.current.scrollHeight }, [wazuhLogs])

  const addSnortLog = (msg: string, level: LogLevel) =>
    setSnortLogs(p => [...p, { id: ++logCounter, time: getTime(), msg, level }])

  const addWazuhLog = (msg: string, level: LogLevel) =>
    setWazuhLogs(p => [...p, { id: ++logCounter, time: getTime(), msg, level }])

  const showToast = (type: string, title: string, msg: string) => {
    setToast({ type, title, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const setStep = (idx: number, state: StepState) =>
    setSteps(p => { const n = [...p]; n[idx-1] = state; return n })

  const setNode = (name: string, state: NodeState) =>
    setNodes(p => ({ ...p, [name]: state }))

  const activateConnector = (idx: number, color: string) =>
    setConnectors(p => ({ ...p, [idx]: color }))

  const simulateNormal = () => {
    if (running) return
    setRunning(true)
    setSteps(Array(6).fill(''))
    setNodes({ pc:'idle', switch:'idle', raspberry:'idle', wazuh:'idle', glpi:'idle' })
    setConnectors({1:'',2:'',3:'',4:''})

    setStep(1, 'active'); setNode('pc', 'active'); activateConnector(1, 'green')
    showToast('info', 'Trafic normal', 'Aucune menace détectée')

    setTimeout(() => { setStep(1,'done'); setStep(2,'active'); setNode('switch','active'); activateConnector(2,'green') }, 800)
    setTimeout(() => {
      setStep(2,'done'); setStep(3,'active'); setNode('raspberry','active')
      addSnortLog('Trafic HTTP normal — 192.168.1.10 → 192.168.1.20', 'info')
      addSnortLog('Aucune signature correspondante', 'success')
    }, 1600)
    setTimeout(() => {
      setStep(3,'done'); setStep(4,'active'); setNode('wazuh','active'); activateConnector(3,'green')
      addWazuhLog('Événement reçu — niveau 3 (info)', 'info')
      addWazuhLog('Aucune corrélation d\'alerte', 'success')
    }, 2400)
    setTimeout(() => {
      setStep(4,'done'); setStep(5,'active'); setNode('glpi','active'); activateConnector(4,'green')
      addWazuhLog('Rapport de conformité mis à jour', 'success')
    }, 3200)
    setTimeout(() => {
      setStep(5,'done'); setStep(6,'done')
      setStats(p => ({ ...p, packets: p.packets + Math.floor(Math.random()*200)+50 }))
      showToast('success', 'Trafic analysé', 'Aucune menace — système nominal')
      setRunning(false)
    }, 4000)
  }

  const simulateAttack = (key: AttackKey) => {
    if (running) return
    setRunning(true)
    const attack = attacks[key]
    setSteps(Array(6).fill(''))
    setNodes({ pc:'idle', switch:'idle', raspberry:'idle', wazuh:'idle', glpi:'idle' })
    setConnectors({1:'',2:'',3:'',4:''})

    setStep(1,'active'); setNode('pc','alert'); activateConnector(1,'red')
    showToast('danger', 'Attaque détectée', attack.name)

    setTimeout(() => {
      setStep(1,'done'); setStep(2,'active'); setNode('switch','warning'); activateConnector(2,'amber')
      setStats(p => ({ ...p, packets: p.packets + Math.floor(Math.random()*500)+100 }))
    }, 800)

    setTimeout(() => {
      setStep(2,'done'); setStep(3,'active'); setNode('raspberry','alert'); activateConnector(3,'amber')
      attack.snortLogs.forEach((log, i) => {
        setTimeout(() => {
          addSnortLog(log.msg, log.level)
          setSnortCount(c => c + 1)
          setStats(p => ({ ...p, alerts: p.alerts + 1 }))
        }, i * 400)
      })
    }, 1800)

    setTimeout(() => {
      setStep(3,'done'); setStep(4,'active'); setNode('wazuh','warning')
      addWazuhLog(`Alerte reçue de Snort — niveau ${attack.wazuhLevel}`, 'warning')
      addWazuhLog(`Règle déclenchée : ${attack.wazuhTitle}`, 'danger')
      addWazuhLog(`Corrélation MITRE : ${attack.wazuhDetails}`, 'warning')
      const newEvent: WazuhEvent = {
        id: Date.now(), ts: getFullTimestamp(),
        level: attack.wazuhLevel, title: attack.wazuhTitle,
        details: attack.wazuhDetails, firedTimes: Math.floor(Math.random()*10)+1,
      }
      setWazuhEvents(p => [newEvent, ...p])
      setWazuhCount(c => c + 1)
    }, 3600)

    setTimeout(() => {
      setStep(4,'done'); setStep(5,'active'); setNode('glpi','active'); activateConnector(4,'red')
      const ticket: GlpiTicket = {
        id: ++ticketCounter, title: attack.glpiTitle,
        status: 'new', priority: attack.glpiPriority,
        category: attack.glpiCategory, date: getDateStr(), assignee: 'SOC Admin',
      }
      setGlpiTickets(p => [ticket, ...p])
      setStats(p => ({ ...p, blocked: p.blocked + 1 }))
      showToast('warning', 'Ticket créé', `#${ticket.id} — ${attack.glpiTitle}`)
    }, 5000)

    setTimeout(() => {
      setStep(5,'done'); setStep(6,'done')
      showToast('success', 'Incident traité', 'Ticket assigné — SOC notifié')
      setRunning(false)
    }, 6200)
  }

  const reset = () => {
    setSteps(Array(6).fill(''))
    setNodes({ pc:'idle', switch:'idle', raspberry:'idle', wazuh:'idle', glpi:'idle' })
    setConnectors({1:'',2:'',3:'',4:''})
    setSnortLogs([
      { id: ++logCounter, time: '00:00:00', msg: 'Snort IDS démarré — règles chargées', level: 'info' },
      { id: ++logCounter, time: '00:00:01', msg: 'Interface eth0 en mode promiscuous', level: 'success' },
    ])
    setWazuhLogs([
      { id: ++logCounter, time: '00:00:00', msg: 'Manager démarré — agent connecté', level: 'info' },
      { id: ++logCounter, time: '00:00:01', msg: 'Corrélation active — MITRE ATT&CK chargé', level: 'success' },
    ])
    setWazuhEvents([])
    setGlpiTickets([])
    setSnortCount(0)
    setWazuhCount(0)
    setStats({ packets: 1247, alerts: 0, blocked: 0, uptime: stats.uptime })
    setRunning(false)
    showToast('info', 'Réinitialisation', 'Démo remise à zéro')
  }

  const totalTickets = glpiTickets.length
  const openTickets  = glpiTickets.filter(t => t.status === 'new' || t.status === 'assigned').length
  const critTickets  = glpiTickets.filter(t => t.priority.class === 'critical').length

  const nodeClass = (name: string) => [styles.node, nodes[name] !== 'idle' ? styles[`node_${nodes[name]}`] : ''].filter(Boolean).join(' ')
  const stepClass = (i: number)   => [styles.step, steps[i-1] === 'active' ? styles.stepActive : steps[i-1] === 'done' ? styles.stepDone : ''].filter(Boolean).join(' ')
  const connClass = (i: number)   => [styles.connector, connectors[i] ? styles[`conn_${connectors[i]}`] : ''].filter(Boolean).join(' ')

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Hero ── */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Détection<br />d'<em>intrusion</em><br />réseau
          </h1>
          <p className={styles.heroDesc}>
            Une architecture complète de supervision sécurité basée sur Snort, Wazuh et GLPI —
            du trafic réseau à la gestion d'incidents, sans zone d'ombre.
          </p>
          <div className={styles.heroMeta}>
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Analyse temps réel' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: '5 composants intégrés' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: 'Corrélation OPENCTI' },
            ].map(m => (
              <div key={m.label} className={styles.metaItem}>
                {m.icon}{m.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className={styles.statsBar}>
          {[
            { value: stats.packets.toLocaleString('fr'), label: 'Paquets analysés' },
            { value: stats.alerts.toString(),            label: 'Alertes générées' },
            { value: stats.blocked.toString(),           label: 'Menaces bloquées' },
            { value: stats.uptime,                       label: 'Uptime' },
          ].map(s => (
            <div key={s.label} className={styles.statItem}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Architecture ── */}
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>L'<em>architecture</em></h2>
          <div className={styles.sectionSub}>Cinq composants. Un flux. Aucune zone d'ombre.</div>
        </div>

        <div className={styles.archCard}>
          <div className={styles.arch}>
            {(['pc','switch','raspberry','wazuh','glpi'] as const).map((name, i) => {
              const labels: Record<string,[string,string]> = {
                pc:        ['Client','Source'],
                switch:    ['Switch','Mirroring'],
                raspberry: ['Raspberry Pi','Snort IDS'],
                wazuh:     ['Wazuh SIEM','Corrélation'],
                glpi:      ['GLPI','Ticketing'],
              }
              const ips: Record<string,string> = {
                pc:'192.168.1.10', switch:'SPAN',
                raspberry:'192.168.1.20', wazuh:'192.168.1.30', glpi:'192.168.1.40',
              }
              return (
                <div key={name} className={styles.nodeWrapper}>
                  <div className={nodeClass(name)}>
                    <div className={styles.nodeIcon}>
                      <NodeSvg name={name} />
                    </div>
                    <div className={styles.ip}>{ips[name]}</div>
                    <div className={styles.nodeLabel}>
                      {labels[name][0]}
                      <span className={styles.role}>{labels[name][1]}</span>
                    </div>
                  </div>
                  {i < 4 && (
                    <div className={connClass(i+1)}>
                      <div className={styles.packet} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Timeline */}
          <div className={styles.timeline}>
            {([
              [1,'i.','Trafic généré'],
              [2,'ii.','Switch SPAN'],
              [3,'iii.','Snort détecte'],
              [4,'iv.','Wazuh corrèle'],
              [5,'v.','Ticket créé'],
              [6,'vi.','Incident traité'],
            ] as [number,string,string][]).map(([n,num,label]) => (
              <div key={n} className={stepClass(n)}>
                <span className={styles.stepNum}>{num}</span>
                <div className={styles.stepCircle} />
                <div className={styles.stepLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Simulation ── */}
        <div className={styles.simCard}>
          <div className={styles.simHead}>
            <h3 className={styles.simTitle}>Essayez un <em>scénario</em></h3>
            <div className={styles.simHint}>Choisissez une attaque à simuler</div>
          </div>
          <div className={styles.scenarios}>
            <button className={`${styles.scenario} ${styles.scenarioNormal}`}
              onClick={simulateNormal} disabled={running}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Trafic normal
            </button>
            {(Object.keys(attacks) as AttackKey[]).map(key => (
              <button key={key}
                className={`${styles.scenario} ${styles[`scenario_${key}`]}`}
                onClick={() => simulateAttack(key)} disabled={running}>
                <AttackIcon k={key} />
                {attacks[key].name}
              </button>
            ))}
            <button className={`${styles.scenario} ${styles.scenarioReset}`} onClick={reset}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.54"/>
              </svg>
              Réinitialiser
            </button>
          </div>
        </div>

        {/* ── Panels ── */}
        <div className={styles.panelsRow}>
          <Panel title="Snort IDS" count={`${snortCount} alertes`} badge={snortCount} color="terra"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>}>
            <div className={styles.logList} ref={snortRef}>
              {snortLogs.map(l => (
                <div key={l.id} className={`${styles.logEntry} ${styles[`log_${l.level}`]}`}>
                  <span className={styles.logTime}>{l.time}</span>
                  <span className={styles.logMsg}>{l.msg}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Wazuh SIEM" count={`${wazuhCount} incidents`} badge={wazuhCount} color="denim"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}>
            <div className={styles.logList} ref={wazuhRef}>
              {wazuhLogs.map(l => (
                <div key={l.id} className={`${styles.logEntry} ${styles[`log_${l.level}`]}`}>
                  <span className={styles.logTime}>{l.time}</span>
                  <span className={styles.logMsg}>{l.msg}</span>
                </div>
              ))}
            </div>
            {wazuhEvents.length > 0 && (
              <div className={styles.wazuhEvents}>
                {wazuhEvents.map(ev => <WazuhEventCard key={ev.id} event={ev} />)}
              </div>
            )}
          </Panel>
        </div>

        {/* ── GLPI ── */}
        <div className={styles.sectionHead} style={{marginTop:64}}>
          <h2 className={styles.sectionTitle}>Les <em>tickets</em></h2>
          <div className={styles.sectionSub}>Chaque alerte devient une action</div>
        </div>

        <div className={styles.glpiWrapper}>
          <div className={styles.glpiTopbar}>
            <div className={styles.glpiTopLeft}>
              <span className={styles.glpiLogo}>GLPI</span>
              <span className={styles.breadSep}>›</span>
              <span>Assistance</span>
              <span className={styles.breadSep}>›</span>
              <span>Tickets</span>
            </div>
            <div className={styles.glpiTopRight}>
              <div className={styles.glpiSearchBar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13,flexShrink:0}}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                Rechercher…
              </div>
              <div className={styles.glpiAvatar}>A</div>
            </div>
          </div>

          <div className={styles.glpiLayout}>
            <div className={styles.glpiSidebar}>
              {[
                { label:'Tickets', active:true },
                { label:'Rapports', active:false },
                { label:'Configuration', active:false },
                { label:'Équipe', active:false },
              ].map(item => (
                <div key={item.label} className={`${styles.sidebarItem} ${item.active ? styles.sidebarItemActive : ''}`}>
                  <span>{item.label}</span>
                  <span>›</span>
                </div>
              ))}
            </div>

            <div className={styles.glpiMain}>
              <div className={styles.glpiBar}>
                <h3 className={styles.glpiBarTitle}>Tickets d'<em>assistance</em></h3>
                <button className={styles.newTicketBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Nouveau ticket
                </button>
              </div>

              <div className={styles.glpiStats}>
                {[
                  { n: openTickets,  lbl:'Ouverts',  cls:'statTerra' },
                  { n: critTickets,  lbl:'Critiques', cls:'statRust' },
                  { n: 0,            lbl:'Résolus',  cls:'statOlive' },
                  { n: totalTickets, lbl:'Total',    cls:'statInk' },
                ].map(s => (
                  <div key={s.lbl} className={styles.glpiStatBox}>
                    <div className={`${styles.glpiStatNum} ${styles[s.cls]}`}>{s.n}</div>
                    <div className={styles.glpiStatLbl}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Titre</th>
                      <th>Statut</th>
                      <th>Priorité</th>
                      <th>Catégorie</th>
                      <th>Date</th>
                      <th>Assigné à</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glpiTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className={styles.emptyRow}>
                          Aucun ticket — lancez une simulation
                        </td>
                      </tr>
                    ) : glpiTickets.map(t => (
                      <tr key={t.id} className={styles.tableRow}>
                        <td className={styles.tdId}>#{t.id}</td>
                        <td className={styles.tdTitle}>{t.title}</td>
                        <td><span className={`${styles.statusBadge} ${styles[`status_${t.status}`]}`}>
                          {{ new:'Nouveau', assigned:'Assigné', progress:'En cours', closed:'Résolu' }[t.status]}
                        </span></td>
                        <td><span className={`${styles.priorityBadge} ${styles[`priority_${t.priority.class}`]}`}>{t.priority.label}</span></td>
                        <td><span className={styles.categoryPill}>{t.category}</span></td>
                        <td className={styles.tdDate}>{t.date}</td>
                        <td className={styles.tdAssignee}>{t.assignee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.pagination}>
                <span className={styles.paginationInfo}>{totalTickets} ticket(s)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          <div className={styles.toastTitle}>{toast.title}</div>
          <div className={styles.toastMsg}>{toast.msg}</div>
        </div>
      )}
    </div>
  )
}

/* ── Panel ── */
function Panel({ title, count, badge, color, icon, children }: {
  title: string; count: string; badge: number; color: string
  icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={`${styles.panelIcon} ${styles[`panelIcon_${color}`]}`}>{icon}</div>
        <div className={styles.panelMeta}>
          <div className={styles.panelTitle}>{title}</div>
          <div className={styles.panelCount}>{count}</div>
        </div>
        {badge > 0 && <div className={`${styles.badgePill} ${styles[`badgePill_${color}`]}`}>{badge}</div>}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </div>
  )
}

/* ── Wazuh event card ── */
function WazuhEventCard({ event }: { event: WazuhEvent }) {
  const [open, setOpen] = useState(true)
  const lvlColor = event.level >= 12 ? 'var(--rust)' : event.level >= 8 ? 'var(--terra)' : 'var(--gold)'
  return (
    <div className={styles.wazuhEvent}>
      <div className={styles.wazuhHeader} onClick={() => setOpen(o => !o)}>
        <span className={styles.wazuhArrow} style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
        <span className={styles.wazuhTs}>{event.ts}</span>
        <span className={styles.wazuhLvl} style={{ color: lvlColor }}>lvl {event.level}</span>
      </div>
      {open && (
        <div className={styles.wazuhBody}>
          {([
            ['agent.ip','192.168.1.20'],
            ['agent.name','Raspberry-agent'],
            ['agent.id','004'],
            ['manager','wazuh'],
            ['rule.firedtimes', String(event.firedTimes)],
            ['rule.level', String(event.level)],
            ['rule.description', event.title],
            ['rule.mitre.technique', event.details],
          ] as [string,string][]).map(([k,v]) => (
            <span key={k} className={styles.wazuhField}>
              <span className={styles.wazuhKey}>{k}:</span>
              <span className={styles.wazuhVal}>{v}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Node SVGs ── */
function NodeSvg({ name }: { name: string }) {
  if (name === 'pc')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  if (name === 'switch')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M21 3l-7 7"/><path d="M8 21H3v-5"/><path d="M3 21l7-7"/><path d="M21 16v5h-5"/><path d="M21 21l-7-7"/><path d="M3 8V3h5"/><path d="M3 3l7 7"/></svg>
  if (name === 'raspberry')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
  if (name === 'wazuh')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}

/* ── Attack icons ── */
function AttackIcon({ k }: { k: AttackKey }) {
  if (k === 'portscan')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  if (k === 'bruteforce')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  if (k === 'ddos')
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
