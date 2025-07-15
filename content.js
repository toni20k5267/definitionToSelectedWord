chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_DEFINITION") {
    showPopup(message.word, message.data);
  } else if (message.type === "SHOW_DEFINITION_ERROR") {
    showErrorPopup(message.word, message.message);
  }
});

function showPopup(word, data) {
  removeExistingPopup();

  const entry = Array.isArray(data) ? data[0] : null;
  if (!entry) return;

  const popup = document.createElement("div");
  popup.className = "dictionary-popup";

  const scroll = document.createElement("div");
  scroll.className = "dictionary-scroll";

  const html = [];

  html.push(`<h1>${entry.word}</h1>`);
  if (entry.phonetic) html.push(`<p class="phonetic">${entry.phonetic}</p>`);

  entry.meanings?.forEach((meaning) => {
    html.push(`<div class="meaning">`);
    html.push(`<h2>${meaning.partOfSpeech}</h2>`);
    meaning.definitions?.forEach((def, i) => {
      html.push(`<p>${i + 1}. ${def.definition}</p>`);
      if (def.example) html.push(`<blockquote>“${def.example}”</blockquote>`);
      if (def.synonyms?.length) {
        html.push(`<p class="synonyms">Synonyms: ${def.synonyms.slice(0, 5).join(", ")}</p>`);
      }
    });
    html.push(`</div>`);
  });

  scroll.innerHTML = html.join("");
  popup.appendChild(scroll);
document.body.appendChild(popup);

  requestAnimationFrame(() => {
    const selection = window.getSelection();
    const range = selection.rangeCount ? selection.getRangeAt(0) : null;
    const rect = range?.getBoundingClientRect();

    if (rect) {
      const popupRect = popup.getBoundingClientRect();
      const margin = 10;

      let top = rect.bottom + window.scrollY + 10;
      let left = rect.left + window.scrollX;

      if (top + popupRect.height > window.innerHeight + window.scrollY - margin) {
        top = rect.top + window.scrollY - popupRect.height - 10;
      }

      if (left + popupRect.width > window.innerWidth - margin) {
        left = window.innerWidth - popupRect.width - margin;
      }

      left = Math.max(margin, left);

      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
    }
  });

  document.addEventListener("click", removeExistingPopup, { once: true });
}
function showErrorPopup(word, errorMessage) {
  removeExistingPopup();

  const popup = document.createElement("div");
  popup.className = "dictionary-popup";

  const scroll = document.createElement("div");
  scroll.className = "dictionary-scroll";

  scroll.innerHTML = `
    <h1>Oops!</h1>
    <p>Couldn’t find a definition for "<strong>${word}</strong>". Try selecting a single word, and make sure the word is in english.</p>
    <p style="color: #999; font-size: 13px;">${errorMessage}</p>
  `;

  popup.appendChild(scroll);
  document.body.appendChild(popup);

  const selection = window.getSelection();
  const range = selection.rangeCount ? selection.getRangeAt(0) : null;
  const rect = range?.getBoundingClientRect();

  if (rect) {
    const popupRect = popup.getBoundingClientRect();
    const margin = 10;

    let top = rect.bottom + window.scrollY + 10;
    let left = rect.left + window.scrollX;

    if (top + popupRect.height > window.innerHeight + window.scrollY - margin) {
      top = rect.top + window.scrollY - popupRect.height - 10;
    }

    if (left + popupRect.width > window.innerWidth - margin) {
      left = window.innerWidth - popupRect.width - margin;
    }

    left = Math.max(margin, left);

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }

  document.addEventListener("click", removeExistingPopup, { once: true });
}
function removeExistingPopup() {
  document.querySelectorAll(".dictionary-popup").forEach(el => el.remove());
}
