# Ayurvedic Herb Traceability System - Setup Guide

## Prerequisites

Before setting up the system, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker** (v20 or higher) - [Download](https://www.docker.com/)
- **Docker Compose** (v2 or higher) - [Download](https://docs.docker.com/compose/install/)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)

### Optional Software
- **Go** (v1.19 or higher) - For Hyperledger Fabric development
- **IPFS** - For decentralized file storage
- **Postman** - For API testing

## System Requirements

### Minimum Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 20.04+

### Recommended Requirements
- **CPU**: 8 cores
- **RAM**: 16GB
- **Storage**: 100GB free space
- **Network**: Stable internet connection

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/ayurvedic-herbs/traceability-system.git
cd traceability-system
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Return to root directory
cd ..
```

### 3. Environment Configuration

Create environment files for different components:

#### Server Environment (.env)
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ayurvedic-traceability

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Hyperledger Fabric Configuration
FABRIC_CA_URL=http://localhost:7054
FABRIC_CA_NAME=ca.org1.example.com
FABRIC_CA_ADMIN_USER=admin
FABRIC_CA_ADMIN_PASSWORD=adminpw
FABRIC_CA_ADMIN_MSP=Org1MSP
FABRIC_NETWORK_NAME=herb-traceability-network
FABRIC_CHANNEL_NAME=herb-channel
FABRIC_CHAINCODE_NAME=herb-traceability
FABRIC_CHAINCODE_VERSION=1.0

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Geo-fencing Configuration
ALLOWED_HARVEST_ZONES=12.9716,77.5946,1000;19.0760,72.8777,1000;28.7041,77.1025,1000
SEASONAL_RESTRICTIONS_ENABLED=true

# Notification Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### Client Environment (.env)
```bash
cd client
cp .env.example .env.local
```

Edit `.env.local`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
REACT_APP_IPFS_URL=http://localhost:5001/ipfs
```

### 4. Database Setup

#### MongoDB Setup
```bash
# Start MongoDB service
sudo systemctl start mongod

# Create database and user
mongo
use ayurvedic-traceability
db.createUser({
  user: "herb_user",
  pwd: "herb_password",
  roles: ["readWrite"]
})
exit
```

### 5. IPFS Setup

#### Install IPFS
```bash
# Download IPFS
wget https://dist.ipfs.io/go-ipfs/v0.17.0/go-ipfs_v0.17.0_linux-amd64.tar.gz
tar -xzf go-ipfs_v0.17.0_linux-amd64.tar.gz
cd go-ipfs
sudo ./install.sh

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

### 6. Hyperledger Fabric Setup

#### Install Prerequisites
```bash
# Install Go
wget https://go.dev/dl/go1.19.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.19.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Install Hyperledger Fabric tools
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.0
export PATH=$PATH:$(pwd)/fabric-samples/bin
```

#### Start Fabric Network
```bash
# Navigate to blockchain directory
cd blockchain

# Make scripts executable
chmod +x start-network.sh stop-network.sh

# Start the network
./start-network.sh
```

### 7. Start the Application

#### Development Mode
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend client
cd client
npm start

# Terminal 3: Start IPFS (if not already running)
ipfs daemon
```

#### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Verification

### 1. Check Services

```bash
# Check if all services are running
curl http://localhost:5000/health
curl http://localhost:3000
curl http://localhost:5001/api/v0/version
```

### 2. Run Tests

```bash
# Run comprehensive test suite
node tests/test-cases.js

# Run demonstration
node tests/demo.js
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **IPFS Gateway**: http://localhost:5001/ipfs
- **Fabric Explorer**: http://localhost:8080

## Default Credentials

### Demo Users
- **Farmer**: john_farmer / password123
- **Processor**: mary_processor / password123
- **Laboratory**: dr_smith / password123
- **Regulator**: regulator_jane / password123

### Admin Access
- **Username**: admin
- **Password**: admin123

## Configuration Options

### Geo-fencing Configuration
Edit `ALLOWED_HARVEST_ZONES` in `.env`:
```
LATITUDE,LONGITUDE,RADIUS_IN_METERS;LATITUDE,LONGITUDE,RADIUS_IN_METERS
```

### Seasonal Restrictions
Set `SEASONAL_RESTRICTIONS_ENABLED=true` and configure species-specific seasons in the smart contract.

### Quality Standards
Modify quality thresholds in `smart-contracts/herb-traceability.go`:
```go
const (
    MIN_PURITY = 95.0
    MAX_MOISTURE = 12.0
    MAX_ASH_CONTENT = 8.0
)
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000
lsof -i :5001

# Kill process
kill -9 <PID>
```

#### 2. MongoDB Connection Error
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### 3. IPFS Connection Error
```bash
# Check IPFS status
ipfs id

# Reset IPFS if needed
ipfs repo gc
```

#### 4. Fabric Network Issues
```bash
# Stop and restart network
cd blockchain
./stop-network.sh
./start-network.sh
```

#### 5. Permission Denied
```bash
# Fix file permissions
chmod +x blockchain/*.sh
chmod 755 logs/
```

### Log Files

Check log files for detailed error information:
- **Server logs**: `server/logs/app.log`
- **Client logs**: Browser console
- **Fabric logs**: Docker container logs
- **IPFS logs**: `~/.ipfs/logs/`

### Performance Issues

#### 1. Slow API Responses
- Check database indexes
- Monitor memory usage
- Optimize queries

#### 2. High Memory Usage
- Increase Docker memory limits
- Optimize application code
- Check for memory leaks

#### 3. Network Issues
- Check firewall settings
- Verify port accessibility
- Monitor network traffic

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Use strong passwords
- Enable authentication
- Configure firewall rules

### 3. Network Security
- Use HTTPS in production
- Configure CORS properly
- Implement rate limiting

### 4. Blockchain Security
- Secure private keys
- Monitor network access
- Regular security audits

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup
mongodump --db ayurvedic-traceability --out backup/

# Restore backup
mongorestore --db ayurvedic-traceability backup/ayurvedic-traceability/
```

### 2. IPFS Backup
```bash
# Pin important files
ipfs pin add <hash>

# Export repository
ipfs repo gc
```

### 3. Blockchain Backup
```bash
# Backup crypto material
cp -r blockchain/crypto-config backup/
cp -r blockchain/channel-artifacts backup/
```

## Monitoring

### 1. Health Checks
- API health: `GET /health`
- Database connectivity
- Blockchain network status
- IPFS node status

### 2. Metrics
- Request/response times
- Error rates
- Resource usage
- Transaction throughput

### 3. Alerts
- Service downtime
- High error rates
- Resource exhaustion
- Security incidents

## Scaling

### 1. Horizontal Scaling
- Load balancer configuration
- Database clustering
- Microservices architecture

### 2. Vertical Scaling
- Increase server resources
- Optimize application code
- Database tuning

### 3. Caching
- Redis for session storage
- CDN for static assets
- Database query caching

## Support

For technical support:
- **Documentation**: https://docs.ayurvedic-herbs.com
- **GitHub Issues**: https://github.com/ayurvedic-herbs/traceability-system/issues
- **Email**: support@ayurvedic-herbs.com
- **Community Forum**: https://community.ayurvedic-herbs.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
