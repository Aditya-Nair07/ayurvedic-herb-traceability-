#!/bin/bash

# Ayurvedic Herb Traceability System - Setup Script
# This script automates the setup process for the complete system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node --version) is installed"
        else
            print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi

    # Check Docker
    if command_exists docker; then
        print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) is installed"
    else
        print_error "Docker is not installed. Please install Docker."
        exit 1
    fi

    # Check Docker Compose
    if command_exists docker-compose; then
        print_success "Docker Compose $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1) is installed"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi

    # Check Git
    if command_exists git; then
        print_success "Git $(git --version | cut -d' ' -f3) is installed"
    else
        print_error "Git is not installed. Please install Git."
        exit 1
    fi

    # Check MongoDB (optional)
    if command_exists mongod; then
        print_success "MongoDB is installed"
    else
        print_warning "MongoDB is not installed. Will use Docker container."
    fi

    print_success "All requirements check passed!"
}

# Function to create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Server environment
    if [ ! -f "server/.env" ]; then
        cp env.example server/.env
        print_success "Created server/.env from template"
    else
        print_warning "server/.env already exists, skipping..."
    fi

    # Client environment
    if [ ! -f "client/.env.local" ]; then
        cat > client/.env.local << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
REACT_APP_IPFS_URL=http://localhost:5001/ipfs
EOF
        print_success "Created client/.env.local"
    else
        print_warning "client/.env.local already exists, skipping..."
    fi

    print_success "Environment files configured!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    npm install

    # Server dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    cd ..

    # Client dependencies
    print_status "Installing client dependencies..."
    cd client
    npm install
    cd ..

    print_success "All dependencies installed!"
}

# Function to setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB..."
    
    if command_exists mongod; then
        # Start MongoDB service
        if command_exists systemctl; then
            sudo systemctl start mongod
            print_success "MongoDB service started"
        elif command_exists brew; then
            brew services start mongodb-community
            print_success "MongoDB service started"
        else
            print_warning "Please start MongoDB manually"
        fi
    else
        print_status "MongoDB not found, will use Docker container"
    fi
}

# Function to setup IPFS
setup_ipfs() {
    print_status "Setting up IPFS..."
    
    if command_exists ipfs; then
        # Initialize IPFS if not already done
        if [ ! -d "$HOME/.ipfs" ]; then
            ipfs init
            print_success "IPFS initialized"
        else
            print_success "IPFS already initialized"
        fi
        
        # Start IPFS daemon in background
        nohup ipfs daemon > ipfs.log 2>&1 &
        print_success "IPFS daemon started"
    else
        print_warning "IPFS not found. Please install IPFS manually or use Docker container."
    fi
}

# Function to setup Hyperledger Fabric
setup_fabric() {
    print_status "Setting up Hyperledger Fabric..."
    
    # Check if Fabric tools are available
    if command_exists cryptogen && command_exists configtxgen; then
        print_success "Hyperledger Fabric tools are available"
    else
        print_warning "Hyperledger Fabric tools not found. Please install them manually."
        print_status "You can install them using: curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.0"
    fi

    # Make blockchain scripts executable
    chmod +x blockchain/start-network.sh
    chmod +x blockchain/stop-network.sh
    print_success "Blockchain scripts made executable"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p server/logs
    mkdir -p client/build
    mkdir -p blockchain/crypto-config
    mkdir -p blockchain/channel-artifacts
    mkdir -p blockchain/chaincode
    
    print_success "Directories created!"
}

# Function to build the application
build_application() {
    print_status "Building the application..."
    
    # Build client
    print_status "Building React client..."
    cd client
    npm run build
    cd ..
    
    print_success "Application built successfully!"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run server tests
    print_status "Running server tests..."
    cd server
    npm test || print_warning "Server tests failed or not configured"
    cd ..
    
    # Run client tests
    print_status "Running client tests..."
    cd client
    npm test -- --coverage --watchAll=false || print_warning "Client tests failed or not configured"
    cd ..
    
    print_success "Tests completed!"
}

# Function to start services
start_services() {
    print_status "Starting services..."
    
    # Start IPFS if available
    if command_exists ipfs; then
        nohup ipfs daemon > ipfs.log 2>&1 &
        print_success "IPFS daemon started"
    fi
    
    # Start MongoDB if available
    if command_exists mongod; then
        if command_exists systemctl; then
            sudo systemctl start mongod
        elif command_exists brew; then
            brew services start mongodb-community
        fi
        print_success "MongoDB started"
    fi
    
    print_success "Services started!"
}

# Function to display final instructions
show_final_instructions() {
    print_success "Setup completed successfully!"
    echo ""
    echo -e "${GREEN}🎉 Ayurvedic Herb Traceability System is ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the Hyperledger Fabric network:"
    echo "   cd blockchain && ./start-network.sh"
    echo ""
    echo "2. Start the backend server:"
    echo "   cd server && npm run dev"
    echo ""
    echo "3. Start the frontend client:"
    echo "   cd client && npm start"
    echo ""
    echo "4. Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo "   IPFS Gateway: http://localhost:5001"
    echo ""
    echo "5. Run the demonstration:"
    echo "   node tests/demo.js"
    echo ""
    echo "6. Run comprehensive tests:"
    echo "   node tests/test-cases.js"
    echo ""
    echo "For more information, see docs/setup.md"
    echo ""
    echo -e "${BLUE}Happy tracking! 🌿${NC}"
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  Ayurvedic Herb Traceability System"
    echo "           Setup Script"
    echo "=========================================="
    echo -e "${NC}"
    
    check_requirements
    create_directories
    setup_environment
    install_dependencies
    setup_mongodb
    setup_ipfs
    setup_fabric
    build_application
    run_tests
    start_services
    show_final_instructions
}

# Run main function
main "$@"
