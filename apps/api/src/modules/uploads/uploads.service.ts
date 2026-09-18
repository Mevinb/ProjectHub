import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';

/**
 * Local-disk storage for MVP. Swap to S3 by branching on STORAGE_DRIVER here —
 * controllers only depend on save()/publicUrl(), so no other file changes.
 */
@Injectable()
export class UploadsService {
  private dir: string;
  constructor(private config: ConfigService) {
    this.dir = config.get<string>('uploadDir') ?? './data/uploads';
    mkdirSync(this.dir, { recursive: true });
  }

  save(file: Express.Multer.File): { url: string; filename: string } {
    const ext = extname(file.originalname).toLowerCase() || '.png';
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const full = join(this.dir, filename);
    require('fs').writeFileSync(full, file.buffer);
    return { url: `/api/v1/uploads/${filename}`, filename };
  }
}
