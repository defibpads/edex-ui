const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('edexSecurity', Object.freeze({
    contextIsolation: true,
    nodeIntegrationMigration: 'pending',
    remoteMigration: 'pending'
}));
