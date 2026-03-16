FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip

COPY mt5_import_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mt5_import_service/ .

ENV PYTHONUNBUFFERED=1
ENV WORKER_ID=worker-1
ENV SYNC_INTERVAL_ACTIVE=300
ENV SYNC_INTERVAL_NORMAL=1800
ENV SYNC_INTERVAL_INACTIVE=14400

CMD ["python", "worker.py"]
