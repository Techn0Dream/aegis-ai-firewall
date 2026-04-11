FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc postgresql-client && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
# Add asyncpg for PostgreSQL support
RUN pip install --no-cache-dir -r requirements.txt asyncpg

COPY . .

# Expose API gateway port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
