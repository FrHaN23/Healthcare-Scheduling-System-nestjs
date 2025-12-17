# Healthcare Scheduling System

A backend system for managing **authentication**, **doctor scheduling**, **customers**, and **email notifications** using a modern, production-ready stack.

This project is implemented as a **monorepo** with multiple services, containerized using **Docker Compose**, and communicates via **GraphQL** and **internal REST** where appropriate.

---

## Architecture Overview

```
          Client
            |
            v
      [GraphQL API]
            |
    +-------+-------+
    |               |
auth-service  schedule-service --> Email Queue --> schedule-worker (Send Email)
    |               |
    +-------+-------+
            |
            v
        Database
```

---

- auth-service: Handles user registration, login, JWT issuance, and token validation
- schedule-service: Manages doctors, customers, schedules, and triggers email notifications
- schedule-worker: Background worker (BullMQ) for sending emails
- postgres: Primary relational database
= redis: Cache + queue backend

---

## Tech Stack

- **Node.js 20**
- **NestJS** (GraphQL + REST)
- **Apollo GraphQL** (Code-first)
- **Prisma ORM** (PostgreSQL)
- **Redis** (Cache + BullMQ Queue)
- **BullMQ** (Background jobs)
- **Nodemailer** (SMTP via Mailtrap)
- **Docker & Docker Compose**
- **Jest** (Unit testing)

---

## Authentication Flow

1. User registers / logs in via `auth-service`
2. `auth-service` issues a **JWT access token**
3. `schedule-service` validates token via **internal REST call** to auth-service
4. GraphQL resolvers are protected using a **global AuthGuard**

---

## Scheduling Rules

- A doctor **cannot have overlapping schedules** at the same time
- Customer and Doctor **must exist** before scheduling
- Successful schedule creation triggers an **email notification**

---

## Email & Queue Flow

1. Schedule is created
2. Email job is pushed to **Redis queue** (`email-queue`)
3. `schedule-worker` consumes the job
4. Email is sent via **Mailtrap SMTP**
5. Retries and backoff are enabled

---

## Running Locally (Docker)

### Prerequisites

- Docker
- Docker Compose

### Environment Variables

Create `.env` files inside each service directory. or just copy-paste from `.env.example`

#### auth-service/.env

```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/healthcare
JWT_SECRET=supersecret
REDIS_HOST=redis
REDIS_PORT=6379
```

#### schedule-service/.env

```env
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/healthcare
REDIS_HOST=redis
REDIS_PORT=6379

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=YOUR_MAILTRAP_USER
SMTP_PASS=YOUR_MAILTRAP_PASS
```

---

### Start the system

```bash
docker compose up --build
```

---

### Run Database Migrations

```bash
docker compose exec auth-service npx prisma migrate deploy
docker compose exec schedule-service npx prisma migrate deploy
```

---

## API Documentation (GraphQL Playground)

GraphQL Playground acts as **living API documentation**.

- Auth Service: http://localhost:3001/graphql
- Schedule Service: http://localhost:3002/graphql

Each query, mutation, and type includes **descriptions** for easy exploration.

---

## How To Test The System

Follow these steps to verify all core functionality end-to-end.

### Register a User

Open **Auth Service Playground**:

```graphql
mutation {
  register(email: "admin@mail.com", password: "password123") {
    id
    email
  }
}
```

---

### Login & Get JWT

```graphql
mutation {
  login(email: "admin@mail.com", password: "password123")
}
```

Copy the returned JWT token.

---

### Set Authorization Header

In GraphQL Playground (Schedule Service), set:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

---

### Create Doctor

```graphql
mutation {
  createDoctor(input: { name: "Dr. Ujang" }) {
    id
    name
  }
}
```

---

### Create Customer

```graphql
mutation {
  createCustomer(input: { name: "John Doe", email: "john@mail.com" }) {
    id
    name
  }
}
```

---

### Create Schedule

```graphql
mutation {
  createSchedule(input: {
    objective: "Consultation"
    doctorId: "DOCTOR_ID"
    customerId: "CUSTOMER_ID"
    scheduledAt: "2025-12-20T09:00:00.000Z"
  }) {
    id
    scheduledAt
  }
}
```

Expected behavior:
- No schedule collision allowed
- Email job enqueued
- Worker sends email via Mailtrap

---

### Verify Email

- Open **Mailtrap Inbox**
- Confirm appointment notification email is received

---


## Testing

Each module includes **unit tests** using Jest.

```bash
npm run test
```

---

## Docker Notes

- Prisma Client is generated **inside Docker** to match Alpine (musl)
- Same image is reused for API & worker
- Worker runs as a separate container with a different command

---

## Design Decisions

- **Monorepo** for easier review and setup
- **GraphQL** for flexible querying and built-in documentation
- **BullMQ** for reliable background processing
- **Redis** reused for cache and queue
- **Explicit migrations** using `prisma migrate deploy`

---

Built as a technical assessment demonstrating backend architecture, correctness, and production readiness.

---

## Status

✔ Auth implemented
✔ Scheduling with collision detection
✔ Email notifications
✔ Background worker
✔ Dockerized
✔ Tests included

---

Thank you for reviewing this project 🙏


