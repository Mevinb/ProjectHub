import { IsString, IsOptional, IsUrl, IsArray, ArrayMaxSize, MinLength, MaxLength, Matches } from 'class-validator';
import { GITHUB_RE } from './create-project.dto';

export class UpdateProjectDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(80)
  title?: string;

  @IsOptional() @IsString() @MinLength(10) @MaxLength(140)
  tagline?: string;

  @IsOptional() @IsString() @MinLength(20) @MaxLength(20000)
  descriptionMd?: string;

  @IsOptional() @IsString() @Matches(GITHUB_RE, { message: 'githubUrl must be like https://github.com/owner/repo' })
  githubUrl?: string;

  @IsOptional() @IsUrl({ require_protocol: true })
  demoUrl?: string;

  @IsOptional() @IsString()
  coverImageUrl?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(8) @IsString({ each: true })
  techSlugs?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true })
  imageUrls?: string[];
}
