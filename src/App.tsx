import { useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleHelp,
  Clock3,
  Inbox,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import type { Email, EmailCategory } from './email-model'
import { useEmailData } from './state/EmailContext'

const categoryMeta: Record<EmailCategory, { label: string; title: string; className: string; symbol: string }> = {
  attention: { label: 'Needs your attention', title: '🔴 Needs Your Attention', className: 'attention', symbol: '!' },
  'worth-knowing': { label: 'Worth knowing', title: '🟡 Worth Knowing', className: 'worth', symbol: 'i' },
  'no-action': { label: 'No action needed', title: '🟢 No Action Needed', className: 'calm', symbol: '✓' },
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', options)
}

function formatReceivedAt(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function App() {
  const location = useLocation()
  const { syncing, syncInbox, error } = useEmailData()
  const onDetail = location.pathname.startsWith('/email/')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="Mailmind home">
          <span className="brand-mark"><Inbox size={20} strokeWidth={2.2} /></span>
          <span>mailmind</span>
        </Link>
        <div className="workspace-label">YOUR SPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive || onDetail ? 'active' : ''}`}>
            <Inbox size={18} /><span>Inbox</span><span className="nav-live-dot" />
          </NavLink>
          <NavLink to="/agenda" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays size={18} /><span>Agenda</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note">
            <ShieldCheck size={17} />
            <div><strong>Your inbox stays yours</strong><span>Private by design</span></div>
          </div>
          <div className="sidebar-profile">
            <span className="profile-avatar">A</span>
            <span className="profile-name">Alex Morgan</span>
            <button type="button" className="icon-button tiny" aria-label="Help"><CircleHelp size={16} /></button>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{onDetail ? 'Email details' : location.pathname === '/agenda' ? 'Agenda' : 'Inbox'}</strong></div>
          <div className="topbar-right">
            <span className="sync-status"><span /> Demo inbox</span>
            <button type="button" className="button button-dark sync-button" onClick={() => void syncInbox()} disabled={syncing}>
              <RefreshCw size={15} className={syncing ? 'spin' : ''} />
              {syncing ? 'Checking inbox' : 'Check for new email'}
            </button>
          </div>
        </header>
        {error && <div className="error-banner" role="alert"><CircleHelp size={16} />{error}</div>}
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/email/:emailId" element={<EmailDetail />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="page-footer"><span>Made for a little more breathing room.</span><span><Sparkles size={13} /> Thoughtfully sorted by Mailmind</span></footer>
      </div>
    </div>
  )
}

function Dashboard() {
  const { emails, loading } = useEmailData()
  const attention = emails.filter((email) => email.category === 'attention')
  const worthKnowing = emails.filter((email) => email.category === 'worth-knowing')
  const noAction = emails.filter((email) => email.category === 'no-action')
  const reminders = emails.filter((email) => email.reminderState === 'added').length

  if (loading) return <LoadingState />

  return (
    <div className="dashboard-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR DAILY BRIEFING</div>
          <h1>Hello<span className="greeting-comma">.</span></h1>
          <p className="welcome-copy">A little clarity for whatever today brings.</p>
        </div>
        <div className="analyzed-card">
          <div className="analyzed-icon"><Sparkles size={17} /></div>
          <div><strong>{emails.length} emails analyzed</strong><span>Since your last inbox check</span></div>
        </div>
      </section>

      <section className="summary-grid" aria-label="Inbox summary">
        <div className="summary-card">
          <span className="summary-label">Needs a look</span>
          <div className="summary-bottom"><strong>{attention.length.toString().padStart(2, '0')}</strong><span className="summary-indicator red-indicator"><ArrowUpRight size={15} /></span></div>
          <span className="summary-note">Worth your attention today</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Worth knowing</span>
          <div className="summary-bottom"><strong>{worthKnowing.length.toString().padStart(2, '0')}</strong><span className="summary-indicator amber-indicator"><ArrowDownLeft size={15} /></span></div>
          <span className="summary-note">A few things to keep in mind</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Reminders saved</span>
          <div className="summary-bottom"><strong>{reminders.toString().padStart(2, '0')}</strong><span className="summary-indicator neutral-indicator"><CalendarDays size={15} /></span></div>
          <span className="summary-note"><Link to="/agenda">See your agenda <ArrowRight size={12} /></Link></span>
        </div>
      </section>

      <section className="email-section attention-section">
        <SectionHeading category="attention" count={attention.length} description="A few things need your attention." />
        {attention.length ? <div className="attention-list">{attention.map((email) => <AttentionCard key={email.id} email={email} />)}</div> : <EmptyCategory />}
      </section>

      <section className="email-section secondary-section">
        <SectionHeading category="worth-knowing" count={worthKnowing.length} description="Useful to know, no rush to act." />
        {worthKnowing.length ? <div className="compact-list">{worthKnowing.map((email) => <CompactEmailCard key={email.id} email={email} />)}</div> : <EmptyCategory />}
      </section>

      <section className="email-section secondary-section no-action-section">
        <SectionHeading category="no-action" count={noAction.length} description="We’ve got these out of your way." />
        {noAction.length ? <div className="compact-list">{noAction.map((email) => <CompactEmailCard key={email.id} email={email} />)}</div> : <EmptyCategory />}
      </section>
    </div>
  )
}

function SectionHeading({ category, count, description }: { category: EmailCategory; count: number; description: string }) {
  const meta = categoryMeta[category]
  return (
    <div className="section-heading">
      <div className={`section-symbol ${meta.className}`}>{meta.symbol}</div>
      <div className="section-title-copy"><h2>{meta.title}</h2><p>{description}</p></div>
      <span className="section-count">{count}</span>
    </div>
  )
}

function AttentionCard({ email }: { email: Email }) {
  const dateFact = email.extractedInformation.find((item) => item.kind === 'deadline' || item.kind === 'event')
  return (
    <Link to={`/email/${email.id}`} className={`attention-card ${!email.actionRequired ? 'resolved-card' : ''}`}>
      <span className="attention-rail" />
      <span className="sender-avatar">{initials(email.sender)}</span>
      <span className="attention-card-main">
        <span className="card-meta"><strong>{email.sender}</strong><span>{formatReceivedAt(email.receivedAt)}</span></span>
        <span className="email-subject">{email.subject}</span>
        <span className="email-summary">{email.summary}</span>
        <span className="key-facts">{email.keyInformation.slice(0, 3).map((fact) => <span key={fact}>{fact}</span>)}</span>
        <span className="recommended-inline"><Sparkles size={13} /><span>{email.actionRequired ? email.recommendedAction : 'Marked as handled'}</span></span>
      </span>
      <span className="attention-card-aside">
        {email.reminderState === 'added' && <span className="reminder-chip"><CalendarDays size={12} /> Reminder</span>}
        {dateFact && <span className="deadline-chip"><Clock3 size={12} />{formatDate(dateFact.value)}</span>}
        <ChevronRight size={17} className="card-chevron" />
      </span>
    </Link>
  )
}

function CompactEmailCard({ email }: { email: Email }) {
  return (
    <Link to={`/email/${email.id}`} className="compact-card">
      <span className={`compact-symbol ${categoryMeta[email.category].className}`}>{categoryMeta[email.category].symbol}</span>
      <span className="compact-main">
        <span className="compact-topline"><strong>{email.sender}</strong><span>{formatReceivedAt(email.receivedAt)}</span></span>
        <span className="compact-subject">{email.subject}</span>
        <span className="compact-summary">{email.summary}</span>
      </span>
      <ChevronRight size={16} className="card-chevron" />
    </Link>
  )
}

function EmptyCategory() {
  return <div className="empty-category"><Check size={16} /> Nothing here right now. We’ll keep an eye out.</div>
}

function EmailDetail() {
  const { emailId = '' } = useParams()
  const { emails, loading, updateEmail } = useEmailData()
  const [showOriginal, setShowOriginal] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [updating, setUpdating] = useState(false)
  const email = emails.find((item) => item.id === emailId)

  if (loading) return <LoadingState />
  if (!email) return <NotFound />
  const selectedEmail = email

  const nextDeadline = selectedEmail.extractedInformation.find((item) => item.kind === 'deadline' || item.kind === 'event')?.value
  const reminderDate = selectedEmail.reminderDate ?? (nextDeadline && !Number.isNaN(Date.parse(nextDeadline)) ? nextDeadline : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const category = categoryMeta[selectedEmail.category]

  async function toggleReminder() {
    setUpdating(true)
    try {
      await updateEmail(selectedEmail.id, selectedEmail.reminderState === 'added'
        ? { reminderState: 'none', reminderDate: null }
        : { reminderState: 'added', reminderDate })
    } finally {
      setUpdating(false)
    }
  }

  async function toggleHandled() {
    setUpdating(true)
    try {
      await updateEmail(selectedEmail.id, { actionRequired: !selectedEmail.actionRequired })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="detail-page">
      <Link className="back-link" to="/"><ArrowLeft size={15} /> Back to inbox</Link>
      <div className="detail-layout">
        <article className="detail-main">
          <div className="detail-overline"><span className={`category-pill ${category.className}`}><span />{category.label}</span><span>{formatReceivedAt(email.receivedAt)}</span></div>
          <h1 className="detail-subject">{email.subject}</h1>
          <div className="detail-sender"><span className="sender-avatar large">{initials(email.sender)}</span><span><strong>{email.sender}</strong><span>{email.senderEmail}</span></span></div>

          <section className="detail-card why-card">
            <div className="detail-card-heading"><span className="detail-icon lavender"><Sparkles size={17} /></span><div><h2>Why This Matters</h2><p>What Mailmind picked up for you</p></div></div>
            <p className="why-copy">{email.summary}</p>
            <div className="score-row">
              <Score label="Relevance" score={email.relevanceScore} />
              <Score label="Urgency" score={email.urgencyScore} />
            </div>
          </section>

          <section className="detail-card">
            <div className="detail-card-heading"><span className="detail-icon green"><CheckCheck size={17} /></span><div><h2>What we found</h2><p>Key information from this message</p></div></div>
            <dl className="extracted-list">
              {email.extractedInformation.map((item) => {
                const isDated = (item.kind === 'deadline' || item.kind === 'event') && !Number.isNaN(Date.parse(item.value))
                return <div className="extracted-item" key={`${item.label}-${item.value}`}><dt>{item.label}</dt><dd>{isDated ? formatDate(item.value, { month: 'short', day: 'numeric', year: 'numeric' }) : item.value}</dd></div>
              })}
            </dl>
          </section>

          <button className="original-toggle" onClick={() => setShowOriginal((current) => !current)} aria-expanded={showOriginal}>
            <span><Mail size={16} /> Original email</span><span>{showOriginal ? 'Hide' : 'View email'} <ChevronRight size={15} className={showOriginal ? 'rotate-down' : ''} /></span>
          </button>
          {showOriginal && <div className="original-email"><div className="original-email-head"><strong>{email.subject}</strong><span>From {email.sender} &lt;{email.senderEmail}&gt;</span></div><p>{email.originalContent}</p></div>}
        </article>

        <aside className="detail-aside">
          <div className="action-card">
            <div className="action-card-kicker"><span className="sparkle-small"><Sparkles size={14} /></span> YOUR NEXT STEP</div>
            <h2>Recommended action</h2>
            <p>{email.recommendedAction}</p>
            <div className={`action-status ${email.actionRequired ? 'status-open' : 'status-done'}`}><span />{email.actionRequired ? 'Action required' : 'Handled'}</div>
            <button className={`button reminder-button ${email.reminderState === 'added' ? 'reminder-added' : ''}`} onClick={() => void toggleReminder()} disabled={updating}>
              {email.reminderState === 'added' ? <Check size={16} /> : <Plus size={16} />}
              {updating ? 'Saving…' : email.reminderState === 'added' ? 'Reminder added · undo' : 'Add Reminder'}
            </button>
            <button className="button button-outline open-email-button" onClick={() => setShowEmailDialog(true)}><ArrowUpRight size={16} /> Open Email</button>
            <button className="mark-handled" onClick={() => void toggleHandled()} disabled={updating}>
              <CheckCheck size={15} />{email.actionRequired ? 'Mark as handled' : 'Reopen this action'}
            </button>
          </div>
          <div className="privacy-aside"><ShieldCheck size={17} /><span><strong>Your email is personal.</strong> Your messages stay private and are never used to train AI.</span></div>
        </aside>
      </div>
      {showEmailDialog && <OriginalEmailDialog email={email} onClose={() => setShowEmailDialog(false)} />}
    </div>
  )
}

function Score({ label, score }: { label: string; score: number }) {
  return <div className="score-meter"><div className="score-label"><span>{label}</span><strong>{score}<small>/100</small></strong></div><div className="score-track"><span style={{ width: `${Math.max(0, Math.min(100, score))}%` }} /></div></div>
}

function OriginalEmailDialog({ email, onClose }: { email: Email; onClose: () => void }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="original-dialog" role="dialog" aria-modal="true" aria-labelledby="original-dialog-title">
        <div className="dialog-heading"><div><span className="dialog-kicker">ORIGINAL MESSAGE</span><h2 id="original-dialog-title">{email.subject}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close email"><X size={18} /></button></div>
        <div className="dialog-sender"><span className="sender-avatar">{initials(email.sender)}</span><span><strong>{email.sender}</strong><small>{email.senderEmail} · {formatReceivedAt(email.receivedAt)}</small></span></div>
        <p className="dialog-body">{email.originalContent}</p>
        <button className="button button-dark dialog-close" onClick={onClose}>Done</button>
      </section>
    </div>
  )
}

type AgendaItem = { email: Email; date: string; title: string; kind: 'reminder' | 'event' }

function Agenda() {
  const { emails, loading } = useEmailData()
  if (loading) return <LoadingState />
  const items: AgendaItem[] = emails.flatMap((email) => {
    const events = email.extractedInformation
      .filter((info) => info.kind === 'event' && !Number.isNaN(Date.parse(info.value)))
      .map((info) => ({ email, date: info.value, title: email.subject, kind: 'event' as const }))
    const reminder = email.reminderState === 'added' && email.reminderDate
      ? [{ email, date: email.reminderDate, title: email.subject, kind: 'reminder' as const }]
      : []
    return [...events, ...reminder]
  }).sort((a, b) => a.date.localeCompare(b.date))

  const byDay = new Map<string, AgendaItem[]>()
  items.forEach((item) => byDay.set(item.date, [...(byDay.get(item.date) ?? []), item]))

  return (
    <div className="agenda-page">
      <div className="agenda-heading-row">
        <div><div className="eyebrow"><span className="eyebrow-dot" /> A LITTLE ROOM TO PLAN</div><h1>Your agenda<span className="greeting-comma">.</span></h1><p className="welcome-copy">Reminders and dates worth keeping close.</p></div>
        <div className="agenda-date-card"><CalendarDays size={18} /><span><strong>{items.length}</strong><small>saved to your agenda</small></span></div>
      </div>
      {byDay.size === 0 ? (
        <div className="agenda-empty"><div className="empty-calendar"><CalendarDays size={24} /></div><h2>Your calendar has room to breathe.</h2><p>Add a reminder from any email and it’ll find a home here.</p><Link className="button button-dark" to="/">Browse your inbox <ArrowRight size={15} /></Link></div>
      ) : (
        <div className="agenda-list">
          {[...byDay.entries()].map(([date, dayItems], index) => (
            <section className="agenda-day" key={date}>
              <div className="agenda-day-date"><span className="day-number">{new Date(`${date}T12:00:00`).getDate().toString().padStart(2, '0')}</span><span><strong>{formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' })}</strong><small>{index === 0 ? 'UP NEXT' : formatDate(date, { year: 'numeric' }).toUpperCase()}</small></span></div>
              <div className="agenda-day-events">{dayItems.map((item) => (
                <Link to={`/email/${item.email.id}`} className={`agenda-event ${item.kind}`} key={`${item.email.id}-${item.kind}-${item.title}`}>
                  <span className="agenda-event-marker">{item.kind === 'reminder' ? <Clock3 size={14} /> : <CalendarDays size={14} />}</span>
                  <span className="agenda-event-copy"><span className="event-type">{item.kind === 'reminder' ? 'REMINDER' : 'FROM YOUR EMAIL'}</span><strong>{item.title}</strong><small>{item.kind === 'reminder' ? item.email.recommendedAction : item.email.sender}</small></span>
                  <ArrowUpRight size={15} className="agenda-event-arrow" />
                </Link>
              ))}</div>
            </section>
          ))}
        </div>
      )}
      <div className="agenda-footnote"><Sparkles size={15} /> Dates and reminders are pulled straight from your emails.</div>
    </div>
  )
}

function LoadingState() {
  return <div className="loading-state"><span className="loader" />Getting your inbox ready…</div>
}

function NotFound() {
  return <div className="not-found"><span className="empty-calendar"><Inbox size={23} /></span><h1>This email isn’t here.</h1><p>It may have moved, or it might not be in your inbox.</p><Link className="button button-dark" to="/">Back to inbox <ArrowRight size={15} /></Link></div>
}

export default App
