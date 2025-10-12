# qualiH2O — Plataforma de Análises de Água

## 1) Visão rápida
- **Frontend**: React 19 + Vite + Tailwind 4 + React Router 7 + TanStack Query 5 + Recharts.
- **Backend**: Spring Boot 3.5.x (Java 17), HATEOAS, PDFBox (relatório), Flyway (migrations e seeds), Testcontainers (integração).
- **Banco**: PostgreSQL 16-alpine.
- **Entrega/Infra**: Docker Compose orquestrando **frontend (Nginx + SPA + proxy /api)**, **backend** e **db**.
- **Autenticação**: JWT via header `Authorization: Bearer <token>`.

## 2) Arquitetura
```
+---------------------------+           +--------------------------+
| Frontend (Nginx + SPA)    |  /api --> | Backend (Spring Boot)    |
| React 19 / Vite / Tailwind|           | Java 17 / PDFBox / HATEOAS|
+------------+--------------+           +------------+-------------+
             |                                       |
             | static assets                         | JDBC
             v                                       v
        Navegador (SPA)                       PostgreSQL 16
```
**Proxy reverso**: o Nginx serve o SPA e encaminha `/api` para o backend. O front consome `VITE_API_URL=/api`

## 3) Requisitos
- Docker e Docker Compose instalados.

## 4) Subir o ambiente (Docker Compose)
> Estrutura típica de pastas:
>
> ```
> /qualiH2OBackend
> /qualiH2OFrontend
> /qualiH2OInfra  
> README.md
> ```

1. **Copie as variáveis de ambiente**:
   ```bash
   cp infra/.env.example infra/.env
   # ou
   cp qualiH2OInfra/.env.example qualiH2OInfra/.env
   ```
2. **Suba os serviços**:
   ```bash
   # Na Raiz do projeto
   docker compose -f qualiH2OInfra/docker-compose.yml --env-file qualiH2OInfra/.env up -d --build
   # Dentro de qualiH2OInfra
   docker compose --env-file .env up --build -d
   ```
3. **Acesse**:
   - Site : `http://localhost:8080` 
   - Login: 01234567
   - Senha: Senha1234
   
## 5) Fluxos principais
- **Login** → recebe **JWT** → front armazena token e envia em `Authorization: Bearer`.
- **Dashboard** → cards + gráficos (Recharts) com métricas agregadas.
- **Análises** → CRUD + filtros + aceite de amostra + download de **PDF**.

---

## 6) API (amostra de endpoints)

### Rota de autenticação
- `POST /api/v1/auth/signin` → autentica e retorna JWT.
### Rota de CRUD análises
- `GET /api/v1/analises?page=0&size=10&sort=horaDaAmostragem,DESC` → paginação.
- `POST /api/v1/analises/` → cria análise.
- `PUT /api/v1/analises/{id}` → atualiza.
- `DELETE /api/v1/analises/{id}` → remove.
- `GET /api/v1/analises/{id}/relatorio` → **PDF** (PDFBox).
### Rota de dados para o dashboard
- `GET /api/v1/dashboard/cards` → abertas, total, médias (pH/condutância/turbidez)
- `GET /api/v1/dashboard/status` → análises aprovadas e reprovadas
- `GET /api/v1/dashboard/series` → séries diárias das análises

**Status e erros previsíveis**: `400` (entrada inválida), `401` (token ausente/expirado), `404` (não encontrado), `500` (erro interno). O front trata `401` limpando token e redirecionando para login.
