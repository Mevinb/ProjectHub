export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type Tech = { id: string; slug: string; name: string };
export type ProjectCard = {
  id: string; slug: string; title: string; tagline: string;
  githubUrl: string; demoUrl?: string | null; coverImageUrl?: string | null;
  upvoteCount: number; createdAt: string;
  owner: { id: string; username: string; name: string; avatarUrl?: string | null };
  techs: { tech: Tech }[];
  _count: { upvotes: number; bookmarks: number };
};

async function req(path: string, init: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Is the API running on :3001? If you opened the site via 127.0.0.1, try http://localhost:3000 instead (or vice versa).`,
    );
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    const msg = Array.isArray((body as any).message)
      ? (body as any).message.join(', ')
      : (body as any).message ?? `Request failed ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  listProjects: (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    return req(`/projects?${qs.toString()}`) as Promise<{ items: ProjectCard[]; total: number; page: number; pages: number }>;
  },
  getProject: (id: string) => req(`/projects/${id}`),
  createProject: (body: any) => req('/projects', { method: 'POST', body: JSON.stringify(body) }),
  updateProject: (id: string, body: any) => req(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  upvote: (id: string) => req(`/projects/${id}/upvote`, { method: 'POST' }),
  bookmark: (id: string) => req(`/projects/${id}/bookmark`, { method: 'POST' }),
  myBookmarks: () => req('/bookmarks/mine') as Promise<{ items: ProjectCard[] }>,
  listTech: (q?: string) => req(`/tech${q ? `?q=${encodeURIComponent(q)}` : ''}`) as Promise<Tech[]>,
  signup: (body: any) => req('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => req('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => req('/auth/me'),
  logout: () => req('/auth/logout', { method: 'POST' }),
  getUser: (username: string) => req(`/users/${username}`),
  updateMe: (body: any) => req('/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
};

export function imgSrc(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // backend serves /api/v1/uploads/* ; NEXT_PUBLIC_API_URL already includes /api/v1
  const base = API_URL.replace(/\/api\/v1$/, '');
  return `${base}${url}`;
}
