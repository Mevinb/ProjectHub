import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';

function slugify(title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'project';
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

function normSlug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9+#.-]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

const CARD_INCLUDE = {
  techs: { include: { tech: true } },
  owner: { select: { id: true, username: true, name: true, avatarUrl: true } },
  _count: { select: { upvotes: true, bookmarks: true } },
} as const;

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryProjectsDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 12, 24);
    const skip = (page - 1) * limit;
    const techSlugs = (query.tech ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const q = (query.q ?? '').trim();

    const where: any = { isPublished: true };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { descriptionMd: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (techSlugs.length) {
      where.techs = { some: { tech: { slug: { in: techSlugs } } } };
    }

    // trending = upvotes in last 7d; MVP fallback: order by upvoteCount when sort=top/trending
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'top' || query.sort === 'trending') orderBy = [{ upvoteCount: 'desc' }, { createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({ where, include: CARD_INCLUDE, orderBy, skip, take: limit }),
      this.prisma.project.count({ where }),
    ]);
    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  async get(idOrSlug: string, viewerId?: string) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: {
        ...CARD_INCLUDE,
        images: { orderBy: { sortOrder: 'asc' } },
        members: { include: { user: { select: { id: true, username: true, name: true, avatarUrl: true } } } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    let hasUpvoted = false;
    let hasBookmarked = false;
    if (viewerId) {
      const [u, b] = await Promise.all([
        this.prisma.upvote.findUnique({ where: { userId_projectId: { userId: viewerId, projectId: project.id } } }),
        this.prisma.bookmark.findUnique({ where: { userId_projectId: { userId: viewerId, projectId: project.id } } }),
      ]);
      hasUpvoted = !!u;
      hasBookmarked = !!b;
    }
    return { ...project, hasUpvoted, hasBookmarked };
  }

  private async resolveTechConnect(slugs: string[] = []) {
    const clean = [...new Set(slugs.map(normSlug).filter(Boolean))].slice(0, 8);
    const out: { techId: string }[] = [];
    for (const slug of clean) {
      const tech = await this.prisma.tech.upsert({
        where: { slug }, update: {}, create: { slug, name: slug },
      });
      out.push({ techId: tech.id });
    }
    return out;
  }

  async create(ownerId: string, dto: CreateProjectDto) {
    if ((dto.imageUrls ?? []).length > 5) throw new BadRequestException('Max 5 screenshots');
    const slug = slugify(dto.title);
    const techLinks = await this.resolveTechConnect(dto.techSlugs);
    const memberUsernames = [...new Set((dto.memberUsernames ?? []).map((u) => u.trim()).filter(Boolean))].slice(0, 10);

    const members: { userId: string; role: 'OWNER' | 'MEMBER' }[] = [{ userId: ownerId, role: 'OWNER' }];
    for (const username of memberUsernames) {
      const u = await this.prisma.user.findUnique({ where: { username } });
      if (u && u.id !== ownerId) members.push({ userId: u.id, role: 'MEMBER' });
    }

    const project = await this.prisma.project.create({
      data: {
        title: dto.title, slug, tagline: dto.tagline, descriptionMd: dto.descriptionMd,
        githubUrl: dto.githubUrl, demoUrl: dto.demoUrl ?? null,
        coverImageUrl: dto.coverImageUrl ?? dto.imageUrls?.[0] ?? null,
        ownerId,
        techs: { create: techLinks.map((t) => ({ techId: t.techId })) },
        images: { create: (dto.imageUrls ?? []).slice(0, 5).map((url, i) => ({ url, sortOrder: i })) },
        members: { create: members },
      },
      include: CARD_INCLUDE,
    });
    return project;
  }

  private async assertCanEdit(projectId: string, userId: string, isAdmin: boolean) {
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const isOwner = project.ownerId === userId || membership?.role === 'OWNER';
    if (!isOwner && !isAdmin) throw new ForbiddenException('Only owners or admins can edit');
    return project;
  }

  async update(projectId: string, user: any, dto: UpdateProjectDto) {
    await this.assertCanEdit(projectId, user.id, user.role === 'ADMIN');
    if ((dto.imageUrls ?? []).length > 5) throw new BadRequestException('Max 5 screenshots');
    const data: any = {};
    for (const k of ['title', 'tagline', 'descriptionMd', 'githubUrl', 'demoUrl', 'coverImageUrl'] as const) {
      if ((dto as any)[k] !== undefined) data[k] = (dto as any)[k];
    }
    if (dto.techSlugs !== undefined) {
      await this.prisma.projectTech.deleteMany({ where: { projectId } });
      const links = await this.resolveTechConnect(dto.techSlugs);
      if (links.length) {
        await this.prisma.projectTech.createMany({ data: links.map((l) => ({ projectId, techId: l.techId })) });
      }
    }
    if (dto.imageUrls !== undefined) {
      await this.prisma.projectImage.deleteMany({ where: { projectId } });
      if (dto.imageUrls.length) {
        await this.prisma.projectImage.createMany({
          data: dto.imageUrls.slice(0, 5).map((url, i) => ({ projectId, url, sortOrder: i })),
        });
        if (!data.coverImageUrl) data.coverImageUrl = dto.imageUrls[0];
      }
    }
    return this.prisma.project.update({ where: { id: projectId }, data, include: CARD_INCLUDE });
  }

  async remove(projectId: string, user: any) {
    await this.assertCanEdit(projectId, user.id, user.role === 'ADMIN');
    await this.prisma.project.delete({ where: { id: projectId } });
    return { ok: true };
  }

  async toggleUpvote(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const existing = await this.prisma.upvote.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) {
      await this.prisma.$transaction([
        this.prisma.upvote.delete({ where: { userId_projectId: { userId, projectId } } }),
        this.prisma.project.update({ where: { id: projectId }, data: { upvoteCount: { decrement: 1 } } }),
      ]);
      const fresh = await this.prisma.project.findUnique({ where: { id: projectId }, select: { upvoteCount: true } });
      return { upvoted: false, upvoteCount: Math.max(0, fresh?.upvoteCount ?? 0) };
    }
    await this.prisma.$transaction([
      this.prisma.upvote.create({ data: { userId, projectId } }),
      this.prisma.project.update({ where: { id: projectId }, data: { upvoteCount: { increment: 1 } } }),
    ]);
    const fresh = await this.prisma.project.findUnique({ where: { id: projectId }, select: { upvoteCount: true } });
    return { upvoted: true, upvoteCount: fresh?.upvoteCount ?? 1 };
  }

  async toggleBookmark(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (existing) {
      await this.prisma.bookmark.delete({ where: { userId_projectId: { userId, projectId } } });
      return { bookmarked: false };
    }
    await this.prisma.bookmark.create({ data: { userId, projectId } });
    return { bookmarked: true };
  }

  async myBookmarks(userId: string, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.prisma.bookmark.findMany({
        where: { userId }, include: { project: { include: CARD_INCLUDE } },
        orderBy: { createdAt: 'desc' }, skip, take: limit,
      }),
      this.prisma.bookmark.count({ where: { userId } }),
    ]);
    return { items: rows.map((r: any) => r.project), total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  async addMember(projectId: string, actor: any, username: string) {
    await this.assertCanEdit(projectId, actor.id, actor.role === 'ADMIN');
    const u = await this.prisma.user.findUnique({ where: { username } });
    if (!u) throw new NotFoundException('User not found');
    await this.prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: u.id } },
      update: { role: 'MEMBER' },
      create: { projectId, userId: u.id, role: u.id === actor.id ? 'OWNER' : 'MEMBER' },
    });
    return { ok: true };
  }

  async removeMember(projectId: string, actor: any, userId: string) {
    const project = await this.assertCanEdit(projectId, actor.id, actor.role === 'ADMIN');
    if (userId === project.ownerId) throw new BadRequestException('Cannot remove the owner');
    await this.prisma.projectMember.deleteMany({ where: { projectId, userId } });
    return { ok: true };
  }
}
