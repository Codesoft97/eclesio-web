# gerencia-igreja-web

Frontend do Gerencia Igreja construido com Next.js, React, TypeScript, Tailwind CSS e Axios.

## Comandos

```bash
npm run dev
npm run build
npm run lint
```

O dev server sobe em `http://localhost:3001` para deixar o backend local livre em `http://localhost:5000`.

## Ambiente

Crie um `.env.local` a partir do `.env.example`:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000/api
BACKEND_API_URL=http://localhost:5000
```

Em desenvolvimento, o Axios usa `NEXT_PUBLIC_API_URL` diretamente.

Em producao, o frontend chama `/api` no proprio dominio do Next/Vercel. O `next.config.ts` faz rewrite para `BACKEND_API_URL` ou, como fallback, para `NEXT_PUBLIC_API_URL`. Isso evita que o cookie HttpOnly do backend dependa de cookie third-party entre `vercel.app` e `onrender.com`.

Na Vercel, configure preferencialmente:

```text
BACKEND_API_URL=https://gerencia-igreja-service.onrender.com
```

Depois de alterar variaveis de ambiente na Vercel, faca um novo deploy para o bundle receber as mudancas.

O backend usa cookies HttpOnly. Por isso, as requisicoes Axios usam `withCredentials: true`.

Para ativar o PostHog no lancamento, preencha `NEXT_PUBLIC_POSTHOG_KEY` ou `NEXT_PUBLIC_POSTHOG_TOKEN` com a Project API Key publica do projeto, que comeca com `phc_`. Configure `NEXT_PUBLIC_POSTHOG_HOST` com o host da mesma regiao do projeto, por exemplo `https://us.i.posthog.com` ou `https://eu.i.posthog.com`.

## Rotas iniciais

- `/login`: acesso do representante
- `/membros/convite/:token`: ativacao do acesso de membro por convite
- `/cadastro`: cadastro da igreja e usuario administrador
- `/app`: dashboard inicial com sidebar
- `/app/membros`: modulo de membros
- `/app/financeiro`: modulo financeiro
- `/app/eventos`: modulo de eventos e escalas
- `/app/comunicados`: comunicados publicados no portal dos membros
- `/app/relatorios`: placeholder de relatorios
- `/portal`: portal do membro com perfil, comunicados, eventos e escalas
