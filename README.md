## Introduction
Welcome to my little cute event tracking bot!

**Features**
- leetcode daily challenge (auto date lookup)

**Dependencies**
- Bun
- Docker

**Bun scripts** 
- `init:check`: check all stupid settings and tell you what might go wrong
- `check:dockerignore`: worry-free check what files are not included in docker,
- `test:dev`: if you want to run a test in dev (not in docker)
- `test:prod`: only used by docker daemon and no human being uses this
- `dev:migrate`: run this if you changed the database schema
- `dev:postgres`: pull up a postgres container on the local machine
- `dev`: run the bot **without using** docker
- `dev:docker`: run the bot **in** docker
- `dev:docker:stop`: stop the bot in docker
- `deploy`: deploy to server, literally
- `prod:entry`: only used by docker daemon and no human being uses this

## Troubleshooting
### Config tree
```sh
config
├── dev
│   ├── compose.yaml
│   └── .env  # from `.env.template`
├── postgres
│   └── .env  # postgres config variables & database url
├── postgres_dev
│   ├── compose.yaml
│   └── .env
└── production
    ├── compose.yaml
    └── .env  # from `.env.template`
```

### Cannot connect to database in local testing
Make sure that the `.env.test` file includes
```sh
$ cat .env.test 
DATABASE_URL="postgresql:..."
```

### My application does not connect to postgres in another container
Just run `bun dev:docker` again and it will resolve once the database has been initialized.