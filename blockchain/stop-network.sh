#!/bin/bash

# BioTrace - Hyperledger Fabric Network Shutdown Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping BioTrace Blockchain Network...${NC}"

# Stop and remove containers
echo -e "${YELLOW}Stopping Docker containers...${NC}"
docker-compose down

# Remove volumes
echo -e "${YELLOW}Removing volumes...${NC}"
docker volume prune -f

# Clean up crypto material and artifacts
echo -e "${YELLOW}Cleaning up generated files...${NC}"
rm -rf crypto-config
rm -rf channel-artifacts
rm -rf chaincode

echo -e "${GREEN}Network stopped successfully!${NC}"
