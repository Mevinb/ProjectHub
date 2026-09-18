import Link from 'next/link';
import { API_URL, type ProjectCard } from '../lib/api';
import { ProjectCardView } from '../components/ui';

async function getTrending(): Promise<{ items: ProjectCard[] }> {
  const res = await fetch(`${API_URL}/projects?sort=trending&limit=6`, { next: { revalidate: 30 } });
  if (!res.ok) return { items: [] };
  return res.json();
}

async function getTopTech(): Promise<{ slug: string; name: string }[]> {
  const res = await fetch(`${API_URL}/tech?q=__top`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map((t: any) => ({ slug: t.slug, name: t.name }));
}

export default async function Home() {
  const [trending, techs]: [{ items: ProjectCard[] }, { slug: string; name: string }[]] = await Promise.all([
    getTrending(),
    getTopTech(),
  ]).catch(() => [{ items: [] }, []]);

  return (
    <div className="space-y-8">
      <section className="card p-8 md:p-12 bg-gradient-to-br from-slate-900 to-slate-700 !text-white !border-0">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Campus builds, not buried PDFs.</h1>
        <p className="mt-3 text-slate-200 max-w-2xl">Publish your project with screenshots, GitHub link, and tech stack. Juniors discover by technology, upvote the best, and find teammates.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/new" className="btn bg-white text-slate-900 hover:bg-slate-100">Publish your project</Link>
          <Link href="/explore" className="btn border border-white/40 text-white hover:bg-white/10">Explore builds</Link>
        </div>
        {techs.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {techs.slice(0, 10).map((t) => (
              <Link key={t.slug} href={`/explore?tech=${t.slug}`} className="rounded-full bg-white/15 px-3 py-1 text-xs hover:bg-white/25">{t.name}</Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Trending this week</h2>
          <Link href="/explore?sort=trending" className="text-sm underline">View all</Link>
        </div>
        {trending.items.length === 0 ? (
          <div className="card p-8 text-center text-sm text-slate-600">
            No projects yet (API offline or DB empty). Run <code>npm run db:seed --workspace=apps/api</code> then refresh.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.items.map((p) => <ProjectCardView key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <section className="card p-6 text-sm text-slate-700">
        <b>How it survives after evaluation:</b> one maintainer per branch, <code>docker compose up</code> in 5 minutes,
        yearly archive, and a “looking for teammates” board (v2). See CONTRIBUTING.md.
      </section>
    </div>
  );
}
