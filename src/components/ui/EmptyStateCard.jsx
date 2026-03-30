import Link from 'next/link';

export default function EmptyStateCard({ eyebrow, title, description, actionHref, actionLabel }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      {eyebrow ? <div className="text-xs font-semibold uppercase tracking-[0.24em] text-pink-500">{eyebrow}</div> : null}
      <h2 className="mt-3 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link href={actionHref} className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}