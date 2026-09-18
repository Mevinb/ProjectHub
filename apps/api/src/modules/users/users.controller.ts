import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.users.getByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentUser() user: any, @Body() body: any) {
    const allowed: any = {};
    for (const k of ['name', 'bio', 'avatarUrl', 'year', 'branch', 'linkedinUrl']) {
      if (body[k] !== undefined) allowed[k] = body[k];
    }
    return this.users.updateMe(user.id, allowed);
  }
}
