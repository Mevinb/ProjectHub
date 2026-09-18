import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Controller('projects')
export class ProjectsController {
  constructor(
    private projects: ProjectsService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Get()
  list(@Query() q: QueryProjectsDto) {
    return this.projects.list(q);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projects.create(user.id, dto);
  }

  @Get(':idOrSlug')
  async get(@Param('idOrSlug') idOrSlug: string, @Req() req: Request) {
    // Optional auth: decode bow_token/Bearer if present so hasUpvoted/hasBookmarked resolve.
    let viewer: string | undefined = (req as any).user?.id;
    if (!viewer) {
      try {
        const cookieToken = (req as any).cookies?.['bow_token'] as string | undefined;
        const header = req.headers.authorization;
        const token = cookieToken ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined);
        if (token) {
          const payload = await this.jwt.verifyAsync(token);
          viewer = (payload as any).sub;
        }
      } catch {
        viewer = undefined;
      }
    }
    return this.projects.get(idOrSlug, viewer);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projects.remove(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/upvote')
  upvote(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projects.toggleUpvote(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  bookmark(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projects.toggleBookmark(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/members')
  addMember(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { username: string }) {
    return this.projects.addMember(id, user, body.username);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: any) {
    return this.projects.removeMember(id, user, userId);
  }
}

@Controller('bookmarks')
export class BookmarksController {
  constructor(private projects: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.projects.myBookmarks(user.id, Number(page ?? 1), Number(limit ?? 12));
  }
}
