# ==============================================================================
# Stage 1: Build virtual environment & install dependencies
# ==============================================================================
FROM python:3.10-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==============================================================================
# Stage 2: Final lightweight execution image (Non-root user)
# ==============================================================================
FROM python:3.10-slim AS runner

# Create non-root user and group for security best practice
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -m -s /bin/bash appuser

WORKDIR /app

# Copy python virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy application files
COPY --chown=appuser:appgroup . /app

# Switch to non-root user
USER appuser

EXPOSE 8080

CMD ["python", "api_server.py"]
