# BioTrace System - Project Overview

## 🌿 Project Summary

The **BioTrace System** is a comprehensive blockchain-based solution designed to ensure complete transparency, authenticity, and compliance in supply chains. Built with modern technologies including Hyperledger Fabric, IPFS, React, and Node.js, this system provides end-to-end traceability from harvest to consumer.

## 🎯 Key Features

### 1. Blockchain Network & Core Logic
- **Permissioned Hyperledger Fabric Network** with immutable transaction recording
- **Cryptographically unique BatchID** generation for each herb batch
- **Smart contracts** with geo-fencing, seasonal restrictions, and species-specific conservation rules
- **Role-Based Access Control (RBAC)** for farmers, processors, labs, regulators, retailers, and consumers

### 2. Off-Chain Storage Integration
- **IPFS (InterPlanetary File System)** for decentralized storage of large files
- **Content hashes** stored on-chain for data integrity verification
- **Support for photos, lab reports, certificates, and other documents**

### 3. Web Platform & User Interfaces
- **Role-specific dashboards** tailored to different user workflows
- **Real-time notifications** via WebSocket connections
- **Offline-capable event capture** with IndexedDB storage
- **Seamless sync** when connectivity is restored

### 4. QR Code Integration
- **Automated QR code generation** at packaging completion
- **Consumer scanning interface** for full batch provenance
- **Blockchain-verified authenticity** of QR codes

### 5. Compliance & Monitoring
- **Automated compliance checking** with real-time alerts
- **Geo-fencing validation** for approved harvest zones
- **Seasonal restriction enforcement**
- **Quality threshold monitoring**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   Backend API   │    │  Hyperledger    │
│   (React)       │◄──►│   (Node.js)     │◄──►│  Fabric Network │
│                 │    │                 │    │                 │
│ • Role-based UI │    │ • REST API      │    │ • Smart         │
│ • QR Scanner    │    │ • Authentication│    │   Contracts     │
│ • Offline Sync  │    │ • RBAC          │    │ • Immutable     │
│ • Real-time     │    │ • Notifications │    │   Records       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   IPFS Storage  │
                       │   (Off-chain)   │
                       │                 │
                       │ • Photos        │
                       │ • Lab Reports   │
                       │ • Certificates  │
                       │ • Documents     │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Query** for state management
- **Zustand** for global state
- **Socket.IO Client** for real-time updates
- **QR Code libraries** for scanning and generation
- **Leaflet** for map integration
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js framework
- **MongoDB** for data persistence
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **IPFS HTTP Client** for decentralized storage
- **Hyperledger Fabric SDK** for blockchain integration
- **Winston** for logging
- **Joi** for validation

### Blockchain
- **Hyperledger Fabric 2.5** permissioned blockchain
- **Go** smart contracts (chaincode)
- **Docker** for network deployment
- **Cryptographic validation** for all transactions

### Storage
- **IPFS** for decentralized file storage
- **MongoDB** for structured data
- **IndexedDB** for offline storage

## 📁 Project Structure

```
ayurvedic-herb-traceability/
├── blockchain/                 # Hyperledger Fabric network
│   ├── docker-compose.yml     # Network configuration
│   ├── start-network.sh       # Network startup script
│   ├── stop-network.sh        # Network shutdown script
│   └── connection-profile.json # Network connection config
├── client/                    # React frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management
│   │   ├── utils/           # Utility functions
│   │   └── App.js           # Main app component
│   └── package.json         # Frontend dependencies
├── server/                   # Node.js backend
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── models/              # Database models
│   ├── middleware/          # Express middleware
│   └── index.js             # Server entry point
├── smart-contracts/          # Blockchain smart contracts
│   └── herb-traceability.go # Main chaincode
├── tests/                    # Test suites
│   ├── demo.js              # Demonstration script
│   └── test-cases.js        # Comprehensive tests
├── docs/                     # Documentation
│   ├── api.md               # API documentation
│   └── setup.md             # Setup instructions
├── package.json             # Root dependencies
├── setup.sh                 # Automated setup script
└── README.md                # Project overview
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- MongoDB
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ayurvedic-herbs/traceability-system.git
   cd traceability-system
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

3. **Start the services**:
   ```bash
   # Start blockchain network
   cd blockchain && ./start-network.sh
   
   # Start backend server
   cd ../server && npm run dev
   
   # Start frontend client
   cd ../client && npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - IPFS Gateway: http://localhost:5001

### Demo Credentials
- **Farmer**: john_farmer / password123
- **Processor**: mary_processor / password123
- **Laboratory**: dr_smith / password123
- **Regulator**: regulator_jane / password123

## 🧪 Testing & Demonstration

### Run Tests
```bash
# Comprehensive test suite
node tests/test-cases.js

# Demonstration script
node tests/demo.js
```

### Test Coverage
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Complete workflow testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability assessment

## 📊 Key Metrics & Features

### Supply Chain Events
- **Harvest**: GPS-tagged harvest recording
- **Processing**: Quality control and processing events
- **Testing**: Laboratory analysis and certification
- **Packaging**: QR code generation and packaging
- **Transport**: Logistics and shipping tracking
- **Retail**: Consumer access and feedback

### Compliance Features
- **Geo-fencing**: Location-based harvest validation
- **Seasonal Restrictions**: Time-based harvesting rules
- **Quality Standards**: Purity and safety thresholds
- **Species Conservation**: Endangered species protection
- **Real-time Alerts**: Violation notifications

### Data Integrity
- **Blockchain Immutability**: Tamper-proof records
- **Cryptographic Verification**: Digital signatures
- **IPFS Hashing**: File integrity validation
- **Audit Trails**: Complete transaction history

## 🔒 Security Features

### Authentication & Authorization
- **JWT-based authentication** with role-based access
- **Multi-factor authentication** support
- **Session management** with secure tokens
- **API rate limiting** and DDoS protection

### Data Protection
- **End-to-end encryption** for sensitive data
- **Secure file storage** with IPFS
- **Input validation** and sanitization
- **SQL injection** prevention

### Blockchain Security
- **Private key management** for blockchain access
- **Transaction signing** and verification
- **Network access control** and monitoring
- **Consensus mechanism** validation

## 🌍 Use Cases

### For Farmers
- Record harvest events with GPS coordinates
- Track batch progress through supply chain
- Access compliance guidelines and alerts
- Generate digital certificates

### For Processors
- Add processing and quality test events
- Upload lab reports and certificates
- Monitor batch status and compliance
- Generate QR codes for packaging

### For Laboratories
- Upload test results and analysis
- Issue digital certificates
- Track sample provenance
- Maintain quality standards

### For Regulators
- Monitor compliance across all batches
- Generate audit reports and analytics
- Set and enforce regulations
- Track violations and alerts

### For Retailers
- Verify batch authenticity via QR codes
- Access complete provenance information
- Build consumer trust and transparency
- Manage inventory and traceability

### For Consumers
- Scan QR codes for batch information
- View complete supply chain history
- Verify product authenticity
- Provide feedback and ratings

## 📈 Scalability & Performance

### Horizontal Scaling
- **Load balancer** configuration for multiple servers
- **Database clustering** for high availability
- **Microservices architecture** for independent scaling
- **CDN integration** for global content delivery

### Performance Optimization
- **Caching strategies** for frequently accessed data
- **Database indexing** for fast queries
- **API response optimization** and compression
- **Real-time data streaming** for live updates

### Monitoring & Analytics
- **Health check endpoints** for service monitoring
- **Performance metrics** and alerting
- **Usage analytics** and reporting
- **Error tracking** and debugging

## 🔮 Future Enhancements

### Planned Features
- **Mobile applications** for iOS and Android
- **IoT sensor integration** for real-time monitoring
- **AI-powered quality assessment** and prediction
- **Multi-language support** for global deployment
- **Advanced analytics dashboard** with machine learning

### Integration Capabilities
- **ERP system integration** for enterprise users
- **Third-party API** support for external services
- **Blockchain interoperability** with other networks
- **Cloud deployment** options for scalability

## 📞 Support & Community

### Documentation
- **API Documentation**: Complete endpoint reference
- **Setup Guide**: Step-by-step installation
- **User Manual**: Feature usage instructions
- **Developer Guide**: Contribution guidelines

### Community
- **GitHub Repository**: Source code and issues
- **Discussion Forum**: Community support
- **Email Support**: Direct technical assistance
- **Regular Updates**: Feature releases and improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🙏 Acknowledgments

- **Hyperledger Fabric** community for blockchain framework
- **IPFS** team for decentralized storage solution
- **React** community for frontend framework
- **Node.js** community for backend runtime
- **Open source contributors** who made this project possible

---

**Built with ❤️ for sustainable cultivation and supply chain transparency**

For more information, visit our [documentation](docs/) or [GitHub repository](https://github.com/ayurvedic-herbs/traceability-system).
