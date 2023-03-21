# ESLint
### Rules
- `eslint-config-airbnb-base`
- `eslint-config-airbnb-typescript`
### Parser
- `@typescript-eslint/parser`
### Plugins
- `@typescript-eslint`
### parserOptions
- **project**: `./tsconfig.eslint.json`

**Config**: `.eslintrc`

#### Use `yarn lint` to run linter


# TypeScript
## yarn build
Compile project with the given config:

`tsc --project tsconfig.eslint.json`

## yarn start
Run `yarn build` + start script with node:

`yarn build && node ./build/index.js`

## yarn dev
Watch changes in .ts files and run `yarn start` 

Check `nodemon.json`

`nodemon`

## Config
File: `tsconfig.eslint.json`

**outDir**: `./build`

# TypeDoc
## `yarn docs` 

**Cmd**: `typedoc --tsconfig tsconfig.eslint.json && open file://$(pwd)/docs/index.html`

**Config**: `typedoc.json`

**Out dir**: `./docs`

Generate docs with th given config and open link

# .gitignore
- node_modules
- .DS_Store
- **/.DS_Store
- *.js
- docs
- build

# License
MIT