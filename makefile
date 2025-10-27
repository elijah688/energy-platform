PROJECT_NAME = EnergyMarket
CONFIG = Release
RID = osx-arm64

.PHONY: run clean publish db-up db-down check-db-up migrate db-reset

# -----------------------------
# .NET commands
# -----------------------------
run:
	dotnet run -c $(CONFIG) --project src/GeneratorDaemon

clean:
	dotnet clean

publish: clean
	dotnet publish -c $(CONFIG) -r $(RID) --self-contained true /p:PublishSingleFile=true



DB_DIR = db
SQL_DIR = sql
DB_USER = postgres
DB_PASS = postgres
DB_NAME = postgres
DB_HOST = localhost
DB_PORT = 6969
# -----------------------------
# Docker / DB commands
# -----------------------------
db-up:
	docker-compose -f $(DB_DIR)/docker-compose.yml up -d

db-down:
	docker-compose -f $(DB_DIR)/docker-compose.yml down
	
check-db-up:
	@echo "Checking if database is ready for queries..."
	@until docker exec ts psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT 1" > /dev/null 2>&1; do \
		echo "Waiting for DB full readiness..."; \
		sleep 1; \
	done
	@echo "Database is fully ready!"


migrate:
	@echo "Applying SQL migrations..."
	@for f in $(sort $(SQL_DIR)/*.sql); do \
		echo "Applying $$f"; \
		PGPASSWORD=$(DB_PASS) psql -h $(DB_HOST) -U $(DB_USER) -p $(DB_PORT) -d $(DB_NAME) -f $$f; \
	done
	@echo "Migrations applied!"

# -----------------------------
# Convenience: reset DB
# -----------------------------
db-reset: db-down db-up check-db-up migrate
	@echo "Database reset and migrated."

test: db-reset
	dotnet test

