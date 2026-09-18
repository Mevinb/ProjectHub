'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { ProjectForm } from '../../../../components/project-form';

export default function EditPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.getProject(params.id).then(setData).catch((e) => setErr(e.message));
  }, [params.id]);
  if (err) return <p className="text-sm">Failed: {err} <Link className="underline" href="/explore">back</Link></p>;
  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit — {data.title}</h1>
      <ProjectForm initial={data} slug={data.id} />
    </div>
  );
}
