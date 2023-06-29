
/**
 * 
 * @param {string} name
 * @param {{version: number, stores: {name: string, keyPath: string}[]}} options
 * @returns {IDBDatabase} 
 */
export function openDB(name, {version, stores}) {
    const request = indexedDB.open(name, version);

    return new Promise((resolve, reject) => {
        request.onsuccess = (ev) => {
            console.log("Database request completed");
            resolve(ev.target.result)
        };
        request.onupgradeneeded = (ev) => {
            console.log("Creating/Updating database");
            /**
             * @type {IDBDatabase}
             */
            const db = ev.target.result;
            
            for (let dbName of db.objectStoreNames) {
                db.deleteObjectStore(dbName);
            }

            for (let {name, keyPath} of stores) {
                db.createObjectStore(name, {keyPath});
            }
        };
        request.onerror = reject;
    });
}

/**
 * 
 * @param {IDBDatabase} db
 * @param {string} name 
 */
export function clearStore(db, name) {
    console.log("Clear called");
    const transaction = db.transaction([name], "readwrite");
    const store = transaction.objectStore(name);

    const request = store.clear();
    return new Promise((resolve, reject) => {
        request.onsuccess = resolve;
        request.onerror = reject;
    });
}

/**
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @returns {Promise<number>}
 */
export function count(db, storeName) {
    console.log("Count called");
    
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.count();
    return new Promise((resolve, reject) => {
        request.onsuccess = (ev) => {resolve(ev.target.result)};
        request.onerror = reject;
    });
}

/**
 * 
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @param {string} objKey
 * @returns {Promise<any>}
 */
export function get(db, storeName, objKey) {
    console.log("Get called");

    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.get(objKey);
    return new Promise((resolve, reject) => {
        request.onsuccess = (ev) => {resolve(ev.target.result)};
        request.onerror = reject;
    })
}

/**
 * 
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @returns {Promise<any[]>}
 */
export function getAll(db, storeName) {
    console.log("Get all called");
    
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);

    const request = store.getAll();
    return new Promise((resolve, reject) => {
        request.onsuccess = (ev) => {resolve(ev.target.result)};
        request.onerror = reject;
    });
}

/**
 * 
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @param  {...any} objs
 */
export function put(db, storeName, ...objs) {
    console.log("Put called");

    if (objs.length === 0) return Promise.resolve();

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onabort = reject;
        transaction.onerror = reject;

        for (let obj of objs) {
            store.put(obj);
        }
    });
}