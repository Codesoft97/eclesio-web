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

## Rotas iniciais

- `/login`: acesso do representante
- `/cadastro`: cadastro da igreja e usuario administrador
- `/app`: dashboard inicial com sidebar
- `/app/membros`: placeholder do modulo de membros
- `/app/dizimos`: placeholder do modulo financeiro
- `/app/eventos`: placeholder de eventos
- `/app/relatorios`: placeholder de relatorios