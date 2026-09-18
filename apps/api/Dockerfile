FROM node:22-alpine AS base
WORKDIR /app
COPY package.json pnpm-workspace.yaml* ./
COPY apps/api/package.json ./apps/api/package.json
RUN npm install --workspace=apps/api --no-audit --no-fund || npm install --prefix apps/api --no-audit --no-fund
COPY apps/api ./apps/api
COPY tsconfig.base.json nest-cli.json ./
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
