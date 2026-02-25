// Tagesspiegel Filter - Popup Script
// Uses canonical section IDs for robust hide matching.

const FALLBACK_SECTIONS = [
  'Politik',
  'Internationales',
  'Berlin',
  'Bezirke',
  'Gesellschaft',
  'Wirtschaft',
  'Kultur',
  'Wissen',
  'Gesundheit',
  'Sport',
  'Meinung',
  'Potsdam',
  'Podcasts',
  'Videos',
  'Tagesspiegel Plus',
  'Eilmeldung',
  'Kommentare',
  'Games'
];

const DEFAULT_SETTINGS = {
  hiddenSections: [], // legacy labels
  hiddenSectionIds: [] // canonical IDs
};

let availableSections = []; // [{ id, label }]
let hiddenSectionIds = [];
let hiddenSections = [];
let listenersBound = false;

const sectionsGrid = document.getElementById('sectionsGrid');

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return normalizeWhitespace(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function dedupeSectionIds(ids) {
  return Array.from(new Set((ids || []).map((id) => slugify(id)).filter(Boolean)));
}

function sectionOptionsFromLabels(labels) {
  const unique = new Map();
  labels.forEach((label, index) => {
    const normalizedLabel = normalizeWhitespace(label);
    const id = slugify(normalizedLabel);
    if (!id || unique.has(id)) {
      return;
    }
    unique.set(id, { id, label: normalizedLabel || id, order: index });
  });
  return Array.from(unique.values());
}

function parseDetectedSections(rawDetectedSections) {
  if (!Array.isArray(rawDetectedSections) || rawDetectedSections.length === 0) {
    return sectionOptionsFromLabels(FALLBACK_SECTIONS);
  }

  if (typeof rawDetectedSections[0] === 'string') {
    return sectionOptionsFromLabels(rawDetectedSections);
  }

  const unique = new Map();
  rawDetectedSections.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const id = slugify(entry.id || entry.label);
    const label = normalizeWhitespace(entry.label || entry.id);
    if (!id || !label || unique.has(id)) {
      return;
    }

    const order = typeof entry.order === 'number' ? entry.order : index;
    unique.set(id, { id, label, order });
  });

  if (unique.size === 0) {
    return sectionOptionsFromLabels(FALLBACK_SECTIONS);
  }

  return Array.from(unique.values()).sort((a, b) => {
    const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.label.localeCompare(b.label);
  });
}

function showLoading() {
  sectionsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:#b0b0b0;">Detecting sections...</div>';
}

async function loadSettings() {
  try {
    const result = await browser.storage.local.get(DEFAULT_SETTINGS);
    hiddenSections = Array.isArray(result.hiddenSections) ? result.hiddenSections : [];
    hiddenSectionIds = dedupeSectionIds(result.hiddenSectionIds);
  } catch (error) {
    console.error('Error loading settings:', error);
    hiddenSections = [];
    hiddenSectionIds = [];
  }
}

async function loadSections() {
  try {
    const result = await browser.storage.local.get(['detectedSections']);
    availableSections = parseDetectedSections(result.detectedSections);
  } catch (error) {
    console.error('Error loading sections:', error);
    availableSections = sectionOptionsFromLabels(FALLBACK_SECTIONS);
  }
}

async function migrateLegacyHiddenSectionsIfNeeded() {
  if (hiddenSectionIds.length > 0 || hiddenSections.length === 0 || availableSections.length === 0) {
    return;
  }

  const bySlug = new Map();
  availableSections.forEach((section) => {
    bySlug.set(slugify(section.id), section.id);
    bySlug.set(slugify(section.label), section.id);
  });

  const migrated = hiddenSections
    .map((label) => bySlug.get(slugify(label)))
    .filter(Boolean);

  if (migrated.length === 0) {
    return;
  }

  hiddenSectionIds = dedupeSectionIds(migrated);
  await saveHiddenSelections();
}

function renderSectionCheckboxes() {
  sectionsGrid.innerHTML = '';

  if (availableSections.length === 0) {
    sectionsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:#b0b0b0;">No sections detected. Visit tagesspiegel.de first!</div>';
    return;
  }

  availableSections.forEach((section) => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'section-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `section-${section.id}`;
    checkbox.dataset.sectionId = section.id;
    checkbox.checked = hiddenSectionIds.includes(section.id);

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = section.label;

    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(label);
    sectionsGrid.appendChild(checkboxWrapper);
  });
}

async function saveSetting(key, value) {
  try {
    await browser.storage.local.set({ [key]: value });
    await browser.storage.sync.set({ [key]: value }).catch(() => {});
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
}

async function saveHiddenSelections() {
  hiddenSectionIds = dedupeSectionIds(hiddenSectionIds);
  const sectionLabels = availableSections
    .filter((section) => hiddenSectionIds.includes(section.id))
    .map((section) => section.label);

  hiddenSections = sectionLabels;

  try {
    await browser.storage.local.set({
      hiddenSectionIds,
      hiddenSections
    });
    await browser.storage.sync.set({
      hiddenSectionIds,
      hiddenSections
    }).catch(() => {});
  } catch (error) {
    console.error('Error saving hidden sections:', error);
  }
}

async function toggleSection(sectionId, isChecked) {
  if (isChecked) {
    hiddenSectionIds.push(sectionId);
  } else {
    hiddenSectionIds = hiddenSectionIds.filter((id) => id !== sectionId);
  }

  await saveHiddenSelections();
}

function showStatusMessage(message) {
  const existing = document.querySelector('.status-message');
  if (existing) {
    existing.remove();
  }

  const statusElement = document.createElement('div');
  statusElement.className = 'status-message visible';
  statusElement.textContent = message;
  document.body.appendChild(statusElement);

  setTimeout(() => {
    statusElement.classList.remove('visible');
    setTimeout(() => statusElement.remove(), 300);
  }, 2000);
}

function setupEventListeners() {
  if (listenersBound) {
    return;
  }
  listenersBound = true;

  sectionsGrid.addEventListener('change', async (event) => {
    if (event.target.type !== 'checkbox') {
      return;
    }

    const sectionId = event.target.dataset.sectionId;
    if (!sectionId) {
      return;
    }

    await toggleSection(sectionId, event.target.checked);
    showStatusMessage('Settings saved!');
  });

  const refreshButton = document.getElementById('refreshSections');
  if (refreshButton) {
    refreshButton.addEventListener('click', async () => {
      showLoading();
      await loadSections();
      await migrateLegacyHiddenSectionsIfNeeded();
      renderSectionCheckboxes();
      showStatusMessage('Sections refreshed!');
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  await loadSettings();
  await loadSections();
  await migrateLegacyHiddenSectionsIfNeeded();
  renderSectionCheckboxes();
  setupEventListeners();
});
