import { Controller, Post, Get, Body, Res, Req, UseGuards, Patch, Query } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const COOKIE = 'bow_token';

function setCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 3600 * 1000, path: '/',
  });
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private config: ConfigService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.signup(dto);
    setCookie(res, token);
    return { user, token };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(dto);
    setCookie(res, token);
    return { user, token };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, { path: '/' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('github/link')
  linkGithub(@CurrentUser() user: any, @Body() body: { githubUsername: string }) {
    return this.auth.linkGithub(user.id, body.githubUsername);
  }

  // GitHub OAuth entry: redirects when configured, else explains fixture mode
  @Get('github')
  github(@Res() res: Response) {
    const id = this.config.get<string>('github.clientId');
    const cb = this.config.get<string>('github.callbackUrl');
    if (!id) return res.status(501).json({ message: 'GitHub OAuth not configured. Use PATCH /auth/github/link + GET /auth/github/repos instead.' });
    const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(cb ?? '')}&scope=read:user,repo`;
    return res.redirect(url);
  }

  @Get('github/callback')
  githubCallback(@Query('code') _code: string, @Res() res: Response) {
    // Full code-exchange is intentionally deferred; link flow covers MVP without secrets.
    const frontend = this.config.get<string>('frontendUrl');
    return res.redirect(`${frontend}/auth/callback?github=link-required`);
  }

  // Returns fixture repos in MVP (live GitHub API when keys + token provided in future)
  @UseGuards(JwtAuthGuard)
  @Get('github/repos')
  repos(@CurrentUser() user: any, @Req() _req: Request) {
    return this.auth.githubReposFixture(user.githubUsername ?? user.username);
  }
}
