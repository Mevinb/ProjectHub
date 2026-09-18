'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try { await api.login({ email, password }); router.push('/explore'); }
    catch (e: any) { setErr(e.message); }
  }
  return (
    <div className="max-w-md mx-auto card p-6 space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-primary w-full">Login</button>
      </form>
      <p className="text-sm">No account? <Link className="underline" href="/signup">Join with any email</Link></p>
    </div>
  );
}
