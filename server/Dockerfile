FROM node:20-slim

# Install Python3, pip, venv, and build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server package definitions
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Create Python virtual environment and install ML dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
RUN pip install --no-cache-dir numpy pandas scikit-learn joblib

# Copy source code and ML models
COPY server/ ./server/
COPY ml/ ./ml/

WORKDIR /app/server

EXPOSE 5001

CMD ["node", "src/server.js"]
