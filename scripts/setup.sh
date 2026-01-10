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

    # Load only the database-related environment variables we need
    if [ -f ".env" ]; then
        # Extract specific variables safely using grep and cut
        DB_USER=$(grep -E '^POSTGRES_USER=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
        DB_NAME=$(grep -E '^POSTGRES_DB=' .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
    fi

    # Use defaults if not set
    DB_USER="${DB_USER:-suba}"
    DB_NAME="${DB_NAME:-suba_app}"

    # Start database (if Docker available)
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_step "Starting PostgreSQL database..."
        
        # Check if containers are already running
        if docker compose -f packages/db/docker-compose.yml ps -q 2>/dev/null | grep -q .; then
            print_warning "Database containers already running"
        else
            docker compose -f packages/db/docker-compose.yml up -d
            print_success "PostgreSQL started"
        fi
        
        # Wait for database to be ready
        print_step "Waiting for database to be ready..."
        sleep 3
        
        for i in {1..30}; do
            if docker compose -f packages/db/docker-compose.yml exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
                print_success "Database is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "Database failed to start within 30 seconds"
                exit 1
            fi
            sleep 1
        done
    else
        print_warning "Skipping database setup (Docker not available)"
        print_warning "Make sure you have PostgreSQL running and DATABASE_URL is set in .env"
    fi

    # Run database migrations
    print_step "Pushing database schema..."
    cd packages/db
    DB_PUSH_OUTPUT=$(bun run db:push 2>&1)
    DB_PUSH_EXIT_CODE=$?
    
    # Check for both exit code and error patterns in output
    if [ $DB_PUSH_EXIT_CODE -ne 0 ] || echo "$DB_PUSH_OUTPUT" | grep -qiE "(error:|password authentication failed|connection refused|ECONNREFUSED)"; then
        echo "$DB_PUSH_OUTPUT"
        print_error "Failed to push database schema"
        print_warning "Please check your DATABASE_URL in .env and ensure the database is running"
        print_warning "Your .env may have old credentials. Try: rm .env && cp .env.example .env"
        cd ../..
        exit 1
    else
        echo "$DB_PUSH_OUTPUT"
        print_success "Database schema pushed"
    fi
    cd ../..

    # Seed database
    print_step "Seeding database with sample data..."
    cd packages/db
    SEED_OUTPUT=$(bun run db:seed 2>&1)
    SEED_EXIT_CODE=$?
    
    if [ $SEED_EXIT_CODE -ne 0 ] || echo "$SEED_OUTPUT" | grep -qiE "(error:|password authentication failed|connection refused)"; then
        echo "$SEED_OUTPUT"
        print_warning "Seeding failed or already seeded. Continuing..."
    else
        echo "$SEED_OUTPUT"
        print_success "Database seeded"
    fi
    cd ../..

    # Build packages
    print_step "Building packages..."
    if bun run build; then
        print_success "Build completed"
    else
        print_warning "Build had some issues, but setup can continue"
    fi

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
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Review .env and update any placeholder values"
    echo "  2. Update apps/web/src/config/template.ts with your branding"
    echo "  3. Replace placeholder logos in apps/web/src/assets/company-logo/"
    echo ""
}

# Run main function
main "$@"
