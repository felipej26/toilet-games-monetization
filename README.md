# Toilet Games Monetization

Dashboard Next.js para acompanhar ganhos da AdMob em BRL, com autenticação via Firebase Auth (Google Sign-In) e deploy no Firebase App Hosting.

## Funcionalidades

- Ganhos de hoje
- Ganhos de ontem
- Ganhos do mês atual
- Ganhos do mês passado
- Ganhos do mês atual separados por app
- Valores exibidos em BRL (`pt-BR`)
- Cache de 15 minutos para reduzir chamadas à API AdMob

## Stack

- Next.js (App Router)
- Firebase Auth + Firebase App Hosting
- AdMob API (`networkReport:generate`)
- Tailwind CSS

## Pré-requisitos

1. Projeto Firebase no plano **Blaze**
2. Conta AdMob com acesso ao publisher ID
3. AdMob API habilitada no Google Cloud Console
4. OAuth 2.0 Client ID (Web application)
5. Node.js 20+

## Configuração local

1. Clone o repositório:

```bash
git clone https://github.com/felipej26/toilet-games-monetization.git
cd toilet-games-monetization
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha as variáveis em `.env.local`:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_FIREBASE_*` | Config do app Web no Firebase Console |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `ADMOB_PUBLISHER_ID` | Publisher ID (ex: `pub-9622382276517695`) |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth Client ID do Google Cloud |
| `GOOGLE_OAUTH_CLIENT_SECRET` | OAuth Client Secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Refresh token obtido no passo abaixo |
| `ALLOWED_EMAILS` | E-mails autorizados, separados por vírgula |

4. Obtenha o refresh token da AdMob API (one-time):

```bash
npm run get-refresh-token
```

- Adicione `http://localhost:42813/oauth2callback` como redirect URI no OAuth Client
- Abra a URL exibida no terminal
- Autorize com a conta Google que tem acesso à AdMob
- Copie o refresh token para `GOOGLE_OAUTH_REFRESH_TOKEN`

5. Habilite o Google Sign-In no Firebase Console:

- Authentication → Sign-in method → Google → Enable
- Adicione o domínio autorizado (localhost para dev)

6. Rode o projeto:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Deploy no Firebase App Hosting

### 1. Configurar secrets

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest use <SEU_FIREBASE_PROJECT_ID>

npx -y firebase-tools@latest apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
npx -y firebase-tools@latest apphosting:secrets:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
npx -y firebase-tools@latest apphosting:secrets:set NEXT_PUBLIC_FIREBASE_PROJECT_ID
npx -y firebase-tools@latest apphosting:secrets:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
npx -y firebase-tools@latest apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
npx -y firebase-tools@latest apphosting:secrets:set NEXT_PUBLIC_FIREBASE_APP_ID
npx -y firebase-tools@latest apphosting:secrets:set GOOGLE_OAUTH_CLIENT_ID
npx -y firebase-tools@latest apphosting:secrets:set GOOGLE_OAUTH_CLIENT_SECRET
npx -y firebase-tools@latest apphosting:secrets:set GOOGLE_OAUTH_REFRESH_TOKEN
npx -y firebase-tools@latest apphosting:secrets:set ALLOWED_EMAILS
```

### 2. Criar backend App Hosting

```bash
npx -y firebase-tools@latest apphosting:backends:create \
  --backend toilet-games-monetization \
  --primary-region us-central1
```

Conecte o repositório GitHub no Firebase Console para deploy automático a cada push na branch `main`.

### 3. Deploy manual (opcional)

```bash
npx -y firebase-tools@latest deploy
```

## Estrutura principal

```text
app/
  api/
    auth/session/route.ts   # Cria/remove session cookie
    earnings/route.ts       # Retorna KPIs AdMob
  login/page.tsx
  page.tsx
components/
lib/
  admob/                    # Cliente e relatórios AdMob
  firebase/                 # Firebase client + admin
scripts/
  get-refresh-token.ts      # Script one-time OAuth
apphosting.yaml
firebase.json
```

## Segurança

- Login via Google (Firebase Auth)
- Apenas e-mails em `ALLOWED_EMAILS` podem acessar o dashboard
- Credenciais AdMob ficam apenas no servidor (secrets)
- Session cookie HTTP-only para proteção de rotas

## Observações

- A AdMob API **não aceita Service Account** — é necessário OAuth2 com refresh token
- Dados AdMob podem ter atraso de algumas horas em relação ao painel
- Se o refresh token for revogado, execute `npm run get-refresh-token` novamente
