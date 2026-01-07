.PHONY: install dev build test cli

URL = https://lowess.github.io/hugo-preact-theme

dev:
	npm run dev

install:
	npm install

run:
	npm run dev

build:
	export BASE_URL=$(URL)
	npm run build
	npm run postbuild

test:
	npm run test

cli:
	node ./tools/cli/cli.js
