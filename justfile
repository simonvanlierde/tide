set dotenv-load := true

default:
    @just --list

install:
    pnpm install

update:
    pnpm update

dev:
    pnpm dev

build:
    pnpm build

test:
    pnpm test

lint:
    pnpm lint

format:
    pnpm format

clean:
    rm -rf dist/ node_modules/ .next/ coverage/

docker-prod:
    docker compose --profile=tunnel up -d --build

docker-prod-down:
    docker compose --profile=tunnel down

docker-build-prod:
    docker build --target prod .

docker-compose-prod-config:
    CLOUDFLARE_TUNNEL_TOKEN=dry-run docker compose --profile=tunnel config
