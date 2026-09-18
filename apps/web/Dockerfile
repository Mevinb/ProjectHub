FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm install --workspace=apps/web --no-audit --no-fund || npm install --prefix apps/web --no-audit --no-fund
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
