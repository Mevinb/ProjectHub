import { IsOptional, IsString, IsIn } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryProjectsDto extends PaginationDto {
  @IsOptional() @IsString()
  q?: string;

  // comma-separated slugs: ?tech=react,python
  @IsOptional() @IsString()
  tech?: string;

  @IsOptional() @IsIn(['new', 'top', 'trending'])
  sort?: 'new' | 'top' | 'trending' = 'new';
}
