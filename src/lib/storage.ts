import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'lovenest-db';
const DB_VERSION = 1;
const STORE_NAME = 'app-state';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveState<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, JSON.parse(JSON.stringify(value)), key);
}

export async function loadState<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}

export async function clearAllState(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const keys = await db.getAllKeys(STORE_NAME);
  const data: Record<string, unknown> = {};
  for (const key of keys) {
    data[String(key)] = await db.get(STORE_NAME, key);
  }
  return JSON.stringify(data, null, 2);
}

export async function importAllData(jsonStr: string): Promise<void> {
  const data = JSON.parse(jsonStr) as Record<string, unknown>;
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const [key, value] of Object.entries(data)) {
    await tx.store.put(value, key);
  }
  await tx.done;
}
