export default function AuthCallback() {
  return (
    <div className="card p-8 text-sm">
      GitHub OAuth returns here. MVP uses <code>PATCH /auth/github/link</code> + <code>GET /auth/github/repos</code> instead of full OAuth exchange.
      Link your GitHub username from your profile once logged in.
    </div>
  );
}
