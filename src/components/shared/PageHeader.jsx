/**
 * PageHeader — Global reusable page heading component.
 *
 * Enforces a single typographic standard across every view:
 *   - Title:    text-xl font-bold text-white font-heading
 *   - Subtitle: text-zinc-400 text-xs mt-0.5
 *
 * Props:
 *   title       {string}      Required. The page title.
 *   subtitle    {string}      Optional. Muted description below the title.
 *   actions     {ReactNode}   Optional. Buttons/controls rendered to the right.
 *   icon        {ReactNode}   Optional. Small icon rendered inline before the title.
 */
export default function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-white font-heading flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {title}
        </h1>
        {subtitle && (
          <p className="text-zinc-400 text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
