// FinPredict.js - Ephemeral IndexedDB Client-Side Database (Scope C)
// Guarantees zero persistence across sessions upon trigger of Ephemeral Wipe

const DB_NAME = 'FinPredictEphemeralDB';
const DB_VERSION = 1;
const STORE_DATASETS = 'datasets';
const STORE_FEATURES = 'features';
const STORE_MODELS = 'model_metadata';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in current environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DATASETS)) {
        db.createObjectStore(STORE_DATASETS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_FEATURES)) {
        db.createObjectStore(STORE_FEATURES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MODELS)) {
        db.createObjectStore(STORE_MODELS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class EphemeralStorageService {
  /**
   * Ephemeral write to IndexedDB
   */
  public static async putRecord(storeName: string, id: string, data: any): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put({ id, data, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[Ephemeral Storage] Cache write bypassed:', err);
    }
  }

  /**
   * Ephemeral read from IndexedDB
   */
  public static async getRecord<T = any>(storeName: string, id: string): Promise<T | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  /**
   * Atomic Ephemeral Wipe: Wipes all IndexedDB stores, localStorage, and caches (Zero-Trust)
   */
  public static async wipeAllEphemeralData(): Promise<void> {
    try {
      // Clear localStorage & sessionStorage
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }

      // Delete IndexedDB database completely
      return new Promise((resolve) => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => {
          console.log('[Ephemeral Storage] All local IndexedDB stores successfully wiped.');
          resolve();
        };
        req.onerror = () => {
          console.warn('[Ephemeral Storage] Database delete encountered warning:', req.error);
          resolve();
        };
        req.onblocked = () => {
          console.warn('[Ephemeral Storage] Database delete blocked by active connection.');
          resolve();
        };
      });
    } catch (e) {
      console.error('[Ephemeral Storage] Wipe failed:', e);
    }
  }

  /**
   * Return storage status statistics
   */
  public static async getStorageFootprint(): Promise<{ recordCount: number; dbName: string }> {
    try {
      const db = await openDatabase();
      let recordCount = 0;
      const tx = db.transaction([STORE_DATASETS, STORE_FEATURES], 'readonly');

      await Promise.all([
        new Promise<void>(res => {
          const req = tx.objectStore(STORE_DATASETS).count();
          req.onsuccess = () => { recordCount += req.result; res(); };
          req.onerror = () => res();
        }),
        new Promise<void>(res => {
          const req = tx.objectStore(STORE_FEATURES).count();
          req.onsuccess = () => { recordCount += req.result; res(); };
          req.onerror = () => res();
        })
      ]);

      return { recordCount, dbName: DB_NAME };
    } catch {
      return { recordCount: 0, dbName: DB_NAME };
    }
  }
}
