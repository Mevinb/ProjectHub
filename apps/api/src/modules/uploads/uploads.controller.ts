import {
  Controller, Post, UseGuards, UseInterceptors, UploadedFile,
  BadRequestException, Get, Param, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService, private config: ConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED.has(file.mimetype)) return cb(new BadRequestException('Only jpg/png/webp allowed') as any, false);
      cb(null, true);
    },
  }))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file. Max 5MB, jpg/png/webp.');
    return this.uploads.save(file);
  }

  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() res: Response) {
    if (filename.includes('..') || filename.includes('/')) throw new BadRequestException('Bad filename');
    const dir = this.config.get<string>('uploadDir') ?? './data/uploads';
    const full = join(process.cwd(), dir, filename);
    if (!existsSync(full)) return res.status(404).json({ message: 'Not found' });
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return createReadStream(full).pipe(res);
  }
}
