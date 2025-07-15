chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "defineWord",
    title: "Define selected word",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab?.id) return;

  const word = info.selectionText.trim();
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

  try {
  const response = await fetch(apiUrl);

  if (!response.ok) throw new Error("API returned error");

  const data = await response.json();

  if (!Array.isArray(data) || !data[0]?.meanings) {
    throw new Error("No valid definition found");
  }

  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["style.css"]
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });

  await chrome.tabs.sendMessage(tab.id, {
    type: "SHOW_DEFINITION",
    word,
    data
  });
} catch (error) {
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["style.css"]
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });

  await chrome.tabs.sendMessage(tab.id, {
    type: "SHOW_DEFINITION_ERROR",
    word,
    message: error.message
  });
}

});
