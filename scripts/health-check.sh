#!/bin/bash

# Health check script for the E-commerce Platform

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
MAX_RETRIES=30
RETRY_INTERVAL=2

# Services to check
SERVICES=(
    "http://localhost:8080/api/actuator/health"
    "http://localhost:3000"
)

echo -e "${YELLOW}Starting health checks...${NC}"

for service in "${SERVICES[@]}"; do
    echo -n "Checking ${service}... "
    
    retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s "${service}" > /dev/null; then
            echo -e "${GREEN}OK${NC}"
            break
        fi
        
        retries=$((retries + 1))
        if [ $retries -eq $MAX_RETRIES ]; then
            echo -e "${RED}FAILED${NC}"
            exit 1
        fi
        
        sleep $RETRY_INTERVAL
    done
done

echo -e "${GREEN}All health checks passed!${NC}"