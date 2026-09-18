'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, type ProjectCard } from '../../lib/api';
import { ProjectCardView, EmptyState } from '../../components/ui';

const SORTS = ['new', 'top', 'trending'] as const;

export const dynamic = 'force-dynamic';

export default function ExplorePage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <ExploreInner />
    </Suspense>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<ProjectCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') ?? '');
  const tech = params.get('tech') ?? '';
  const sort = (params.get('sort') ?? 'new') as (typeof SORTS)[number];

  useEffect(() => { setQ(params.get('q') ?? ''); }, [params]);

  useEffect(() => {
    setLoading(true);
    api.listProjects({ q: params.get('q') ?? undefined, tech: tech || undefined, sort })
      .then((r) => { setItems(r.items); setTotal(r.total); })
      .catch(() => { setItems([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [params, tech, sort]);

  function apply(next: Record<string, string>) {
    const qs = new URLSearchParams();
    const cur = { q, tech, sort, ...next };
    if (cur.q) qs.set('q', cur.q);
    if (cur.tech) qs.set('tech', cur.tech);
    if (cur.sort && cur.sort !== 'new') qs.set('sort', cur.sort);
    router.push(`/explore${qs.toString() ? `?${qs}` : ''}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Explore builds</h1>
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <input className="input" placeholder="Search title, tagline, description…" value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') apply({ q }); }} />
        <input className="input md:max-w-64" placeholder="tech: react,python (comma ok)" defaultValue={tech} key={tech}
          onKeyDown={(e) => { if (e.key === 'Enter') apply({ tech: (e.target as HTMLInputElement).value }); }} />
        <div className="flex gap-2">
          {SORTS.map((s) => (
            <button key={s} onClick={() => apply({ sort: s })}
              className={`btn ${sort === s ? 'btn-primary' : 'btn-ghost'}`}>{s}</button>
          ))}
          <button onClick={() => apply({ q })} className="btn btn-primary">Search</button>
        </div>
      </div>
      {tech && <p className="text-sm">Filtering by tech: <b>{tech}</b> <button className="underline" onClick={() => apply({ tech: '' })}>clear</button></p>}
      {loading ? <p className="text-sm text-slate-500">Loading…</p>
        : items.length === 0 ? <EmptyState title="No builds found" hint="Try fewer tech filters or a shorter query." />
        : (
          <>
            <p className="text-sm text-slate-600">{total} build{total === 1 ? '' : 's'}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => <ProjectCardView key={p.id} p={p} />)}
            </div>
          </>
        )}
    </div>
  );
}
