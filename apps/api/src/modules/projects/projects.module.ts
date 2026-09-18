import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from './projects.service';
import { ProjectsController, BookmarksController } from './projects.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret'),
      }),
    }),
  ],
  controllers: [ProjectsController, BookmarksController],
  providers: [ProjectsService, PrismaService],
})
export class ProjectsModule {}
