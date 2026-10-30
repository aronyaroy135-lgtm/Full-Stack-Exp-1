const STORAGE_KEY = "draftManagementSystem.drafts.v1";

const form = document.getElementById("draftForm");
const draftIdInput = document.getElementById("draftId");
const titleInput = document.getElementById("postTitle");
const contentInput = document.getElementById("postContent");
const categoryInput = document.getElementById("postCategory");
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const formTitle = document.getElementById("formTitle");
const draftList = document.getElementById("draftList");
const emptyState = document.getElementById("emptyState");
const draftCount = document.getElementById("draftCount");
const searchInput = document.getElementById("searchInput");
const statusMessage = document.getElementById("statusMessage");
const charCount = document.getElementById("charCount");

let drafts = loadDrafts();

function loadDrafts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not read saved drafts:", error);
    return [];
  }
}

function persistDrafts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch (error) {
    showStatus("Could not save drafts. Browser storage may be full.", true);
    return false;
  }
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#c2414b" : "#15803d";
}

function resetForm() {
  form.reset();
  draftIdInput.value = "";
  formTitle.textContent = "Create a draft";
  saveButton.textContent = "Save draft";
  charCount.textContent = "0 / 5000 characters";
}

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function renderDrafts(filter = "") {
  draftList.innerHTML = "";
  const normalizedFilter = filter.trim().toLowerCase();
  const visibleDrafts = drafts
    .filter(draft => `${draft.title} ${draft.content} ${draft.category}`.toLowerCase().includes(normalizedFilter))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  draftCount.textContent = drafts.length;
  emptyState.style.display = visibleDrafts.length ? "none" : "block";
  if (!visibleDrafts.length && normalizedFilter) {
    emptyState.querySelector("h3").textContent = "No matching drafts";
    emptyState.querySelector("p").textContent = "Try a different search term.";
  } else if (!visibleDrafts.length) {
    emptyState.querySelector("h3").textContent = "No drafts yet";
    emptyState.querySelector("p").textContent = "Create your first draft using the form.";
  }

  visibleDrafts.forEach(draft => {
    const card = document.createElement("article");
    card.className = "draft-card";

    const top = document.createElement("div");
    top.className = "card-top";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = draft.title;
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = draft.category;
    top.append(title);

    const content = document.createElement("p");
    content.className = "card-content";
    const preview = draft.content.length > 180 ? draft.content.slice(0, 180) + "…" : draft.content;
    content.textContent = preview;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = `Updated ${formatDate(draft.updatedAt)}`;

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const editButton = document.createElement("button");
    editButton.className = "edit-btn";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editDraft(draft.id));

    const copyButton = document.createElement("button");
    copyButton.className = "secondary";
    copyButton.type = "button";
    copyButton.textContent = "Copy text";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(`${draft.title}\n\n${draft.content}`);
        showStatus("Draft copied to clipboard.");
      } catch {
        showStatus("Clipboard access is unavailable in this browser.", true);
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteDraft(draft.id));

    actions.append(editButton, copyButton, deleteButton);
    card.append(top, category, content, meta, actions);
    draftList.appendChild(card);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) {
    showStatus("Please enter both a title and content.", true);
    return;
  }

  const now = new Date().toISOString();
  const existingId = draftIdInput.value;
  if (existingId) {
    const index = drafts.findIndex(draft => draft.id === existingId);
    if (index !== -1) {
      drafts[index] = { ...drafts[index], title, content, category: categoryInput.value, updatedAt: now };
      if (!persistDrafts()) return;
      showStatus("Draft updated successfully.");
    }
  } else {
    drafts.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      title, content, category: categoryInput.value,
      createdAt: now, updatedAt: now
    });
    if (!persistDrafts()) return;
    showStatus("Draft saved successfully.");
  }

  resetForm();
  renderDrafts(searchInput.value);
});

function editDraft(id) {
  const draft = drafts.find(item => item.id === id);
  if (!draft) return;
  draftIdInput.value = draft.id;
  titleInput.value = draft.title;
  contentInput.value = draft.content;
  categoryInput.value = draft.category;
  formTitle.textContent = "Edit draft";
  saveButton.textContent = "Update draft";
  charCount.textContent = `${draft.content.length} / 5000 characters`;
  showStatus("Edit the fields and select Update draft.");
  titleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteDraft(id) {
  const draft = drafts.find(item => item.id === id);
  if (!draft || !window.confirm(`Delete "${draft.title}"? This cannot be undone.`)) return;
  drafts = drafts.filter(item => item.id !== id);
  if (!persistDrafts()) return;
  if (draftIdInput.value === id) resetForm();
  renderDrafts(searchInput.value);
  showStatus("Draft deleted.");
}

clearButton.addEventListener("click", () => {
  resetForm();
  showStatus("Form cleared.");
});

searchInput.addEventListener("input", () => renderDrafts(searchInput.value));
contentInput.addEventListener("input", () => {
  charCount.textContent = `${contentInput.value.length} / 5000 characters`;
});

renderDrafts();
