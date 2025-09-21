const mongoose = require('mongoose');

const GeoLocationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  zone: {
    type: String,
    trim: true
  }
}, { _id: false });

const QualityMetricsSchema = new mongoose.Schema({
  purity: {
    type: Number,
    min: 0,
    max: 100
  },
  moisture: {
    type: Number,
    min: 0,
    max: 100
  },
  ashContent: {
    type: Number,
    min: 0,
    max: 100
  },
  heavyMetals: {
    type: Map,
    of: Number
  },
  pesticides: {
    type: Map,
    of: Number
  },
  microbial: {
    type: Map,
    of: Number
  },
  labTested: {
    type: Boolean,
    default: false
  },
  testDate: Date,
  labId: String,
  certificateId: String
}, { _id: false });

const ComplianceStatusSchema = new mongoose.Schema({
  geoFencing: {
    type: Boolean,
    default: true
  },
  seasonal: {
    type: Boolean,
    default: true
  },
  quality: {
    type: Boolean,
    default: true
  },
  species: {
    type: Boolean,
    default: true
  },
  overall: {
    type: Boolean,
    default: true
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  violations: [String]
}, { _id: false });

const HerbEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'harvest',
      'processing',
      'quality_test',
      'packaging',
      'transport',
      'retail'
    ]
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: GeoLocationSchema,
    required: true
  },
  actorId: {
    type: String,
    required: true
  },
  actorRole: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  ipfsHash: String,
  certificates: [String],
  qualityData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  compliance: {
    passed: {
      type: Boolean,
      default: true
    },
    rules: [String],
    violations: [String],
    checkedAt: {
      type: Date,
      default: Date.now
    },
    checkedBy: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

const HerbBatchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: [true, 'Please add a batch ID'],
    unique: true,
    trim: true,
    maxlength: [50, 'Batch ID cannot be more than 50 characters']
  },
  species: {
    type: String,
    required: [true, 'Please add a species'],
    trim: true,
    maxlength: [100, 'Species name cannot be more than 100 characters']
  },
  harvestDate: {
    type: Date,
    required: true
  },
  harvestLocation: {
    type: GeoLocationSchema,
    required: true
  },
  farmerId: {
    type: String,
    required: [true, 'Please add a farmer ID'],
    ref: 'User'
  },
  quantity: {
    type: Number,
    required: [true, 'Please add a quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Please add a unit'],
    enum: ['kg', 'g', 'lb', 'oz', 'tons', 'pieces']
  },
  status: {
    type: String,
    required: true,
    enum: [
      'harvested',
      'processed',
      'tested',
      'packaged',
      'in_transit',
      'retailed'
    ],
    default: 'harvested'
  },
  events: [HerbEventSchema],
  complianceStatus: {
    type: ComplianceStatusSchema,
    default: () => ({})
  },
  qualityMetrics: {
    type: QualityMetricsSchema,
    default: () => ({})
  },
  ipfsHashes: {
    type: Map,
    of: String
  },
  qrCodeGenerated: {
    type: Boolean,
    default: false
  },
  qrCodeHash: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  blockchainTxId: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
HerbBatchSchema.index({ batchId: 1 });
HerbBatchSchema.index({ species: 1 });
HerbBatchSchema.index({ farmerId: 1 });
HerbBatchSchema.index({ status: 1 });
HerbBatchSchema.index({ harvestDate: 1 });
HerbBatchSchema.index({ 'harvestLocation.latitude': 1, 'harvestLocation.longitude': 1 });
HerbBatchSchema.index({ 'events.eventType': 1 });
HerbBatchSchema.index({ 'events.actorId': 1 });
HerbBatchSchema.index({ createdAt: -1 });

// Text search index
HerbBatchSchema.index({
  species: 'text',
  batchId: 'text',
  'events.description': 'text'
});

// Virtual for total events count
HerbBatchSchema.virtual('eventCount').get(function() {
  return this.events.length;
});

// Virtual for latest event
HerbBatchSchema.virtual('latestEvent').get(function() {
  if (this.events.length === 0) return null;
  return this.events[this.events.length - 1];
});

// Virtual for harvest to retail duration
HerbBatchSchema.virtual('supplyChainDuration').get(function() {
  if (this.events.length < 2) return null;
  
  const harvestEvent = this.events.find(e => e.eventType === 'harvest');
  const retailEvent = this.events.find(e => e.eventType === 'retail');
  
  if (!harvestEvent || !retailEvent) return null;
  
  return retailEvent.timestamp - harvestEvent.timestamp;
});

// Pre-save middleware to update compliance status
HerbBatchSchema.pre('save', function(next) {
  if (this.isModified('events') || this.isModified('complianceStatus')) {
    // Update overall compliance based on individual checks
    this.complianceStatus.overall = 
      this.complianceStatus.geoFencing &&
      this.complianceStatus.seasonal &&
      this.complianceStatus.quality &&
      this.complianceStatus.species;
  }
  next();
});

// Method to add event
HerbBatchSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  this.updatedAt = new Date();
  return this.save();
};

// Method to get events by type
HerbBatchSchema.methods.getEventsByType = function(eventType) {
  return this.events.filter(event => event.eventType === eventType);
};

// Method to get events by actor
HerbBatchSchema.methods.getEventsByActor = function(actorId) {
  return this.events.filter(event => event.actorId === actorId);
};

// Method to check if batch is compliant
HerbBatchSchema.methods.isCompliant = function() {
  return this.complianceStatus.overall;
};

// Method to get supply chain timeline
HerbBatchSchema.methods.getSupplyChainTimeline = function() {
  return this.events
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(event => ({
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actorId,
      location: event.location,
      description: event.description
    }));
};

// Static method to find batches by species
HerbBatchSchema.statics.findBySpecies = function(species) {
  return this.find({ species: new RegExp(species, 'i') });
};

// Static method to find batches by farmer
HerbBatchSchema.statics.findByFarmer = function(farmerId) {
  return this.find({ farmerId });
};

// Static method to find batches by status
HerbBatchSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find batches by location range
HerbBatchSchema.statics.findByLocationRange = function(lat, lng, radiusKm) {
  const earthRadius = 6371; // Earth's radius in kilometers
  const latRange = radiusKm / earthRadius * (180 / Math.PI);
  const lngRange = radiusKm / earthRadius * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
  
  return this.find({
    'harvestLocation.latitude': {
      $gte: lat - latRange,
      $lte: lat + latRange
    },
    'harvestLocation.longitude': {
      $gte: lng - lngRange,
      $lte: lng + lngRange
    }
  });
};

// Transform output
HerbBatchSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('HerbBatch', HerbBatchSchema);
