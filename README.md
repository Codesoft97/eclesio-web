# eclesio-web

Frontend do Eclesio construido com Next.js, React, TypeScript, Tailwind CSS e Axios.

## Comandos

```bash
npm run dev
npm run build
npm run lint
```

O dev server sobe em `http://localhost:3001` para deixar o backend local livre em `http://localhost:3000`.

## Ambiente

Crie um `.env.local` a partir do `.env.example`:

```text
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

O backend usa cookies httpOnly. Por isso, as requisicoes Axios usam `withCredentials: true`.

Para ativar o PostHog no lançamento, preencha `NEXT_PUBLIC_POSTHOG_KEY` ou `NEXT_PUBLIC_POSTHOG_TOKEN` com a Project API Key pública do projeto, que começa com `phc_`. Configure `NEXT_PUBLIC_POSTHOG_HOST` com o host da mesma região do projeto, por exemplo `https://us.i.posthog.com` ou `https://eu.i.posthog.com`. Se alterar variáveis públicas na Vercel, faça um novo deploy para elas entrarem no bundle do frontend.

## Rotas iniciais

- `/login`: acesso do representante
- `/cadastro`: cadastro da igreja e usuário administrador
- `/app`: dashboard inicial com sidebar
- `/app/membros`: placeholder do módulo de membros
- `/app/dizimos`: placeholder do módulo financeiro
- `/app/eventos`: placeholder de eventos
- `/app/relatorios`: placeholder de relatorios