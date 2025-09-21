#!/bin/bash

# Ayurvedic Herb Traceability - Hyperledger Fabric Network Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Ayurvedic Herb Traceability Blockchain Network...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if required tools are installed
command -v cryptogen >/dev/null 2>&1 || { echo -e "${RED}Error: cryptogen is required but not installed. Please install Hyperledger Fabric tools.${NC}" >&2; exit 1; }
command -v configtxgen >/dev/null 2>&1 || { echo -e "${RED}Error: configtxgen is required but not installed. Please install Hyperledger Fabric tools.${NC}" >&2; exit 1; }

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p crypto-config
mkdir -p channel-artifacts
mkdir -p chaincode

# Generate crypto material
echo -e "${YELLOW}Generating crypto material...${NC}"
if [ ! -f "crypto-config.yaml" ]; then
    cat > crypto-config.yaml << EOF
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

# ---------------------------------------------------------------------------
# "OrdererOrgs" - Definition of organizations managing orderer nodes
# ---------------------------------------------------------------------------
OrdererOrgs:
  # ---------------------------------------------------------------------------
  # Orderer
  # ---------------------------------------------------------------------------
  - Name: Orderer
    Domain: example.com
    # ---------------------------------------------------------------------------
    # "Specs" - See PeerOrgs below for complete definition
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: orderer
# ---------------------------------------------------------------------------
# "PeerOrgs" - Definition of organizations managing peer nodes
# ---------------------------------------------------------------------------
PeerOrgs:
  # ---------------------------------------------------------------------------
  # Org1
  # ---------------------------------------------------------------------------
  - Name: Org1
    Domain: org1.example.com
    # ---------------------------------------------------------------------------
    # "Specs"
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: peer0
    # ---------------------------------------------------------------------------
    # "Users"
    # ---------------------------------------------------------------------------
    Users:
      Count: 1
EOF
fi

cryptogen generate --config=crypto-config.yaml --output="crypto-config"

# Generate genesis block
echo -e "${YELLOW}Generating genesis block...${NC}"
if [ ! -f "configtx.yaml" ]; then
    cat > configtx.yaml << EOF
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

---
Organizations:
    - &OrdererOrg
        Name: OrdererOrg
        ID: OrdererMSP
        MSPDir: crypto-config/ordererOrganizations/example.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
            Writers:
                Type: Signature
                Rule: "OR('OrdererMSP.member')"
            Admins:
                Type: Signature
                Rule: "OR('OrdererMSP.admin')"

    - &Org1
        Name: Org1MSP
        ID: Org1MSP
        MSPDir: crypto-config/peerOrganizations/org1.example.com/msp
        Policies:
            Readers:
                Type: Signature
                Rule: "OR('Org1MSP.admin', 'Org1MSP.peer', 'Org1MSP.client')"
            Writers:
                Type: Signature
                Rule: "OR('Org1MSP.admin', 'Org1MSP.client')"
            Admins:
                Type: Signature
                Rule: "OR('Org1MSP.admin')"
        AnchorPeers:
            - Host: peer0.org1.example.com
              Port: 7051

Capabilities:
    Channel: &ChannelCapabilities
        V2_0: true
    Orderer: &OrdererCapabilities
        V2_0: true
    Application: &ApplicationCapabilities
        V2_0: true

Application: &ApplicationDefaults
    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        LifecycleEndorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
        Endorsement:
            Type: ImplicitMeta
            Rule: "MAJORITY Endorsement"
    Capabilities:
        <<: *ApplicationCapabilities

Orderer: &OrdererDefaults
    OrdererType: solo
    Addresses:
        - orderer.example.com:7050
    BatchTimeout: 2s
    BatchSize:
        MaxMessageCount: 10
        AbsoluteMaxBytes: 99 MB
        PreferredMaxBytes: 512 KB
    Organizations:
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
        BlockValidation:
            Type: ImplicitMeta
            Rule: "ANY Writers"

Channel: &ChannelDefaults
    Policies:
        Readers:
            Type: ImplicitMeta
            Rule: "ANY Readers"
        Writers:
            Type: ImplicitMeta
            Rule: "ANY Writers"
        Admins:
            Type: ImplicitMeta
            Rule: "MAJORITY Admins"
    Capabilities:
        <<: *ChannelCapabilities

Profiles:
    HerbOrdererGenesis:
        <<: *ChannelDefaults
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Consortiums:
            HerbConsortium:
                Organizations:
                    - *Org1

    HerbChannel:
        Consortium: HerbConsortium
        <<: *ChannelDefaults
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Org1
            Capabilities:
                <<: *ApplicationCapabilities
EOF
fi

configtxgen -profile HerbOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
configtxgen -profile HerbChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID herb-channel

# Start the network
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d

# Wait for containers to be ready
echo -e "${YELLOW}Waiting for containers to be ready...${NC}"
sleep 10

# Create and join channel
echo -e "${YELLOW}Creating and joining channel...${NC}"
docker exec cli peer channel create -o orderer.example.com:7050 -c herb-channel -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

docker exec cli peer channel join -b herb-channel.block

# Install chaincode
echo -e "${YELLOW}Installing chaincode...${NC}"
# Copy chaincode to container
docker cp ../smart-contracts/herb-traceability.go cli:/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/

# Package chaincode
docker exec cli peer lifecycle chaincode package herb-traceability.tar.gz --path /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode --lang golang --label herb-traceability_1.0

# Install chaincode
docker exec cli peer lifecycle chaincode install herb-traceability.tar.gz

# Get package ID
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep -o "Package ID: [^,]*" | cut -d' ' -f3)

# Approve chaincode
docker exec cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID herb-channel --name herb-traceability --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Commit chaincode
docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID herb-channel --name herb-traceability --version 1.0 --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Initialize chaincode
echo -e "${YELLOW}Initializing chaincode...${NC}"
docker exec cli peer chaincode invoke -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C herb-channel -n herb-traceability --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}'

echo -e "${GREEN}Network started successfully!${NC}"
echo -e "${GREEN}Orderer: localhost:7050${NC}"
echo -e "${GREEN}Peer: localhost:7051${NC}"
echo -e "${GREEN}CouchDB: localhost:5984${NC}"
echo -e "${GREEN}CA: localhost:7054${NC}"
echo -e "${GREEN}Channel: herb-channel${NC}"
echo -e "${GREEN}Chaincode: herb-traceability${NC}"
