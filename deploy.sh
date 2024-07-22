#!/bin/bash

# Build and deploy services
docker-compose up --build -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

echo "Deployment complete. Backend is running on port 3000 and frontend on port 3001."