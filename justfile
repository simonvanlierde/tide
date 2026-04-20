set dotenv-load

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
