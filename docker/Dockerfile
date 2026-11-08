# ---- Stage 1: Build ----
# NOTA (nov/2026): Node 22 (LTS). O Node 20 saiu de suporte em 30/04/2026, e o
# projeto é testado no 22 (o mesmo do modelo comentado no devcontainer.json).
FROM node:22-slim AS base

WORKDIR /app

# apt install
# NOTA (nov/2026): antes do yarn install, para uma mudança no package.json não
# refazer esta camada; apt-get e sem a lista do apt na imagem, como no
# Dockerfile do backend.
RUN apt-get update \
    && apt-get install -y curl git fish neovim \
    && rm -rf /var/lib/apt/lists/*

# Copy only dependency files first to leverage Docker cache
COPY package.json yarn.lock ./

# Set Yarn cache folder and install dependencies
ENV YARN_CACHE_FOLDER=/usr/local/share/.yarn-cache
# NOTA (nov/2026): --immutable é do Yarn 2+; o Yarn 1 da imagem ignorava a opção
# e podia instalar fora do yarn.lock. No Yarn 1, a trava é --frozen-lockfile. O
# --network-timeout evita o ESOCKETTIMEDOUT dos pacotes grandes (ex.: lucide-react).
RUN mkdir -p $YARN_CACHE_FOLDER && yarn install --frozen-lockfile --network-timeout 600000

# Copy the rest of the project and build
COPY . .

# ---- build stage (production build) ----
FROM base AS build
# run build (produces /app/dist): tsc -b (código sem tipo barra o build) e vite build
RUN yarn build

# ---- prod stage (lightweight runtime) ----
FROM node:22-slim AS prod
WORKDIR /app

# NOTA (nov/2026): o serve entra na imagem, numa versão fixa. Com o `npx serve`,
# cada container novo baixava a versão mais recente do npm ao subir: sem acesso
# ao npm naquele momento, o front não subia.
RUN npm install -g serve@14.2.4

# copy only dist from build stage (no source, minimal)
COPY --from=build /app/dist /app/dist

# NOTA (nov/2026): os headers de segurança e de cache do servidor estático
# (docker/serve.json): a página não abre dentro de iframe de outro site
# (frame-ancestors, que não vale na <meta> da CSP), os arquivos de assets/
# (com hash no nome) ficam no cache por um ano e o index.html é sempre
# conferido, para um deploy novo valer na hora.
COPY docker/serve.json /app/serve.json

# Lightweight static server; -s: unknown routes get index.html (React Router)
CMD ["serve", "-s", "dist", "-l", "5173", "-c", "/app/serve.json"]
