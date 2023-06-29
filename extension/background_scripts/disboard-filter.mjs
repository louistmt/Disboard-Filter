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
    console.log("filter replied");
    if (message.type === "filter") {
        handleFilter(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "add-servers" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    console.log("add-servers replied");
    if (message.type === "add-servers") {
        handleAddServers(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "clear-servers" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    console.log("clear-servers replied");
    if (message.type === "clear-servers") {
        handleClearServers(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "update-tags" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    console.log("update-tags replied");
    if (message.type === "update-tags") {
        handleUpdateTags(message, reply);
        return true;
    } else {
        return false;
    }
});

// Responds to type "get-tags" messages
browser.runtime.onMessage.addListener((message, sender, reply) => {
    console.log("get-tags replied");
    if (message.type === "get-tags") {
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

    console.log(servers);

    for (let server of servers) {
        const {serverId, serverTag} = server;
        const result = (await IDB.get(db, VISITED_STORE, serverId));
        if (result || tagsSet.has(serverTag)) {
            blacklisted.push(server);
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
    console.log(handleUpdateTags.name, "has handle", message);
    reply(`hello from ${handleUpdateTags.name}`);
}

/**
 * 
 * @param {any} message 
 * @param {(any: response) => void} reply 
 */
async function handleGetTags(message, reply) {
    console.log(handleGetTags.name, "has handle", message);
    reply(`hello from ${handleGetTags.name}`);
}