## AZV Coffee Admin

Admin panel built with React + Vite + MUI.

### Requirements

- Node.js >= 20
- Package manager: yarn or npm

### Environment

Copy `.env.example` to `.env` and set variables:

```
VITE_APP_NAME=AZV Coffee Admin
VITE_API_BASE_URL=https://api.example.com
```

### Commands

- Install: `yarn install` or `npm install`
- Dev: `yarn dev` or `npm run dev` (http://localhost:3039)
- Build: `yarn build` or `npm run build` (outputs to `dist/`)
- Preview build: `yarn start` or `npm run start`
- Clean: `yarn clean` or `npm run clean`

### Deployment

- Static SPA build (`dist/`). Any static host works (Vercel/Netlify/Nginx/S3).
- Vercel: `vercel.json` includes SPA rewrites.
- Ensure environment variables are set in hosting provider as Vite envs (`VITE_*`).

### Notes

- Project is marked `private` to avoid accidental npm publish.
- Sensitive data should be in env only; `.gitignore` ignores `.env*` files.
