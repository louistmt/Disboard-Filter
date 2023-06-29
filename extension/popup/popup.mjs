// Occasionally update the server count
setInterval(setVisitedCount, 3000);

// Add event listeners
document.getElementById("update-tags").addEventListener("click", updateBannedTags);
document.getElementById("clear-visited").addEventListener("click", clearVisitedServers);


setVisitedCount();
setBannedTags();
//
// Functions
//

async function setVisitedCount() {
    const counter = document.getElementById("visited-count");
    const count = await browser.runtime.sendMessage({type: "count-servers"});
    counter.innerText = `${count}`;
}

async function setBannedTags() {
    const destination = document.getElementById("banned-tags");
    const tags = await browser.runtime.sendMessage({type: "get-tags"});
    destination.innerText = tags.join(", ");
}

async function updateBannedTags() {
    const textarea = document.getElementById("banned-tags");
    const tags = textarea.value.split(",").map(t => t.trim().toUpperCase());
    await browser.runtime.sendMessage({type: "update-tags", data: tags});
}

async function clearVisitedServers() {
    await browser.runtime.sendMessage({type: "clear-servers"});
    setVisitedCount();
}