(async () => {
    console.log("Activating Disboard filter");

    // Get the element containing the server elements
    const container = document.querySelector("div.columns:nth-child(5)");

    // Get the server elements
    const serverElements = [...container.querySelectorAll("div.column div.listing-card")];

    // Transform into a Objects containing information for further processing
    const servers = serverElements.map((serverElement, serverIdx) => {
        return {
            originalElement: serverElement.parentElement,
            serverIdx,
            serverName: getServerName(serverElement),
            serverTags: getServerTags(serverElement),
            serverId: getServerId(serverElement)
        }
    });

    // Obtain pure JSON Objects
    const serversInfo = servers.map(({ serverIdx, serverName, serverTags, serverId }) => {
        return { serverIdx, serverName, serverTags, serverId };
    });

    // Ask the background script to filter servers out (it should give the forbidden servers as response)
    // It seems that background isn't waking up immediatly for some reason
    // so we try until we get a response
    let forbiddenServers = undefined;
    while (forbiddenServers === undefined) {
        try {
            forbiddenServers = await browser.runtime.sendMessage({type: "filter", data: serversInfo});
        } catch (err) {
            continue;
        }
    }

    console.log(forbiddenServers);

    // Remove from the container the forbidden servers
    for (let {serverIdx} of forbiddenServers) {
        container.removeChild(servers[serverIdx].originalElement);
    }

    // Ask the background to store the servers for future usage in filtering
    await browser.runtime.sendMessage({type: "add-servers", data: serversInfo});

    console.log("Filtering done");
})();

//
// Utility Functions
//

/**
 * 
 * @param {HTMLDivElement} serverElement 
 * @returns {string}
 */
function getServerName(serverElement) {
    return serverElement.querySelector("div.server-name a").innerText;
}

/**
 * 
 * @param {HTMLDivElement} serverElement
 * @returns {string[]} 
 */
function getServerTags(serverElement) {
    const tagElements = [...serverElement.querySelectorAll("div.server-tags ul.tags li a.tag")];

    return tagElements.map(tagElement => tagElement.innerText);
}

/**
 * 
 * @param {HTMLDivElement} serverElement 
 * @returns string
 */
function getServerId(serverElement) {
    return serverElement.classList[1].replace("server-", "");
}