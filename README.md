# BioTrace System

A comprehensive blockchain-based botanical traceability system built with Hyperledger Fabric, IPFS, and modern web technologies.

## Features

- **Blockchain Network**: Permissioned Hyperledger Fabric network with immutable transaction recording
- **Smart Contracts**: Geo-fencing, seasonal restrictions, and species-specific conservation rules
- **Role-Based Access Control**: Farmers, processors, labs, regulators, retailers, and consumers
- **Off-Chain Storage**: IPFS integration for large files (photos, lab reports, certificates)
- **Web Platform**: Role-specific dashboards with offline capabilities
- **QR Code Integration**: Consumer scanning for full batch provenance
- **Real-time Monitoring**: Automated alerts and compliance checking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   Backend API   │    │  Hyperledger    │
│   (React)       │◄──►│   (Node.js)     │◄──►│  Fabric Network │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   IPFS Storage  │
                       │   (Off-chain)   │
                       └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Go 1.19+ (for Hyperledger Fabric)
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ayurvedic-herb-traceability
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the Hyperledger Fabric network:
```bash
npm run fabric:start
```

5. Start the application:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
├── blockchain/           # Hyperledger Fabric network configuration
├── client/              # React frontend application
├── server/              # Node.js backend API
├── smart-contracts/     # Chaincode for herb traceability
├── docs/               # Documentation and API specs
└── tests/              # Test cases and demonstrations
```

## Demo

The system includes a complete demonstration with Ashwagandha herb tracking:

1. **Farmer Registration**: Create harvest events with GPS coordinates
2. **Processing**: Add processing and quality test events
3. **Packaging**: Generate QR codes for consumer access
4. **Consumer Experience**: Scan QR codes to view full provenance
5. **Compliance Monitoring**: Real-time alerts for violations

## API Documentation

See `docs/api.md` for complete API documentation.

## Testing

Run the test suite:
```bash
npm test
```

## License

MIT License - see LICENSE file for details.
