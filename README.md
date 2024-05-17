# How to install

```bash
# clone the repo
git clone https://github.com/Vixuu/sveltekit-lucia-drizzle.git

# change directory
cd sveltekit-lucia-drizzle
```

## Install Bun

The app uses bun:sqlite and Bun.password for hashing. 

Instalation guide can be found here: https://bun.sh/

```bash
# install dependencies
bun install

# generate migrations
bunx drizzle-kit generate

# push migrations
bunx drizzle-kit push
```

## Developing

```bash
bun --bun run dev
```

## Building

To create a production version of your app:

```bash
bun run build
```
