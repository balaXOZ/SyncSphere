FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js needs NEXT_PUBLIC_ env vars at build time (they are inlined into the client bundle)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAdgDJj82-JgebmIjW760cOoyNz6Ut6y_g
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=syncsphere-e69ae.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=syncsphere-e69ae
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=syncsphere-e69ae.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=83320743375
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:83320743375:web:efcff2a620d0184161deba

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
