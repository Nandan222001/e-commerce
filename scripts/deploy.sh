#!/bin/bash

# Deployment script for the E-commerce Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENV=${1:-production}
BRANCH=${2:-main}

echo -e "${GREEN}Starting deployment for environment: ${ENV}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command_exists docker; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Pull latest code
echo -e "${YELLOW}Pulling latest code from ${BRANCH} branch...${NC}"
git checkout ${BRANCH}
git pull origin ${BRANCH}

# Load environment variables
if [ -f .env.${ENV} ]; then
    echo -e "${YELLOW}Loading environment variables from .env.${ENV}${NC}"
    export $(cat .env.${ENV} | xargs)
else
    echo -e "${RED}Environment file .env.${ENV} not found!${NC}"
    exit 1
fi

# Build and deploy based on environment
case ${ENV} in
    development)
        echo -e "${GREEN}Deploying to development environment...${NC}"
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
        ;;
    staging)
        echo -e "${GREEN}Deploying to staging environment...${NC}"
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d
        ;;
    production)
        echo -e "${GREEN}Deploying to production environment...${NC}"
        
        # Create backup before deployment
        echo -e "${YELLOW}Creating database backup...${NC}"
        ./scripts/backup.sh
        
        # Deploy with zero downtime
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d --scale backend=2
        
        # Wait for health checks
        echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
        sleep 30
        
        # Remove old containers
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d --scale backend=1
        ;;
    *)
        echo -e "${RED}Unknown environment: ${ENV}${NC}"
        exit 1
        ;;
esac

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker exec ecommerce-backend java -jar app.jar db migrate

# Health check
echo -e "${YELLOW}Performing health check...${NC}"
./scripts/health-check.sh

# Clean up old images
echo -e "${YELLOW}Cleaning up old Docker images...${NC}"
docker image prune -af

echo -e "${GREEN}Deployment completed successfully!${NC}"

# Send notification (implement as needed)
# ./scripts/notify.sh "Deployment to ${ENV} completed successfully"