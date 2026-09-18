'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type ProjectCard } from '../../lib/api';
import { ProjectCardView, EmptyState } from '../../components/ui';

export default function BookmarksPage() {
  const [items, setItems] = useState<ProjectCard[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.myBookmarks().then((r) => setItems(r.items)).catch((e) => setErr(e.message));
  }, []);
  if (err) return <div className="card p-8 text-sm">Login to see saved builds. <Link className="underline" href="/login">Login</Link></div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved builds</h1>
      {items.length === 0 ? <EmptyState title="Nothing saved yet" hint="Tap ☆ Save on any project." /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map((p) => <ProjectCardView key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
