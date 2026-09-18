import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

function sanitize(u: any) {
  const { passwordHash: _p, ...rest } = u;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');
    const [owned, contributing, upvotesGiven] = await Promise.all([
      this.prisma.project.findMany({
        where: { ownerId: user.id, isPublished: true },
        include: { techs: { include: { tech: true } } },
        orderBy: { createdAt: 'desc' }, take: 24,
      }),
      this.prisma.projectMember.findMany({
        where: { userId: user.id, role: 'MEMBER' },
        include: { project: { include: { techs: { include: { tech: true } } } } },
        take: 24,
      }),
      this.prisma.upvote.count({ where: { userId: user.id } }),
    ]);
    return {
      user: sanitize(user),
      owned,
      contributing: contributing.map((m: any) => m.project),
      stats: { owned: owned.length, contributing: contributing.length, upvotesGiven },
    };
  }

  async updateMe(userId: string, dto: { name?: string; bio?: string; avatarUrl?: string; year?: number; branch?: string; linkedinUrl?: string }) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto });
    return sanitize(user);
  }
}
