set -e

echo "TB2 Crypto System - Smart Deployment"
echo "========================================"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ ! -f .env ]; then
    info "Creating .env from .env.example..."
    cp .env.example .env
    error "Please edit .env file with your configuration!"
    exit 1
fi

deploy_contract() {
    info "Starting smart contract deployment..."
    
    DEPLOY_MODE=${DEPLOY_MODE:-reuse}
    info "Deploy mode: $DEPLOY_MODE"
    
    case $DEPLOY_MODE in
        "reuse")
            info "Reuse mode: Will use existing contract if available"
            ;;
        "force")
            info "Force mode: Will deploy new contract"
            ;;
        "auto")
            info "Auto mode: Will check if new deployment is needed"
            ;;
        *)
            error "Invalid DEPLOY_MODE: $DEPLOY_MODE"
            error "Use: reuse, force, or auto"
            exit 1
            ;;
    esac

    docker-compose --profile deploy up contract-deployer
    
    if [ -f "shared-config/contract-config.json" ]; then
        CONTRACT_ADDRESS=$(jq -r '.contract.address' shared-config/contract-config.json)
        success "Contract deployed/loaded: $CONTRACT_ADDRESS"
        
        if grep -q "CONTRACT_ADDRESS=" .env; then
            sed -i "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" .env
        else
            echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
        fi
    else
        error "Contract deployment failed - config file not found"
        exit 1
    fi
}

start_services() {
    info "Starting application services..."

    docker-compose up -d postgres ipfs
    
    info "Waiting for PostgreSQL to be ready..."
    sleep 10

    docker-compose up -d backend frontend
    
    success "All services started successfully!"
}

check_status() {
    info "Checking service status..."
    
    echo ""
    echo "Service Status:"
    echo "==============="
    docker-compose ps
    
    echo ""
    echo "Access URLs:"
    echo "============"
    echo "Frontend: http://localhost:5173"
    echo "Backend API: http://localhost:5000"
    echo "IPFS Gateway: http://localhost:8080"
    echo "IPFS API: http://localhost:5001"
    echo "PostgreSQL: localhost:5432"
    
    if [ -f "shared-config/contract-config.json" ]; then
        echo ""
        echo "Contract Info:"
        echo "=============="
        cat shared-config/contract-config.json | jq '.'
    fi
}

stop_services() {
    info "Stopping all services..."
    docker-compose down
    success "Services stopped"
}

cleanup() {
    info "Cleaning up..."
    docker-compose down -v --remove-orphans
    rm -rf shared-config/
    success "Cleanup completed"
}

show_menu() {
    echo ""
    echo "Available Commands:"
    echo "=================="
    echo "1. Full deploy + start (recommended)"
    echo "2. Start services only (use existing contract)"
    echo "3. Deploy contract only"
    echo "4. Check status"
    echo "5. Stop services"
    echo "6. Cleanup everything"
    echo "7. Show logs"
    echo "8. Exit"
    echo ""
}

case "${1:-menu}" in
    "deploy")
        deploy_contract
        start_services
        check_status
        ;;
    "start")
        start_services
        check_status
        ;;
    "contract-only")
        deploy_contract
        ;;
    "status")
        check_status
        ;;
    "stop")
        stop_services
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "menu"|*)
        while true; do
            show_menu
            read -p "Select option (1-8): " choice
            case $choice in
                1)
                    deploy_contract
                    start_services
                    check_status
                    break
                    ;;
                2)
                    start_services
                    check_status
                    break
                    ;;
                3)
                    deploy_contract
                    break
                    ;;
                4)
                    check_status
                    ;;
                5)
                    stop_services
                    break
                    ;;
                6)
                    cleanup
                    break
                    ;;
                7)
                    docker-compose logs -f
                    break
                    ;;
                8)
                    info "Exiting..."
                    break
                    ;;
                *)
                    error "Invalid option. Please select 1-8."
                    ;;
            esac
        done
        ;;
esac