package main

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// HerbTraceabilityContract provides functions for managing herb traceability
type HerbTraceabilityContract struct {
	contractapi.Contract
}

// HerbBatch represents a batch of herbs with unique identification
type HerbBatch struct {
	BatchID           string                 `json:"batchId"`
	Species           string                 `json:"species"`
	HarvestDate       string                 `json:"harvestDate"`
	HarvestLocation   GeoLocation            `json:"harvestLocation"`
	FarmerID          string                 `json:"farmerId"`
	Quantity          float64                `json:"quantity"`
	Unit              string                 `json:"unit"`
	Status            string                 `json:"status"`
	Events            []HerbEvent            `json:"events"`
	CreatedAt         string                 `json:"createdAt"`
	UpdatedAt         string                 `json:"updatedAt"`
	ComplianceStatus  ComplianceStatus       `json:"complianceStatus"`
	QualityMetrics    QualityMetrics         `json:"qualityMetrics"`
	IPFSHashes        map[string]string      `json:"ipfsHashes"`
	QRCodeGenerated   bool                   `json:"qrCodeGenerated"`
	QRCodeHash        string                 `json:"qrCodeHash"`
	Metadata          map[string]interface{} `json:"metadata"`
}

// HerbEvent represents a single event in the herb lifecycle
type HerbEvent struct {
	EventID       string                 `json:"eventId"`
	EventType     string                 `json:"eventType"`
	Timestamp     string                 `json:"timestamp"`
	Location      GeoLocation            `json:"location"`
	ActorID       string                 `json:"actorId"`
	ActorRole     string                 `json:"actorRole"`
	Description   string                 `json:"description"`
	IPFSHash      string                 `json:"ipfsHash"`
	Certificates  []string               `json:"certificates"`
	QualityData   map[string]interface{} `json:"qualityData"`
	Compliance    ComplianceCheck        `json:"compliance"`
	Metadata      map[string]interface{} `json:"metadata"`
}

// GeoLocation represents geographical coordinates
type GeoLocation struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
	Zone      string  `json:"zone"`
}

// ComplianceStatus tracks compliance across different aspects
type ComplianceStatus struct {
	GeoFencing     bool   `json:"geoFencing"`
	Seasonal       bool   `json:"seasonal"`
	Quality        bool   `json:"quality"`
	Species        bool   `json:"species"`
	Overall        bool   `json:"overall"`
	LastChecked    string `json:"lastChecked"`
	Violations     []string `json:"violations"`
}

// QualityMetrics stores quality-related data
type QualityMetrics struct {
	Purity        float64 `json:"purity"`
	Moisture      float64 `json:"moisture"`
	AshContent    float64 `json:"ashContent"`
	HeavyMetals   map[string]float64 `json:"heavyMetals"`
	Pesticides    map[string]float64 `json:"pesticides"`
	Microbial     map[string]float64 `json:"microbial"`
	LabTested     bool    `json:"labTested"`
	TestDate      string  `json:"testDate"`
	LabID         string  `json:"labId"`
	CertificateID string  `json:"certificateId"`
}

// ComplianceCheck represents a compliance validation
type ComplianceCheck struct {
	Passed        bool     `json:"passed"`
	Rules         []string `json:"rules"`
	Violations    []string `json:"violations"`
	CheckedAt     string   `json:"checkedAt"`
	CheckedBy     string   `json:"checkedBy"`
}

// User represents a system user with role-based access
type User struct {
	UserID       string   `json:"userId"`
	Username     string   `json:"username"`
	Email        string   `json:"email"`
	Role         string   `json:"role"`
	Organization string   `json:"organization"`
	Permissions  []string `json:"permissions"`
	CreatedAt    string   `json:"createdAt"`
	IsActive     bool     `json:"isActive"`
}

// InitLedger initializes the ledger with sample data
func (s *HerbTraceabilityContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	// Create sample users
	users := []User{
		{
			UserID:       "farmer001",
			Username:     "john_farmer",
			Email:        "john@farm.com",
			Role:         "farmer",
			Organization: "Green Valley Farms",
			Permissions:  []string{"create_batch", "add_harvest_event"},
			CreatedAt:    time.Now().Format(time.RFC3339),
			IsActive:     true,
		},
		{
			UserID:       "processor001",
			Username:     "mary_processor",
			Email:        "mary@process.com",
			Role:         "processor",
			Organization: "Herb Processing Co",
			Permissions:  []string{"add_processing_event", "add_quality_test"},
			CreatedAt:    time.Now().Format(time.RFC3339),
			IsActive:     true,
		},
		{
			UserID:       "lab001",
			Username:     "dr_smith",
			Email:        "smith@lab.com",
			Role:         "laboratory",
			Organization: "Quality Lab Services",
			Permissions:  []string{"add_lab_test", "upload_certificate"},
			CreatedAt:    time.Now().Format(time.RFC3339),
			IsActive:     true,
		},
		{
			UserID:       "regulator001",
			Username:     "regulator_jane",
			Email:        "jane@gov.com",
			Role:         "regulator",
			Organization: "Ministry of AYUSH",
			Permissions:  []string{"view_all", "audit", "compliance_check"},
			CreatedAt:    time.Now().Format(time.RFC3339),
			IsActive:     true,
		},
	}

	for _, user := range users {
		userJSON, err := json.Marshal(user)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState("user_"+user.UserID, userJSON)
		if err != nil {
			return err
		}
	}

	return nil
}

// CreateHerbBatch creates a new herb batch
func (s *HerbTraceabilityContract) CreateHerbBatch(ctx contractapi.TransactionContextInterface, batchID, species, farmerID string, quantity float64, unit string, latitude, longitude float64, address string) error {
	// Check if batch already exists
	existingBatch, err := ctx.GetStub().GetState("batch_" + batchID)
	if err != nil {
		return err
	}
	if existingBatch != nil {
		return fmt.Errorf("batch %s already exists", batchID)
	}

	// Validate farmer exists
	farmer, err := s.GetUser(ctx, farmerID)
	if err != nil {
		return err
	}
	if farmer.Role != "farmer" {
		return fmt.Errorf("user %s is not a farmer", farmerID)
	}

	// Create harvest event
	harvestEvent := HerbEvent{
		EventID:     fmt.Sprintf("event_%s_%d", batchID, time.Now().Unix()),
		EventType:   "harvest",
		Timestamp:   time.Now().Format(time.RFC3339),
		Location:    GeoLocation{Latitude: latitude, Longitude: longitude, Address: address},
		ActorID:     farmerID,
		ActorRole:   "farmer",
		Description: fmt.Sprintf("Harvested %f %s of %s", quantity, unit, species),
		Compliance:  ComplianceCheck{CheckedAt: time.Now().Format(time.RFC3339)},
	}

	// Perform compliance checks
	complianceStatus, err := s.checkCompliance(ctx, harvestEvent)
	if err != nil {
		return err
	}

	// Create herb batch
	herbBatch := HerbBatch{
		BatchID:          batchID,
		Species:          species,
		HarvestDate:      time.Now().Format(time.RFC3339),
		HarvestLocation:  GeoLocation{Latitude: latitude, Longitude: longitude, Address: address},
		FarmerID:         farmerID,
		Quantity:         quantity,
		Unit:             unit,
		Status:           "harvested",
		Events:           []HerbEvent{harvestEvent},
		CreatedAt:        time.Now().Format(time.RFC3339),
		UpdatedAt:        time.Now().Format(time.RFC3339),
		ComplianceStatus: complianceStatus,
		QualityMetrics:   QualityMetrics{},
		IPFSHashes:       make(map[string]string),
		QRCodeGenerated:  false,
		Metadata:         make(map[string]interface{}),
	}

	// Store batch
	batchJSON, err := json.Marshal(herbBatch)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("batch_"+batchID, batchJSON)
}

// AddEvent adds a new event to an existing herb batch
func (s *HerbTraceabilityContract) AddEvent(ctx contractapi.TransactionContextInterface, batchID, eventType, actorID, description string, latitude, longitude float64, ipfsHash string, qualityDataJSON string) error {
	// Get existing batch
	batch, err := s.GetHerbBatch(ctx, batchID)
	if err != nil {
		return err
	}

	// Validate actor
	actor, err := s.GetUser(ctx, actorID)
	if err != nil {
		return err
	}

	// Check permissions
	if !s.hasPermission(actor, eventType) {
		return fmt.Errorf("user %s does not have permission to perform %s", actorID, eventType)
	}

	// Parse quality data
	var qualityData map[string]interface{}
	if qualityDataJSON != "" {
		err = json.Unmarshal([]byte(qualityDataJSON), &qualityData)
		if err != nil {
			return err
		}
	}

	// Create new event
	newEvent := HerbEvent{
		EventID:     fmt.Sprintf("event_%s_%d", batchID, time.Now().Unix()),
		EventType:   eventType,
		Timestamp:   time.Now().Format(time.RFC3339),
		Location:    GeoLocation{Latitude: latitude, Longitude: longitude},
		ActorID:     actorID,
		ActorRole:   actor.Role,
		Description: description,
		IPFSHash:    ipfsHash,
		QualityData: qualityData,
		Compliance:  ComplianceCheck{CheckedAt: time.Now().Format(time.RFC3339)},
	}

	// Perform compliance checks
	complianceStatus, err := s.checkCompliance(ctx, newEvent)
	if err != nil {
		return err
	}

	// Update batch
	batch.Events = append(batch.Events, newEvent)
	batch.UpdatedAt = time.Now().Format(time.RFC3339)
	batch.ComplianceStatus = complianceStatus

	// Update status based on event type
	batch.Status = s.updateStatus(batch.Status, eventType)

	// Store updated batch
	batchJSON, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("batch_"+batchID, batchJSON)
}

// GetHerbBatch retrieves a herb batch by ID
func (s *HerbTraceabilityContract) GetHerbBatch(ctx contractapi.TransactionContextInterface, batchID string) (*HerbBatch, error) {
	batchJSON, err := ctx.GetStub().GetState("batch_" + batchID)
	if err != nil {
		return nil, err
	}
	if batchJSON == nil {
		return nil, fmt.Errorf("batch %s does not exist", batchID)
	}

	var batch HerbBatch
	err = json.Unmarshal(batchJSON, &batch)
	if err != nil {
		return nil, err
	}

	return &batch, nil
}

// GetUser retrieves a user by ID
func (s *HerbTraceabilityContract) GetUser(ctx contractapi.TransactionContextInterface, userID string) (*User, error) {
	userJSON, err := ctx.GetStub().GetState("user_" + userID)
	if err != nil {
		return nil, err
	}
	if userJSON == nil {
		return nil, fmt.Errorf("user %s does not exist", userID)
	}

	var user User
	err = json.Unmarshal(userJSON, &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// GenerateQRCode generates a QR code for a batch when packaging is complete
func (s *HerbTraceabilityContract) GenerateQRCode(ctx contractapi.TransactionContextInterface, batchID string) error {
	batch, err := s.GetHerbBatch(ctx, batchID)
	if err != nil {
		return err
	}

	// Check if batch is ready for QR code generation (packaging complete)
	if batch.Status != "packaged" {
		return fmt.Errorf("batch %s is not ready for QR code generation. Current status: %s", batchID, batch.Status)
	}

	// Generate QR code data
	qrData := map[string]interface{}{
		"batchId": batchID,
		"species": batch.Species,
		"status":  batch.Status,
		"url":     fmt.Sprintf("https://traceability.ayurvedic-herbs.com/batch/%s", batchID),
		"timestamp": time.Now().Format(time.RFC3339),
	}

	qrDataJSON, err := json.Marshal(qrData)
	if err != nil {
		return err
	}

	// Update batch with QR code information
	batch.QRCodeGenerated = true
	batch.QRCodeHash = fmt.Sprintf("%x", qrDataJSON) // Simple hash for demo
	batch.UpdatedAt = time.Now().Format(time.RFC3339)

	// Store updated batch
	batchJSON, err := json.Marshal(batch)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("batch_"+batchID, batchJSON)
}

// checkCompliance performs compliance checks for an event
func (s *HerbTraceabilityContract) checkCompliance(ctx contractapi.TransactionContextInterface, event HerbEvent) (ComplianceStatus, error) {
	compliance := ComplianceStatus{
		LastChecked: time.Now().Format(time.RFC3339),
		Violations:  []string{},
	}

	// Geo-fencing check
	compliance.GeoFencing = s.checkGeoFencing(event.Location)

	// Seasonal check
	compliance.Seasonal = s.checkSeasonalRestrictions(event)

	// Quality check
	compliance.Quality = s.checkQualityStandards(event)

	// Species check
	compliance.Species = s.checkSpeciesConservation(event)

	// Overall compliance
	compliance.Overall = compliance.GeoFencing && compliance.Seasonal && compliance.Quality && compliance.Species

	return compliance, nil
}

// checkGeoFencing validates if the location is within allowed zones
func (s *HerbTraceabilityContract) checkGeoFencing(location GeoLocation) bool {
	// Define allowed harvest zones (latitude, longitude, radius in meters)
	allowedZones := [][]float64{
		{12.9716, 77.5946, 1000}, // Bangalore
		{19.0760, 72.8777, 1000}, // Mumbai
		{28.7041, 77.1025, 1000}, // Delhi
	}

	for _, zone := range allowedZones {
		distance := s.calculateDistance(location.Latitude, location.Longitude, zone[0], zone[1])
		if distance <= zone[2] {
			return true
		}
	}

	return false
}

// checkSeasonalRestrictions validates seasonal harvesting rules
func (s *HerbTraceabilityContract) checkSeasonalRestrictions(event HerbEvent) bool {
	// For demo purposes, allow harvesting in specific months
	// In production, this would check against species-specific seasonal data
	eventTime, err := time.Parse(time.RFC3339, event.Timestamp)
	if err != nil {
		return false
	}

	month := eventTime.Month()
	// Allow harvesting in months 3-11 (March to November)
	return month >= 3 && month <= 11
}

// checkQualityStandards validates quality requirements
func (s *HerbTraceabilityContract) checkQualityStandards(event HerbEvent) bool {
	// Basic quality checks based on event type
	switch event.EventType {
	case "harvest":
		return true // Harvest events are always valid
	case "quality_test":
		// Check if quality data meets standards
		if purity, exists := event.QualityData["purity"]; exists {
			if purityFloat, ok := purity.(float64); ok {
				return purityFloat >= 95.0 // Minimum 95% purity
			}
		}
		return false
	default:
		return true
	}
}

// checkSpeciesConservation validates species-specific conservation rules
func (s *HerbTraceabilityContract) checkSpeciesConservation(event HerbEvent) bool {
	// For demo purposes, all species are allowed
	// In production, this would check against conservation databases
	return true
}

// calculateDistance calculates distance between two coordinates using Haversine formula
func (s *HerbTraceabilityContract) calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000 // Earth's radius in meters
	dLat := (lat2 - lat1) * 3.14159265359 / 180
	dLon := (lon2 - lon1) * 3.14159265359 / 180
	a := 0.5 - 0.5*math.Cos(dLat) + 0.5*math.Cos(lat1*3.14159265359/180)*math.Cos(lat2*3.14159265359/180)*(1-math.Cos(dLon))
	return R * math.Asin(math.Sqrt(a))
}

// hasPermission checks if a user has permission to perform an action
func (s *HerbTraceabilityContract) hasPermission(user *User, action string) bool {
	permissionMap := map[string][]string{
		"harvest":        {"create_batch", "add_harvest_event"},
		"processing":     {"add_processing_event"},
		"quality_test":   {"add_quality_test"},
		"packaging":      {"add_packaging_event"},
		"transport":      {"add_transport_event"},
		"retail":         {"add_retail_event"},
	}

	requiredPermissions, exists := permissionMap[action]
	if !exists {
		return false
	}

	for _, permission := range requiredPermissions {
		for _, userPermission := range user.Permissions {
			if userPermission == permission {
				return true
			}
		}
	}

	return false
}

// updateStatus updates batch status based on event type
func (s *HerbTraceabilityContract) updateStatus(currentStatus, eventType string) string {
	statusFlow := map[string]string{
		"harvest":      "harvested",
		"processing":   "processed",
		"quality_test": "tested",
		"packaging":    "packaged",
		"transport":    "in_transit",
		"retail":       "retailed",
	}

	if newStatus, exists := statusFlow[eventType]; exists {
		return newStatus
	}

	return currentStatus
}

// QueryAllBatches returns all herb batches
func (s *HerbTraceabilityContract) QueryAllBatches(ctx contractapi.TransactionContextInterface) ([]*HerbBatch, error) {
	startKey := "batch_"
	endKey := "batch_zzzzzzzzzz"

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var batches []*HerbBatch
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var batch HerbBatch
		err = json.Unmarshal(queryResponse.Value, &batch)
		if err != nil {
			return nil, err
		}
		batches = append(batches, &batch)
	}

	return batches, nil
}

// QueryBatchesBySpecies returns all batches of a specific species
func (s *HerbTraceabilityContract) QueryBatchesBySpecies(ctx contractapi.TransactionContextInterface, species string) ([]*HerbBatch, error) {
	queryString := fmt.Sprintf(`{"selector":{"species":"%s"}}`, species)
	return s.getQueryResults(ctx, queryString)
}

// QueryBatchesByFarmer returns all batches from a specific farmer
func (s *HerbTraceabilityContract) QueryBatchesByFarmer(ctx contractapi.TransactionContextInterface, farmerID string) ([]*HerbBatch, error) {
	queryString := fmt.Sprintf(`{"selector":{"farmerId":"%s"}}`, farmerID)
	return s.getQueryResults(ctx, queryString)
}

// getQueryResults executes a CouchDB query and returns results
func (s *HerbTraceabilityContract) getQueryResults(ctx contractapi.TransactionContextInterface, queryString string) ([]*HerbBatch, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var batches []*HerbBatch
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var batch HerbBatch
		err = json.Unmarshal(queryResponse.Value, &batch)
		if err != nil {
			return nil, err
		}
		batches = append(batches, &batch)
	}

	return batches, nil
}

func main() {
	herbTraceabilityContract, err := contractapi.NewChaincode(&HerbTraceabilityContract{})
	if err != nil {
		fmt.Printf("Error creating herb traceability chaincode: %s", err.Error())
		return
	}

	if err := herbTraceabilityContract.Start(); err != nil {
		fmt.Printf("Error starting herb traceability chaincode: %s", err.Error())
	}
}
