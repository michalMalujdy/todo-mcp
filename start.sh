#!/bin/bash

# Start script for Todo MCP project
# Starts backend, mcp-server, and MCP inspector

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${BLUE}🚀 Starting Todo MCP project...${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID $MCP_SERVER_PID $INSPECTOR_PID 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting backend on port 3000...${NC}"
cd backend
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start MCP server
echo -e "${GREEN}Starting MCP server on port 3001...${NC}"
cd mcp-server
npm run start:dev > ../logs/mcp-server.log 2>&1 &
MCP_SERVER_PID=$!
cd ..

# Wait a bit for MCP server to start
sleep 3

# Start MCP Inspector
echo -e "${GREEN}Starting MCP Inspector...${NC}"
npx @modelcontextprotocol/inspector http://localhost:3001/mcp > logs/inspector.log 2>&1 &
INSPECTOR_PID=$!

echo -e "\n${BLUE}✅ All services started!${NC}"
echo -e "${BLUE}Backend: http://localhost:3000${NC}"
echo -e "${BLUE}MCP Server: http://localhost:3001${NC}"
echo -e "${BLUE}MCP Inspector: Check your browser (usually opens automatically)${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for all processes
wait

