export default () => ({
  port: Number(process.env.API_PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me-please-32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  // '*' (or empty) = allow all mail IDs. e.g. 'college.edu,cs.college.edu' to restrict.
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS ?? '*')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  allowedEmailOverrides: (process.env.ALLOWED_EMAIL_OVERRIDES ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  frontendUrl: (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, ''),
  // Comma-separated extra origins (Vercel URL + preview deploys). FRONTEND_URL itself may also be a CSV list.
  // Trailing slashes stripped: "https://x.vercel.app/" and "https://x.vercel.app" must both match/exact-redirect.
  frontendUrls: ((process.env.FRONTEND_URL ?? 'http://localhost:3000') + ',' + (process.env.FRONTEND_URLS_EXTRA ?? ''))
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  // 'none' required for Vercel (https) -> Render (https) cross-site cookies. Defaults to none in production, lax locally.
  cookieSameSite: (process.env.COOKIE_SAMESITE ?? (process.env.NODE_ENV === 'production' ? 'none' : 'lax')) as 'lax' | 'none' | 'strict',
  uploadDir: process.env.UPLOAD_DIR ?? './data/uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 5),
  storageDriver: process.env.STORAGE_DRIVER ?? 'local',
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    bucket: process.env.SUPABASE_BUCKET ?? 'screenshots',
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3001/api/v1/auth/github/callback',
  },
});
