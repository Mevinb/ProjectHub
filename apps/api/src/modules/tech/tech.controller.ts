import { Controller, Get, Query } from '@nestjs/common';
import { TechService } from './tech.service';

@Controller('tech')
export class TechController {
  constructor(private tech: TechService) {}

  @Get()
  list(@Query('q') q?: string) {
    if (q === '__top') return this.tech.top();
    return this.tech.list(q);
  }
}
