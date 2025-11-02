# EnergyMarket Platform

**EnergyMarket** is a modern energy trading platform that allows users to buy, sell, and manage energy assets. It combines a **C# .NET 9 backend** with an **Angular 20 SPA frontend**, fully containerized for easy deployment.

---

## Table of Contents

* [Tech Stack](#tech-stack)
* [Features](#features)
* [API Endpoints](#api-endpoints)
* [Database](#database)
* [Running Locally](#running-locally)
* [Dockerized Deployment](#dockerized-deployment)
* [Development Commands](#development-commands)
* [Testing](#testing)

---

## Tech Stack

**Backend:**

* .NET 9
* Minimal API (`TransactionServer`)
* Energy Generator Daemon Process  (`GeneratorDaemon`)
* PostgreSQL (via `Npgsql`)

**Frontend:**

* Angular 20 SPA
* Angular Material
* Signal Service State Management
* Dependency injection with - `inject`
* (`@for`, `@if`) template syntax

**DevOps:**

* Docker & Docker Compose
* Self-contained builds for ARM64/Linux

---

## Features

* Energy transaction management
* User management with energy balances
* Generator types and energy production tracking
* Transaction history per user
* Fully containerized deployment
* SQL-based migrations

---

## Database

* PostgreSQL for persistence
* Users table tracks balances and energy stored
* Generators table tracks user-owned energy generators
* Transactions table logs all energy trades

**DB Scripts:** Located in `sql/`

---

## Running Locally

### Prerequisites

* Docker & Docker Compose
* .NET SDK 9
* Node.js (for Angular SPA)

### Backend

```bash
cd api
make db-reset       # Respawn dev db
make clean          # Install dependencies
make server         # Run backend
make gen_daemon     # Run energy generation daemon
```

### Frontend

```bash
cd frontend
npm install         # Install dependencies
npm run start       # Run dev server
```

---

## Dockerized Deployment

Run backend, frontend and db in containers:

```bash
make run
```

* Containers handle DB, API server, and Angular SPA
* Fully reproducible environment

---


## Testing

#### Backend

```bash
cd api
make test       # respawn db & run tests
```


