# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build the frontend. 
# Note: VITE_API_URL is set to relative path for same-origin requests in production
ENV VITE_API_URL=/api/v1
RUN npm run build

# Stage 2: Backend & Runtime
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (supervisor to run app; Redis is external)
RUN apt-get update && apt-get install -y \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies using Poetry (app/ must exist for "packages = [{include = app}]")
COPY backend/pyproject.toml backend/poetry.lock* backend/README.md /app/
COPY backend/app /app/app
RUN pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --without dev --no-interaction --no-ansi
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy Frontend Build Artifacts
COPY --from=frontend-builder /app/frontend/dist /app/static

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Start Supervisor (runs FastAPI only; Redis via REDIS_URL, e.g. Memorystore on GCP)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
