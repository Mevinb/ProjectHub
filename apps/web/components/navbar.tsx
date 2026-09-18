import Link from 'next/link';

export function Navbar({ user }: { user?: { username: string; name: string } | null }) {
  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="font-extrabold text-lg tracking-tight">▦ Bow <span className="text-slate-500 font-medium">· campus builds</span></Link>
        <nav className="flex gap-3 text-sm font-medium ml-4">
          <Link href="/explore" className="hover:underline">Explore</Link>
          <Link href="/new" className="hover:underline">Publish</Link>
          {user && <Link href="/bookmarks" className="hover:underline">Saved</Link>}
        </nav>
        <div className="ml-auto flex gap-2 text-sm">
          {user ? (
            <>
              <Link href={`/profile/${user.username}`} className="btn btn-ghost">@{user.username}</Link>
              <form action="/api/logout" method="post"><button className="btn">Logout</button></form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Login</Link>
              <Link href="/signup" className="btn btn-primary">Join with any email</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
