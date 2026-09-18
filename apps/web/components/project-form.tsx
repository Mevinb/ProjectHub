'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_URL } from '../lib/api';

export function ProjectForm({ initial, slug }: { initial?: any; slug?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    tagline: initial?.tagline ?? '',
    descriptionMd: initial?.descriptionMd ?? '',
    githubUrl: initial?.githubUrl ?? '',
    demoUrl: initial?.demoUrl ?? '',
    techSlugs: (initial?.techs ?? []).map((t: any) => t.tech.slug).join(', '),
    imageUrls: (initial?.images ?? []).map((i: any) => i.url).join('\n'),
    memberUsernames: (initial?.members ?? []).filter((m: any) => m.role !== 'OWNER').map((m: any) => m.user.username).join(', '),
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = form.imageUrls ? form.imageUrls.split('\n').map((s: string) => s.trim()).filter(Boolean) : [];
      for (const f of Array.from(files).slice(0, 5 - urls.length)) {
        const fd = new FormData();
        fd.append('file', f);
        let res: Response;
        try {
          res = await fetch(`${API_URL}/uploads`, {
            method: 'POST', body: fd, credentials: 'include',
          });
        } catch {
          throw new Error(`Cannot reach API at ${API_URL} for image upload. Is the API running?`);
        }
        if (!res.ok) {
          if (res.status === 401) throw new Error('Upload needs login — please log in first.');
          if (res.status === 413) throw new Error('Image too large (max 5MB).');
          throw new Error('Upload failed (login + max 5MB jpg/png/webp)');
        }
        const j = await res.json();
        urls.push(j.url);
      }
      set('imageUrls', urls.join('\n'));
    } catch (e: any) { setErr(e.message ?? 'Image upload failed'); } finally { setUploading(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const body = {
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      descriptionMd: form.descriptionMd.trim(),
      githubUrl: form.githubUrl.trim(),
      demoUrl: form.demoUrl.trim() || undefined,
      techSlugs: form.techSlugs.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean),
      imageUrls: form.imageUrls.split('\n').map((s: string) => s.trim()).filter(Boolean).slice(0, 5),
      memberUsernames: slug ? undefined : form.memberUsernames.split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    try {
      const r = slug ? await api.updateProject(slugId(), body) : await api.createProject(body);
      router.push(`/projects/${r.slug}`);
    } catch (e: any) { setErr(e.message); setBusy(false); }
  }

  function slugId() { return (initial?.id ?? slug ?? '') as string; }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4 max-w-3xl">
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <div><label className="text-sm font-semibold">Title</label><input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required minLength={3} /></div>
      <div><label className="text-sm font-semibold">Tagline (10–140 chars)</label><input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} required /></div>
      <div className="grid md:grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold">GitHub URL</label><input className="input" placeholder="https://github.com/owner/repo" value={form.githubUrl} onChange={(e) => set('githubUrl', e.target.value)} required /></div>
        <div><label className="text-sm font-semibold">Demo URL (optional)</label><input className="input" value={form.demoUrl} onChange={(e) => set('demoUrl', e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-semibold">Tech (comma slugs, max 8) — e.g. react, python, postgres</label><input className="input" value={form.techSlugs} onChange={(e) => set('techSlugs', e.target.value)} /></div>
      <div>
        <label className="text-sm font-semibold">Screenshots (max 5)</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => uploadFiles(e.target.files)} />
        {uploading && <p className="text-xs">Uploading…</p>}
        <textarea className="input mt-2" rows={3} placeholder="One image URL per line (auto-filled after upload)" value={form.imageUrls} onChange={(e) => set('imageUrls', e.target.value)} />
      </div>
      {!slug && <div><label className="text-sm font-semibold">Teammates (college usernames, comma-separated)</label><input className="input" value={form.memberUsernames} onChange={(e) => set('memberUsernames', e.target.value)} /></div>}
      <div><label className="text-sm font-semibold">Description (markdown-ish, min 20 chars)</label><textarea className="input" rows={8} value={form.descriptionMd} onChange={(e) => set('descriptionMd', e.target.value)} required /></div>
      <label className="flex gap-2 text-xs text-slate-600"><input type="checkbox" required /> I own rights to these screenshots and this is my/team’s work.</label>
      <button disabled={busy} className="btn btn-primary">{busy ? 'Saving…' : slug ? 'Save changes' : 'Publish project'}</button>
    </form>
  );
}
