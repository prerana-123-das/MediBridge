# Use official Python lightweight image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy dependencies list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

# Expose the API port (8000)
EXPOSE 8000

# Start FastAPI server using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
