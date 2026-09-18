import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

/**
 * Screenshot storage with two drivers (controllers only depend on save()):
 * - local (default): disk under UPLOAD_DIR, served by GET /uploads/:filename.
 *   Fine for laptop/docker dev. Ephemeral on Render free tier.
 * - supabase: Supabase Storage bucket (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   + SUPABASE_BUCKET). Use for Render/Vercel deploys so images survive restarts.
 *   Returns the bucket's public URL; make the bucket PUBLIC in Supabase dashboard.
 */
@Injectable()
export class UploadsService {
  private dir: string;
  private driver: string;
  private supabaseUrl: string;
  private supabaseKey: string;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.dir = config.get<string>('uploadDir') ?? './data/uploads';
    this.driver = (config.get<string>('storageDriver') ?? 'local').toLowerCase();
    this.supabaseUrl = config.get<string>('supabase.url') ?? '';
    this.supabaseKey = config.get<string>('supabase.serviceRoleKey') ?? '';
    this.bucket = config.get<string>('supabase.bucket') ?? 'screenshots';
    if (this.driver !== 'supabase') {
      try {
        mkdirSync(this.dir, { recursive: true });
      } catch {
        // Render free disks / read-only CWD shouldn't crash boot; uploads will error loudly instead.
      }
    }
  }

  private get useSupabase() {
    return this.driver === 'supabase' && !!this.supabaseUrl && !!this.supabaseKey;
  }

  async save(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    const ext = extname(file.originalname).toLowerCase() || '.png';
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

    if (this.useSupabase) {
      // Lazy import so local dev never pays for the SDK at boot.
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(this.supabaseUrl, this.supabaseKey);
      const { error } = await supabase.storage
        .from(this.bucket)
        .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });
      if (error) throw new Error(`Supabase upload failed: ${error.message}`);
      const { data } = supabase.storage.from(this.bucket).getPublicUrl(filename);
      return { url: data.publicUrl, filename };
    }

    const full = join(this.dir, filename);
    writeFileSync(full, file.buffer);
    return { url: `/api/v1/uploads/${filename}`, filename };
  }
}
