import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );
  // FRONTEND_URL may be a comma-separated list (prod Vercel URL + local dev).
  // Always allow local dev hosts + Vercel preview deploys alongside it.
  // Missing ACAO header = browser "Failed to fetch" on POST, so keep this permissive for our frontends.
  const frontends = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: [
      ...frontends,
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
  });
  // Render/Heroku inject PORT; local dev uses API_PORT.
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}/api/v1`);
}
bootstrap();
