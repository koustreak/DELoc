FROM minio/minio:latest

# Set necessary environment variables
ENV MINIO_ROOT_USER=admin
ENV MINIO_ROOT_PASSWORD=adminpassword

# Create directories for MinIO to use
RUN mkdir -p /data

# Expose MinIO API and Console ports
EXPOSE 9000 9001

# Set the working directory
WORKDIR /data

# Health check to ensure MinIO is running properly
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:9000/minio/health/live || exit 1

# Start MinIO server
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001", "--address", ":9000"]