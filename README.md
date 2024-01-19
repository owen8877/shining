# shining

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.23. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Deployment
Make sure that the `.env.production` file contains `TELEGRAM_BOT_TOKEN=...`, then run
```bash
docker context create remote --docker "host=ssh://username@host"  # Add docker remote context
bun remote-deploy
```