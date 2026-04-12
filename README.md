# CMS Superadmin Workspace

This project is currently focused on the superadmin platform panel only.

Tenant admin, public website rendering, page builder, media manager, and dynamic site builder features are intentionally paused for a later phase. The codebase still keeps tenant provisioning services because the superadmin panel needs to create tenants and prepare their databases.

## Current Scope

Available now:

- Superadmin login
- Superadmin dashboard
- Tenant management from the superadmin panel
- Tenant database provisioning for `managed` and `own` database modes
- Domain and subscription management screens that belong to the platform side
- Tenant bootstrap services for creating the first tenant admin inside a tenant database

Not in the current frontend scope:

- Tenant admin login UI
- Tenant admin dashboard
- Public site renderer
- Page builder
- Media manager
- Dynamic section/theme/template builder

## Tech Stack

Backend:

```txt
cms-api/src/app.js                    Express app and API route mounting
cms-api/src/server.js                 Server bootstrap
cms-api/src/config                    Environment and configuration helpers
cms-api/src/core/superadmin           Superadmin/control DB infrastructure
cms-api/src/core/tenant               Tenant DB connection, migration, and model registry
cms-api/src/core/shared               Shared migration runner utilities
cms-api/src/middlewares               Shared middleware only
cms-api/src/migrations/superadmin     Superadmin/control database migrations
cms-api/src/migrations/tenant         Tenant database migrations
cms-api/src/modules/super-admin       Superadmin features, auth, routes, controllers, middleware, and models
cms-api/src/modules/tenant            Tenant provisioning services and tenant DB models
cms-api/src/scripts/superadmin        Superadmin/control DB scripts
cms-api/src/scripts/tenant            Tenant DB scripts
cms-api/src/utils                     Shared response and JWT utilities
```

Superadmin module layout:

```txt
modules/super-admin/auth              Superadmin auth controller and routes
modules/super-admin/dashboard         Dashboard controller and routes
modules/super-admin/domains           Domain controller and routes
modules/super-admin/subscriptions     Subscription controller and routes
modules/super-admin/tenants           Tenant controller and routes
modules/super-admin/models            Control database Sequelize models
modules/super-admin/middlewares       Superadmin auth middleware
modules/super-admin/routes            Superadmin route aggregator
```

Tenant module layout:

```txt
modules/tenant/models                 Tenant database Sequelize models
modules/tenant/services               Tenant DB provision, migration, and seed services
modules/tenant/middlewares            Tenant auth/context middleware for later tenant APIs
```
Frontend:

- Next.js
- React
- Tailwind CSS

## Backend Setup

Go to the backend folder:

```bash
cd cms-api
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Update `.env` with your MySQL credentials.

Create the control database manually in MySQL:

```sql
CREATE DATABASE cms_control;
```

Run control database migrations:

```bash
npm run migrate:control
```

Create the default superadmin user:

```bash
npm run bootstrap:control
```

Start the backend:

```bash
npm run dev
```

Backend URL:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/health
```

## Frontend Setup

Go to the frontend folder:

```bash
cd cms-web
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env.local
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

```txt
http://localhost:3000
```

## Login

Open:

```txt
http://localhost:3000/
```

Use the superadmin credentials configured by the backend bootstrap script. Default local credentials are usually:

```txt
Email: admin@cms.com
Password: Admin@123
```

After login, the app redirects to:

```txt
http://localhost:3000/superadmin
```

## Tenant Creation Flow From Superadmin

From the superadmin panel:

1. Create a tenant.
2. Choose database type: `managed` or `own`.
3. Enter the tenant admin email and password.
4. For `managed`, the platform creates the tenant database.
5. For `own`, the provided database must already exist and be reachable.
6. Tenant migrations run against the tenant database.
7. The first tenant admin user is seeded into that tenant database.
8. Tenant and database status are updated in the control database.

## Useful Backend Commands

Run control migrations:

```bash
npm run migrate:control
```

Run tenant migrations:

```bash
npm run migrate:tenants
```

Run tenant migrations for one tenant:

```bash
npm run migrate:tenants -- <tenantId>
```

Retry a failed tenant bootstrap:

```bash
npm run bootstrap:tenant:retry -- <tenantId> <adminEmail> <adminPassword>
```

## Folder Structure

Backend:

```txt
cms-api/src/config                  Environment and configuration helpers
cms-api/src/core                    Shared database and tenant connection utilities
cms-api/src/middlewares             Auth and request middleware
cms-api/src/migrations              Control DB and tenant DB migrations
cms-api/src/modules/super-admin     Superadmin features, routes, controllers, auth, and models
cms-api/src/modules/tenant          Tenant provisioning services and tenant DB models
cms-api/src/routes                  Main API route registration
cms-api/src/scripts                 Bootstrap, migration, and retry scripts
cms-api/src/utils                   Shared utilities
```

Superadmin module layout:

```txt
modules/super-admin/auth            Superadmin auth controller and routes
modules/super-admin/dashboard       Dashboard controller and routes
modules/super-admin/domains         Domain controller and routes
modules/super-admin/subscriptions   Subscription controller and routes
modules/super-admin/tenants         Tenant controller and routes
modules/super-admin/models          Control database Sequelize models
modules/super-admin/routes          Superadmin route aggregator
```

Tenant module layout:

```txt
modules/tenant/models               Tenant database Sequelize models
modules/tenant/services             Tenant DB provision, migration, and seed services
```

Frontend:

```txt
cms-web/app                 Next.js app routes
cms-web/components          Shared UI and services
cms-web/context             Auth and superadmin contexts
cms-web/lib                 Shared frontend utilities
```

## Notes

- Superadmin APIs are protected by a superadmin JWT.
- Managed database creation requires the MySQL user to have `CREATE DATABASE` permission.
- Own database mode requires the tenant/client database to already exist.
- Tenant/site builder code has been removed from the active app for now and can be rebuilt later as a separate phase.
- If older local tenant databases already received builder tables from previous migrations, those tables are not dropped automatically. Database cleanup should be done separately and carefully only when required.


