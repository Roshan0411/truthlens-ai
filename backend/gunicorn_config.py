import os

# Bind to the PORT environment variable
# Render sets PORT, default to 8080 if not set
port = os.environ.get('PORT', '8080')
bind = f"0.0.0.0:{port}"

print(f"Gunicorn binding to: {bind}")

# Worker configuration
workers = 1
worker_class = 'sync'
timeout = 300  # 5 minutes for model loading
graceful_timeout = 300
keepalive = 5

# Memory management
max_requests = 100
max_requests_jitter = 10

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'
