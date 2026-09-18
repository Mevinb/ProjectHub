'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', username: '', name: '', password: '' });
  const [err, setErr] = useState('');
  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try { await api.signup(form); router.push('/explore'); }
    catch (e: any) { setErr(e.message); }
  }
  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-xl font-bold">Join with any email</h1>
      <p className="text-xs text-slate-600">All mail IDs allowed (gmail, yahoo, college...). To restrict later, set ALLOWED_EMAIL_DOMAINS in .env.</p>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="you@gmail.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
        <input className="input" placeholder="username (a-z, 0-9, _)" value={form.username} onChange={(e) => set('username', e.target.value)} required />
        <input className="input" placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        <input className="input" type="password" placeholder="Password (min 8)" value={form.password} onChange={(e) => set('password', e.target.value)} required />
        <button className="btn btn-primary w-full">Create account</button>
      </form>
      <p className="text-sm">Have an account? <Link className="underline" href="/login">Login</Link></p>
    </div>
  );
}
