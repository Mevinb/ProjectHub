'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

export function UpvoteButton({ id, initialCount, initialActive }: { id: string; initialCount: number; initialActive?: boolean }) {
  const [count, setCount] = useState(initialCount);
  const [active, setActive] = useState(!!initialActive);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    // optimistic
    const prev = { count, active };
    setActive(!active);
    setCount((c) => (active ? c - 1 : c + 1));
    try {
      const r = await api.upvote(id);
      setActive(r.upvoted);
      setCount(r.upvoteCount);
    } catch (e: any) {
      setActive(prev.active);
      setCount(prev.count);
      if (String(e.message).includes('401') || String(e.message).includes('Unauthorized')) router.push('/login');
      else alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={toggle} disabled={busy} className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}>
      ▲ {count} {active ? 'Upvoted' : 'Upvote'}
    </button>
  );
}

export function BookmarkButton({ id, initialActive }: { id: string; initialActive?: boolean }) {
  const [active, setActive] = useState(!!initialActive);
  const router = useRouter();
  async function toggle() {
    try {
      const r = await api.bookmark(id);
      setActive(r.bookmarked);
    } catch (e: any) {
      if (String(e.message).includes('401') || String(e.message).includes('Unauthorized')) router.push('/login');
      else alert(e.message);
    }
  }
  return (
    <button onClick={toggle} className="btn btn-ghost">
      {active ? '★ Saved' : '☆ Save'}
    </button>
  );
}
