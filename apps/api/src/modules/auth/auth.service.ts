import {
  Injectable, BadRequestException, ForbiddenException, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { isAllowedEmail, getEmailDomain } from './college-domain.util';

function sanitize(user: any) {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  private sign(userId: string) {
    return this.jwt.sign({ sub: userId });
  }

  private checkDomain(email: string) {
    const domains = this.config.get<string[]>('allowedEmailDomains') ?? [];
    const overrides = this.config.get<string[]>('allowedEmailOverrides') ?? [];
    if (!isAllowedEmail(email, domains, overrides)) {
      throw new ForbiddenException(
        `Only college emails allowed (${domains.join(', ') || 'none configured'}). Ask admin to allowlist you.`,
      );
    }
  }

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();
    this.checkDomain(email);
    const [byEmail, byUsername] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { username: dto.username } }),
    ]);
    if (byEmail) throw new ConflictException('Email already registered. Try login.');
    if (byUsername) throw new ConflictException('Username taken. Try another, e.g. rama_2026.');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email, emailDomain: getEmailDomain(email),
        username: dto.username, name: dto.name, passwordHash,
      },
    });
    return { user: sanitize(user), token: this.sign(user.id) };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    return { user: sanitize(user), token: this.sign(user.id) };
  }

  async linkGithub(userId: string, githubUsername: string) {
    if (!githubUsername || !/^[a-zA-Z0-9-]+$/.test(githubUsername)) {
      throw new BadRequestException('Invalid GitHub username');
    }
    const user = await this.prisma.user.update({
      where: { id: userId }, data: { githubUsername },
    });
    return sanitize(user);
  }

  githubReposFixture(username: string) {
    const base = (username || 'student').toLowerCase();
    return [
      { name: `${base}-project`, html_url: `https://github.com/${base}/${base}-project`, description: 'My course project', stargazers_count: 3, language: 'TypeScript' },
      { name: `${base}-ml`, html_url: `https://github.com/${base}/${base}-ml`, description: 'ML mini project', stargazers_count: 1, language: 'Python' },
      { name: `${base}-iot`, html_url: `https://github.com/${base}/${base}-iot`, description: 'IoT hackathon build', stargazers_count: 0, language: 'C++' },
    ];
  }
}
