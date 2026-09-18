import Link from 'next/link';
import type { ProjectCard } from '../lib/api';
import { imgSrc } from '../lib/api';

export function TechBadge({ slug, name }: { slug: string; name: string }) {
  return (
    <Link href={`/explore?tech=${encodeURIComponent(slug)}`} className="chip hover:bg-slate-200">
      {name}
    </Link>
  );
}

export function ProjectCardView({ p }: { p: ProjectCard }) {
  const cover = imgSrc(p.coverImageUrl);
  return (
    <Link href={`/projects/${p.slug}`} className="card overflow-hidden hover:shadow-md transition block">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={p.title} className="h-44 w-full object-cover" loading="lazy" />
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-slate-900 to-slate-600 flex items-center justify-center text-white text-2xl font-bold">
          {p.title.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{p.title}</h3>
          <span className="chip shrink-0">▲ {p.upvoteCount}</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{p.tagline}</p>
        <div className="flex flex-wrap gap-1.5">
          {p.techs.slice(0, 4).map(({ tech }) => (
            <span key={tech.slug} className="chip">{tech.name}</span>
          ))}
        </div>
        <p className="text-xs text-slate-500">by @{p.owner.username}</p>
      </div>
    </Link>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card p-10 text-center space-y-2">
      <p className="font-semibold">{title}</p>
      {hint && <p className="text-sm text-slate-600">{hint}</p>}
    </div>
  );
}

export function TeamAvatars({ members }: { members: { user: { username: string; name: string; avatarUrl?: string | null } }[] }) {
  return (
    <div className="flex -space-x-2">
      {members.map((m) => (
        <Link key={m.user.username} href={`/profile/${m.user.username}`} title={`${m.user.name} (@${m.user.username})`}
          className="h-8 w-8 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center border-2 border-white">
          {m.user.name.slice(0, 1).toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
