#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if a command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

# Main setup function
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       Company Template - Project Setup                      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Check prerequisites
    print_step "Checking prerequisites..."
    
    check_command "bun"
    print_success "Bun is installed ($(bun --version))"
    
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not installed. You'll need to provide your own PostgreSQL database."
        DOCKER_AVAILABLE=false
    fi

    # Install dependencies
    print_step "Installing dependencies..."
    bun install
    print_success "Dependencies installed"

    # Setup environment file (centralized at root)
    print_step "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
            print_warning "Please review and update .env with your configuration"
        else
            print_error ".env.example not found!"
            exit 1
        fi
    else
        print_warning ".env already exists, skipping"
    fi

    # Start database (if Docker available)
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_step "Starting PostgreSQL database..."
        
        # Check if containers are already running
        if docker compose -f packages/db/docker-compose.yml ps -q 2>/dev/null | grep -q .; then
            print_warning "Database containers already running"
        else
            docker compose -f packages/db/docker-compose.yml up -d
            print_success "PostgreSQL started"
            
            # Wait for database to be ready
            print_step "Waiting for database to be ready..."
            sleep 3
            
            for i in {1..30}; do
                if docker compose -f packages/db/docker-compose.yml exec -T postgres pg_isready -U company_user -d company_db &>/dev/null; then
                    print_success "Database is ready"
                    break
                fi
                if [ $i -eq 30 ]; then
                    print_error "Database failed to start within 30 seconds"
                    exit 1
                fi
                sleep 1
            done
        fi
    else
        print_warning "Skipping database setup (Docker not available)"
        print_warning "Make sure you have PostgreSQL running and DATABASE_URL is set in .env"
    fi

    # Run database migrations
    print_step "Pushing database schema..."
    cd packages/db
    bun run db:push
    cd ../..
    print_success "Database schema pushed"

    # Seed database
    print_step "Seeding database with sample data..."
    cd packages/db
    bun run db:seed || {
        print_warning "Seeding failed or already seeded. Continuing..."
    }
    cd ../..
    print_success "Database seeded"

    # Build packages
    print_step "Building packages..."
    bun run build || {
        print_warning "Build had some issues, but setup can continue"
    }

    # Final instructions
    echo -e "\n${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete!                          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "To start the development servers, run:"
    echo -e "  ${BLUE}bun dev${NC}"
    echo ""
    echo -e "Web app:     ${BLUE}http://localhost:5173${NC}"
    echo -e "API server:  ${BLUE}http://localhost:3000${NC}"
    echo -e "DB Studio:   ${BLUE}bun db:studio${NC}"
    echo ""
    echo -e "${YELLOW}Default seed users:${NC}"
    echo "  admin@example.com (Admin)"
    echo "  editor@example.com (Editor)"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Update .env with your configuration (database, auth, etc.)"
    echo "  2. Update apps/web/src/config/template.ts with your branding"
    echo "  3. Replace placeholder logos in apps/web/src/assets/company-logo/"
    echo ""
}

# Run main function
main "$@"
