export default function TopBar({ title, subtitle, actions }) {
  return (
    <header className="top-bar glass-card">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="top-actions">{actions}</div>}
    </header>
  )
}
