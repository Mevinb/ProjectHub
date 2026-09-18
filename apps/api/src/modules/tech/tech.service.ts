import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class TechService {
  constructor(private prisma: PrismaService) {}

  list(q?: string) {
    return this.prisma.tech.findMany({
      where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }] } : undefined,
      orderBy: { name: 'asc' }, take: 50,
    });
  }

  top() {
    // most-used techs by project count
    return this.prisma.tech.findMany({
      include: { _count: { select: { projects: true } } },
      orderBy: { projects: { _count: 'desc' } }, take: 20,
    });
  }
}
