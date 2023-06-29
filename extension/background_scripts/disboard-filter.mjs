import * as IDB from "./idb-promise.mjs";

const VISITED_STORE = "visited-server";
const TAGS_STORE = "blocked-tags";
const db = await IDB.openDB("disboard-filter", {
    version: 1,
    stores: [
        {name: VISITED_STORE, keyPath: "serverId"},
        {name: TAGS_STORE, keyPath: "tag"}
    ]
});

// Responds to type "filter" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type === "filter") {
        console.log("filter replied");
        handleFilter(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "add-servers" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type === "add-servers") {
        console.log("add-servers replied");
        handleAddServers(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "count-servers" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type === "count-servers") {
        console.log("count-servers replied");
        handleCountServers(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "clear-servers" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type === "clear-servers") {
        console.log("clear-servers replied");
        handleClearServers(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "update-tags" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type === "update-tags") {
        console.log("update-tags replied");
        handleUpdateTags(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "get-tags" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type === "get-tags") {
        console.log("get-tags replied");
        handleGetTags(message, reply);
        return true;
    } else {
        return false;
    }
});

console.log("Event handlers added");

//
// Message handlers
//

/**
 * Handle filter requests. Should send back the blacklisted servers
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleFilter(message, reply) {
    const servers = message.data;
    const blacklisted = [];
    const tags = (await IDB.getAll(db, TAGS_STORE)).map(t => t.tag);
    const tagsSet = new Set(tags);

    for (let server of servers) {
        const {serverId, serverTags} = server;

        const result = (await IDB.get(db, VISITED_STORE, serverId));
        if (result) {
            blacklisted.push(server);
            continue;
        }

        for (let serverTag of serverTags) {
            if (tagsSet.has(serverTag)) {
                blacklisted.push(server);
                break;
            }
        }
    }

    reply(blacklisted);
}

/**
 * 
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleAddServers(message, reply) {
    const servers = message.data;
    const entries = servers.map(({serverId}) => {return {serverId}})
    await IDB.put(db, VISITED_STORE, ...entries);
    reply("ok")
}

/**
 * 
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleCountServers(message, reply) {
    reply(await IDB.count(db, VISITED_STORE));
}

/**
 * 
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleClearServers(message, reply) {
    await IDB.clearStore(db, VISITED_STORE)
    reply("ok")
}

/**
 * 
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleUpdateTags(message, reply) {
    const tags = message.data.map(t => {return {tag: t}});
    await IDB.clearStore(db, TAGS_STORE);
    await IDB.put(db, TAGS_STORE, ...tags);
    reply("ok");
}

/**
 * 
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleGetTags(message, reply) {
    const entries = await IDB.getAll(db, TAGS_STORE);
    const tags = entries.map(e => e.tag);
    reply(tags);
}