import {
  IsString, IsOptional, IsUrl, IsArray, ArrayMaxSize, MinLength, MaxLength, Matches,
} from 'class-validator';

export const GITHUB_RE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export class CreateProjectDto {
  @IsString() @MinLength(3) @MaxLength(80)
  title!: string;

  @IsString() @MinLength(10) @MaxLength(140)
  tagline!: string;

  @IsString() @MinLength(20) @MaxLength(20000)
  descriptionMd!: string;

  @IsString() @Matches(GITHUB_RE, { message: 'githubUrl must be like https://github.com/owner/repo' })
  githubUrl!: string;

  @IsOptional() @IsUrl({ require_protocol: true })
  demoUrl?: string;

  @IsOptional() @IsString()
  coverImageUrl?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(8)
  @IsString({ each: true })
  techSlugs?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(5)
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(10)
  @IsString({ each: true })
  memberUsernames?: string[];
}
