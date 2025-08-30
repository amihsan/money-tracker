# Use the official Python image as a base
FROM python:3.12-alpine

# Create working dir
WORKDIR /app

# Install dependencies
# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy source code
COPY . .

# Expose Flask API port
EXPOSE 5001

# Run with Gunicorn (bind to 0.0.0.0 so container is reachable)
# Replace 'app:app' with 'module_name:app_variable'
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
