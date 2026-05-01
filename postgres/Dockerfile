# Use the latest stable Postgres version on Alpine for maximum lightness
FROM postgres:17-alpine

LABEL maintainer="Koushik"
LABEL description="Lightweight Postgres 17 image for DELoc Education Lab"

# Set environment variables (these can be overridden at runtime)
ENV POSTGRES_DB=deloc_db
ENV POSTGRES_USER=deloc_user
ENV POSTGRES_PASSWORD=deloc_pass

# Optional: Add a custom initialization script 
# (Any .sh or .sql files in this folder are run on startup)
# COPY configs/init.sql /docker-entrypoint-initdb.d/

# Expose the standard Postgres port
EXPOSE 5432

# The official Postgres image already has an excellent CMD 
# to handle database initialization and startup.
