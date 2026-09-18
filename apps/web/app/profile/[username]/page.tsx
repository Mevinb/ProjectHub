'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { ProjectCardView } from '../../../components/ui';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.getUser(params.username).then(setData).catch((e) => setErr(e.message));
  }, [params.username]);
  if (err) return <p className="text-sm">User not found. <Link className="underline" href="/explore">Explore builds</Link></p>;
  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;
  const { user, owned, contributing, stats } = data;
  return (
    <div className="space-y-6">
      <div className="card p-6 flex flex-wrap gap-4 items-center">
        <div className="h-16 w-16 rounded-full bg-slate-900 text-white text-2xl flex items-center justify-center font-bold">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user.name} <span className="text-slate-500 font-normal text-lg">@{user.username}</span></h1>
          <p className="text-sm text-slate-600">{[user.branch, user.year ? `Year ${user.year}` : ''].filter(Boolean).join(' · ')}</p>
          {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
          <div className="flex gap-3 text-xs mt-2">
            {user.githubUsername && <a className="underline" href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noreferrer">GitHub: {user.githubUsername}</a>}
            {user.linkedinUrl && <a className="underline" href={user.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
          </div>
        </div>
        <div className="ml-auto flex gap-2 text-xs">
          <span className="chip">{stats.owned} owned</span>
          <span className="chip">{stats.contributing} teams</span>
          <span className="chip">▲ {stats.upvotesGiven} given</span>
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="font-bold">Owned projects</h2>
        {owned.length === 0 ? <p className="text-sm text-slate-500">Nothing published yet.</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{owned.map((p: any) => <ProjectCardView key={p.id} p={p} />)}</div>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-bold">Contributing to</h2>
        {contributing.length === 0 ? <p className="text-sm text-slate-500">No team memberships.</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{contributing.map((p: any) => <ProjectCardView key={p.id} p={p} />)}</div>
        )}
      </section>
    </div>
  );
}
