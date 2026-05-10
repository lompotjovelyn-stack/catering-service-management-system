# Catering Service Management System

Node.js, Express, MySQL, Sequelize, JWT, and bcrypt backend for a catering service management system.

## Modules

- Customer: register/login, check date availability, create orders, view booking status, request cancellation with a reason
- Catering staff: create/edit orders, settle billings, cancel orders, and approve or reject customer cancellation requests
- Admin: handle everything in the system, including full CRUD for users, bookings, menu, inventory, vendors, reports, audit logs, and settings
- Vendor: register/login and manage supplier profile
- Authentication: JWT tokens with bcrypt password hashing
- Booking management: availability checks, approval/rejection, staff assignment, cancellation
- Inventory management: stock tracking, vendor linkage, low-stock reporting
- Reports: booking, inventory, and user role summaries

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create the MySQL database in phpMyAdmin:

```sql
CREATE DATABASE cateringdb;
```

You can also import `database/schema.sql` in phpMyAdmin to create the full table structure manually.

3. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

4. Start the API:

```bash
npm run dev
```

5. Create the default admin, staff, and customer accounts:

```bash
npm run seed:accounts
```

6. Add sample menu records:

```bash
npm run seed:menu
```

By default this creates these accounts:

- Admin: `admin@catering.local` / `Admin12345!`
- Staff: `staff@catering.local` / `Staff12345!`
- Customer: `customer@catering.local` / `Customer12345!`

Set `ADMIN_*`, `STAFF_*`, and `CUSTOMER_*` values in `.env` before seeding if you want custom credentials.

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/users` admin only
- `GET /api/bookings/availability?date=2026-06-01`
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `PATCH /api/bookings/:id/status` staff/admin
- `POST /api/bookings/:id/cancel-request` customer only
- `PATCH /api/bookings/:id/cancel-request` staff/admin
- `PATCH /api/bookings/:id/billing` staff/admin
- `DELETE /api/bookings/:id` customer submits cancellation request with reason; staff/admin cancels immediately
- `GET /api/menu`
- `POST /api/menu` admin only
- `GET /api/inventory` admin/staff
- `GET /api/inventory/low-stock` admin/staff
- `GET /api/vendors` admin/staff
- `GET /api/vendors/me` vendor only
- `GET /api/admin/dashboard` admin only
- `GET /api/admin/users` admin only
- `GET /api/admin/audit-logs` admin only
- `GET /api/staff/schedule` staff/admin
- `GET /api/customer/dashboard` customer/admin
- `GET /api/reports/bookings` admin only
- `GET /api/reports/inventory` admin only
- `GET /api/settings` admin only

Use this header for protected routes:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Render Deployment

1. Push this project to GitHub.
2. Create a MySQL database using a cloud MySQL provider. Render does not provide native MySQL databases, so use a provider such as Aiven, PlanetScale, Railway, or another managed MySQL host.
3. In Render, create a new Web Service from your GitHub repository.
4. Use:
   - Build command: `npm install`
   - Start command: `npm start`
5. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `DB_SSL=true` if your provider requires SSL
   - `DB_SYNC_ALTER=false` for production
6. Deploy.

`render.yaml` is included if you prefer Render Blueprint setup.
