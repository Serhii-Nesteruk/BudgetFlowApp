# BudgetFlow

## Deploy

The site is deployed with Docker Compose from the repository root.

### 1. Prepare the server

Install Docker and Docker Compose on the server, then clone the repository:

```bash
git clone <repository-url>
cd BudgetFlowApp-monorepo
```

### 2. Create environment variables

Create a `.env` file in the repository root:

```env
POSTGRES_DB=budgetflow
POSTGRES_USER=budgetflow_user
POSTGRES_PASSWORD=change_this_password
JWT_KEY=change_this_to_a_long_secure_secret_key
```

Use strong production values for `POSTGRES_PASSWORD` and `JWT_KEY`.

### 3. Configure allowed origins

In `docker-compose.yml`, update the API CORS origins for the production host:

```yaml
Cors__AllowedOrigins__0: http://SERVER_IP
Cors__AllowedOrigins__1: https://domain.com
```

Use the real server IP address or domain name.

### 4. Build and start

Run:

```bash
docker compose up -d --build
```

The frontend is served on port `80`. API requests from the frontend are proxied through `/api` to the backend container.

### 5. Check deployment

Open:

```text
http://SERVER_IP
```

## License

This project is distributed under the BudgetFlow Non-Commercial License, Version 1.0.

Commercial use is not allowed without prior written permission from the copyright holder.

See the full license text in [LICENSE](LICENSE).
