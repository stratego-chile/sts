# Stratego STS

> ⚠️ This application is under development and is not ready for production. Unstable features and changes may be added at any time.

Our Support Ticket System.

## What is this?

A simple support ticket platform that allows you to create and manage support tickets and client-provider communications.
It is a web application that allows you to create projects, tickets and users. I helps you to follow all the lifecycle for each case.

## Development

### Requirements

#### Local tools

- [Node.js](https://nodejs.org/en/) >= 18.0.0
- [PNPM](https://pnpm.io/) >= 8.0.0

#### Optional tools

- [Volta](https://volta.sh/) (recommended) >= 1.0.0 or [FNM](fnm.vercel.app) >= 1.0.0

#### Database

This project will require a Mongo database. You can use a local database or a cloud database. We highly recommend the use of a free cloud Atlas cluster to start developing, once you are ready to go to production you can migrate to a paid cluster.

#### Environment file

The most important part of this application is to correctly setup the environment file based on our example file:

```bash
cp .env.example .env.local
```

#### Secrets and keys

The project configuration is highly key-based, so you will need to generate a set of keys for the application to work. You can use the following command to generate the keys:

```bash
# Generate a 32 character key with OpenSSL
openssl rand -hex 16
```

Or use our open-source [password generator](https://stratego.cl/utilities/password-generator).

#### External services

This project use Google ReCAPTCHA v3 to prevent spam and bots. You will need to create a new site on the [Google ReCAPTCHA admin](https://www.google.com/recaptcha/admin/create) and add the keys to the environment file.

You also will need to add the domains to the allowed domains list on the admin panel.

Then you add the keys to the environment file:

```bash
# .env.local
CAPTCHA_KEY="<public_key>"
CAPTCHA_SECRET="<private_key>"
```

### Running the project

#### Installing dependencies

```bash
# If you are fnm
fnm install pnpm
```

```bash
pnpm install
```

#### Development mode

We have two types, some features require secure context, so you will need to use SSL mode:

```bash
# Ensure you have the ports 3000 and 3001 available, otherwise you will need to change the ports in the script at package.json
pnpm dev:ssl
```

Alternatively, you can use the default mode:

```bash
pnpm dev
```

#### Linting and spell checking

```bash
pnpm lint
```

#### Building the project

```bash
pnpm build
```

#### Deploying the project

Currently we use Vercel, but you can use any other service that supports Next.js >= 13 with app router.

We will provide a container-based deployment in the future.
