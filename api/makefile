PROJECT_NAME=EnergyMarket
CONFIG=Release

.PHONY: server clean publish db-up db-down check-db-up migrate db-reset

# -----------------------------
# .NET commands
# -----------------------------
server:
	export $$(cat .env | xargs) && dotnet watch run -c $(CONFIG) --project ./cmd/TransactionServer

clean:
	dotnet clean
	dotnet restore
	

publish: clean
	dotnet publish ./cmd/GeneratorDaemon/GeneratorDaemon.csproj -c Release -r linux-arm64 --self-contained false
	dotnet publish ./cmd/TransactionServer/TransactionServer.csproj -c Release -r linux-arm64 --self-contained false

export DB_DIR=db
export SQL_DIR=sql
export DB_USER=postgres
export DB_PASS=postgres
export DB_NAME=postgres
export DB_HOST=localhost
export DB_PORT=6969
export DB_CONTAINER_PORT=5432
export DB_CONNECTION = Host=localhost;Port=6969;Username=postgres;Password=postgres;Database=postgres;Pooling=true;MaxPoolSize=20

# -----------------------------
# Docker / DB commands
# -----------------------------
db-up:
	docker-compose -f $(DB_DIR)/docker-compose.yml up -d

db-down:
	docker-compose -f $(DB_DIR)/docker-compose.yml down
	
check-db-up:
	@echo "Checking if PostgreSQL is fully ready..."
	@until docker exec ts pg_isready -U $(DB_USER) -d $(DB_NAME) -h $(DB_HOST) -p $(DB_CONTAINER_PORT) > /dev/null 2>&1; do \
		echo "Waiting for PostgreSQL service..."; \
		sleep 1; \
	done
	@until docker exec ts psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT 1;" > /dev/null 2>&1; do \
		echo "Waiting for SQL query readiness..."; \
		sleep 1; \
	done
	@echo "Database is fully ready for queries."



migrate:
	@echo "Applying SQL migrations..."
	@for f in $(sort $(SQL_DIR)/*.sql); do \
		echo "Applying $$f"; \
		echo "PGPASSWORD=$(DB_PASS) psql -h $(DB_HOST) -U $(DB_USER) -p $(DB_PORT) -d $(DB_NAME) -f $$f"; \
		PGPASSWORD=$(DB_PASS) psql -h $(DB_HOST) -U $(DB_USER) -p $(DB_PORT) -d $(DB_NAME) -f $$f; \
	done
	@echo "Migrations applied!"

# -----------------------------
# Convenience: reset DB
# -----------------------------
db-reset: db-down db-up check-db-up migrate
	@echo "Database reset and migrated."

test: db-reset
	dotnet test --logger "console;verbosity=detailed"

