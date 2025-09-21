/**
 * Offline Storage Utility for Ayurvedic Herb Traceability System
 * 
 * Provides offline functionality using IndexedDB for storing events
 * when the user is offline, with automatic sync when connection is restored.
 */

class OfflineStorage {
  constructor() {
    this.dbName = 'HerbTraceabilityDB';
    this.dbVersion = 1;
    this.db = null;
    this.initPromise = this.init();
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineEvents')) {
          const eventStore = db.createObjectStore('offlineEvents', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          eventStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventStore.createIndex('batchId', 'batchId', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineBatches')) {
          const batchStore = db.createObjectStore('offlineBatches', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          batchStore.createIndex('batchId', 'batchId', { unique: true });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Wait for initialization
  async ready() {
    await this.initPromise;
  }

  // Store event offline
  async storeEvent(eventData, token) {
    await this.ready();

    const offlineEvent = {
      eventData,
      token,
      timestamp: new Date().toISOString(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineEvents'], 'readwrite');
      const store = transaction.objectStore('offlineEvents');
      const request = store.add(offlineEvent);

      request.onsuccess = () => {
        console.log('Event stored offline:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to store event offline:', request.error);
        reject(request.error);
      };
    });
  }

  // Store batch offline
  async storeBatch(batchData, token) {
    await this.ready();

    const offlineBatch = {
      batchData,
      token,
      timestamp: new Date().toISOString(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBatches'], 'readwrite');
      const store = transaction.objectStore('offlineBatches');
      const request = store.add(offlineBatch);

      request.onsuccess = () => {
        console.log('Batch stored offline:', request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Failed to store batch offline:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all offline events
  async getOfflineEvents() {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineEvents'], 'readonly');
      const store = transaction.objectStore('offlineEvents');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get all offline batches
  async getOfflineBatches() {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBatches'], 'readonly');
      const store = transaction.objectStore('offlineBatches');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Mark event as synced
  async markEventSynced(id) {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineEvents'], 'readwrite');
      const store = transaction.objectStore('offlineEvents');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const event = getRequest.result;
        if (event) {
          event.synced = true;
          const updateRequest = store.put(event);
          
          updateRequest.onsuccess = () => {
            resolve();
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  // Mark batch as synced
  async markBatchSynced(id) {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBatches'], 'readwrite');
      const store = transaction.objectStore('offlineBatches');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const batch = getRequest.result;
        if (batch) {
          batch.synced = true;
          const updateRequest = store.put(batch);
          
          updateRequest.onsuccess = () => {
            resolve();
          };
          
          updateRequest.onerror = () => {
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  // Remove synced events
  async removeSyncedEvents() {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineEvents'], 'readwrite');
      const store = transaction.objectStore('offlineEvents');
      const index = store.index('timestamp');
      const range = IDBKeyRange.only(true);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Remove synced batches
  async removeSyncedBatches() {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineBatches'], 'readwrite');
      const store = transaction.objectStore('offlineBatches');
      const index = store.index('timestamp');
      const range = IDBKeyRange.only(true);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get offline data count
  async getOfflineDataCount() {
    await this.ready();

    const [events, batches] = await Promise.all([
      this.getOfflineEvents(),
      this.getOfflineBatches()
    ]);

    return {
      events: events.length,
      batches: batches.length,
      total: events.length + batches.length
    };
  }

  // Clear all offline data
  async clearAllOfflineData() {
    await this.ready();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineEvents', 'offlineBatches'], 'readwrite');
      
      const eventStore = transaction.objectStore('offlineEvents');
      const batchStore = transaction.objectStore('offlineBatches');
      
      const eventRequest = eventStore.clear();
      const batchRequest = batchStore.clear();

      Promise.all([eventRequest, batchRequest])
        .then(() => {
          console.log('All offline data cleared');
          resolve();
        })
        .catch((error) => {
          console.error('Failed to clear offline data:', error);
          reject(error);
        });
    });
  }

  // Check if offline
  isOffline() {
    return !navigator.onLine;
  }

  // Listen for online/offline events
  onOnline(callback) {
    window.addEventListener('online', callback);
  }

  onOffline(callback) {
    window.addEventListener('offline', callback);
  }

  // Sync all offline data
  async syncOfflineData() {
    if (this.isOffline()) {
      console.log('Still offline, skipping sync');
      return;
    }

    try {
      console.log('Starting offline data sync...');
      
      const [events, batches] = await Promise.all([
        this.getOfflineEvents(),
        this.getOfflineBatches()
      ]);

      // Sync events
      for (const event of events) {
        if (!event.synced) {
          try {
            await this.syncEvent(event);
            await this.markEventSynced(event.id);
          } catch (error) {
            console.error('Failed to sync event:', error);
          }
        }
      }

      // Sync batches
      for (const batch of batches) {
        if (!batch.synced) {
          try {
            await this.syncBatch(batch);
            await this.markBatchSynced(batch.id);
          } catch (error) {
            console.error('Failed to sync batch:', error);
          }
        }
      }

      // Clean up synced data
      await Promise.all([
        this.removeSyncedEvents(),
        this.removeSyncedBatches()
      ]);

      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Offline data sync failed:', error);
    }
  }

  // Sync individual event
  async syncEvent(event) {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${event.token}`
      },
      body: JSON.stringify(event.eventData)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync event: ${response.statusText}`);
    }

    return response.json();
  }

  // Sync individual batch
  async syncBatch(batch) {
    const response = await fetch('/api/batches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${batch.token}`
      },
      body: JSON.stringify(batch.batchData)
    });

    if (!response.ok) {
      throw new Error(`Failed to sync batch: ${response.statusText}`);
    }

    return response.json();
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

// Set up online/offline listeners
offlineStorage.onOnline(() => {
  console.log('Connection restored, syncing offline data...');
  offlineStorage.syncOfflineData();
});

offlineStorage.onOffline(() => {
  console.log('Connection lost, storing data offline');
});

export default offlineStorage;
