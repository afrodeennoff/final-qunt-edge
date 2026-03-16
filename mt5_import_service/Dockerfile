FROM python:3.11-slim

WORKDIR /app

# Install Node.js for Prisma CLI
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip

# Copy requirements first for better caching
COPY mt5_import_service/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy MT5 service code
COPY mt5_import_service/ ./mt5_import_service/

# Set environment
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV WORKER_ID=worker-1
ENV SYNC_INTERVAL_ACTIVE=300
ENV SYNC_INTERVAL_NORMAL=1800
ENV SYNC_INTERVAL_INACTIVE=14400

# Run unified main.py
CMD ["python", "-m", "mt5_import_service.main"]
