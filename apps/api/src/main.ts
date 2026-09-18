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
  const frontend = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  // Allow localhost + 127.0.0.1 on any port (dev opens either) plus configured FRONTEND_URL.
  // Without this, browsers on http://127.0.0.1:3000 get no ACAO header -> "Failed to fetch" on POST.
  app.enableCors({
    origin: [frontend, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/],
    credentials: true,
  });
  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}/api/v1`);
}
bootstrap();
