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
- `/termos-de-uso`: termos de uso do sistema
- `/politica-de-privacidade`: politica de privacidade
- `/app`: dashboard inicial com sidebar
- `/app/membros`: modulo de membros
- `/app/financeiro`: modulo financeiro
- `/app/doacoes`: objetivos de doacao via Pix para o portal dos membros
- `/app/eventos`: modulo de eventos e escalas
- `/app/comunicados`: comunicados publicados no portal dos membros
- `/app/relatorios`: placeholder de relatorios
- `/portal`: resumo do portal do membro
- `/portal/perfil`: dados do membro
- `/portal/comunicados`: comunicados publicados
- `/portal/doacoes`: objetivos de doacao via Pix
- `/portal/escalas`: escalas do obreiro/membro
- `/portal/eventos`: calendario dos proximos eventos

O cadastro da igreja, a ativacao de acesso de membro e o primeiro acesso de usuarios antigos exigem aceite dos Termos de Uso e da Politica de Privacidade vigentes.
