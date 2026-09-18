'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, imgSrc } from '../../../lib/api';
import { TechBadge, TeamAvatars } from '../../../components/ui';
import { UpvoteButton, BookmarkButton } from '../../../components/actions';

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.getProject(params.id).then(setData).catch((e) => setErr(e.message));
    api.me().then((r) => setMe(r.user)).catch(() => setMe(null));
  }, [params.id]);

  if (err) return <div className="card p-8">Not found: {err} — <Link className="underline" href="/explore">back to explore</Link></div>;
  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  const isOwner = me && (me.id === data.ownerId || data.members?.some((m: any) => m.userId === me.id && m.role === 'OWNER') || me.role === 'ADMIN');
  const gallery: { url: string }[] = data.images?.length ? data.images : data.coverImageUrl ? [{ url: data.coverImageUrl }] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{data.title}</h1>
          <p className="text-slate-600 mt-1">{data.tagline}</p>
          <p className="text-xs text-slate-500 mt-1">by <Link className="underline" href={`/profile/${data.owner.username}`}>@{data.owner.username}</Link> · ▲ {data.upvoteCount}</p>
        </div>
        <div className="flex gap-2">
          <UpvoteButton id={data.id} initialCount={data.upvoteCount} initialActive={data.hasUpvoted} />
          <BookmarkButton id={data.id} initialActive={data.hasBookmarked} />
          {isOwner && <Link href={`/projects/${data.slug}/edit`} className="btn btn-ghost">Edit</Link>}
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3">
          {gallery.map((g, i) => {
            const src = imgSrc(g.url);
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`screenshot ${i + 1}`} className="card w-full object-cover" loading="lazy" />
            ) : null;
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {data.techs.map(({ tech }: any) => <TechBadge key={tech.slug} slug={tech.slug} name={tech.name} />)}
      </div>

      <div className="card p-6 prose prose-slate max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm">{data.descriptionMd}</pre>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-4 text-sm">
        <a className="btn btn-ghost" href={data.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        {data.demoUrl && <a className="btn btn-ghost" href={data.demoUrl} target="_blank" rel="noreferrer">Live demo ↗</a>}
        {data.members?.length > 0 && (
          <span className="flex items-center gap-2">Team: <TeamAvatars members={data.members} />
            {data.members.map((m: any) => (
              <Link key={m.user.username} href={`/profile/${m.user.username}`} className="underline text-xs">@{m.user.username}</Link>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
