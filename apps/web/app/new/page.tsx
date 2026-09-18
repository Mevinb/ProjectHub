import { ProjectForm } from '../../components/project-form';

export default function NewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Publish a project</h1>
      <p className="text-sm text-slate-600">Login required (any email). Add GitHub link, 1–5 screenshots, up to 8 tech tags, teammates by username.</p>
      <ProjectForm />
    </div>
  );
}
