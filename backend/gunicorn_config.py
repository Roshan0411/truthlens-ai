import os

# Bind to the PORT environment variable
bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"

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
