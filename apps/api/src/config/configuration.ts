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
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  uploadDir: process.env.UPLOAD_DIR ?? './data/uploads',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 5),
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:3001/api/v1/auth/github/callback',
  },
});
