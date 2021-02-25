import { StorageDriver } from '@pulsejs/wave';

const SqliteStorage: StorageDriver = {
  createTable: () => undefined,
  createDocument: () => undefined
}

export default SqliteStorage;