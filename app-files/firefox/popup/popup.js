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
  'Games',
  'Tagesspiegel Umfrage',
  'Aktuelle Prospekte',
  'Empfohlener redaktioneller Inhalt',
  'Bezirke-Newsletter',
  'Opinary',
  'Weekender',
  'Mehr zu'
];

const SPECIAL_SECTION_DEFINITIONS = [
  {
    id: 'tagesspiegel-umfrage',
    label: 'Tagesspiegel Umfrage',
    matches: (slug) => slug === 'tagesspiegel-umfrage'
  },
  {
    id: 'aktuelle-prospekte',
    label: 'Aktuelle Prospekte',
    matches: (slug) => slug === 'aktuelle-prospekte'
  },
  {
    id: 'empfohlener-redaktioneller-inhalt',
    label: 'Empfohlener redaktioneller Inhalt',
    matches: (slug) => slug === 'empfohlener-redaktioneller-inhalt'
  },
  {
    id: 'bezirke-newsletter',
    label: 'Bezirke-Newsletter',
    matches: (slug) => slug === 'bezirke-newsletter'
  },
  {
    id: 'opinary',
    label: 'Opinary',
    matches: (slug) => slug === 'opinary'
  },
  {
    id: 'weekender',
    label: 'Weekender',
    matches: (slug) => slug === 'weekender' || slug.startsWith('weekender-')
  },
  {
    id: 'mehr-zu',
    label: 'Mehr zu',
    matches: (slug) => slug === 'mehr-zu' || slug.startsWith('mehr-zu-')
  }
];

const DEFAULT_SETTINGS = {
  hiddenSections: [], // legacy labels
  hiddenSectionIds: [], // canonical IDs
  totalHiddenCount: 0,
  sectionStats: {},
  extensionEnabled: true,
  autoSortComments: true
};

let availableSections = []; // [{ id, label }]
let hiddenSectionIds = [];
let hiddenSections = [];
let totalHiddenCount = 0;
let sectionStats = {};
let extensionEnabled = true;
let autoSortComments = true;
let listenersBound = false;

const sectionsGrid = document.getElementById('sectionsGrid');
const activeSectionsList = document.getElementById('activeSectionsList');
const topSectionsList = document.getElementById('topSectionsList');

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

function canonicalizeSectionId(value) {
  const slug = slugify(value);
  if (!slug) {
    return '';
  }

  for (const definition of SPECIAL_SECTION_DEFINITIONS) {
    if (definition.matches(slug)) {
      return definition.id;
    }
  }

  return slug;
}

function preferredLabelForSectionId(sectionId, fallbackLabel) {
  const definition = SPECIAL_SECTION_DEFINITIONS.find((item) => item.id === sectionId);
  return definition ? definition.label : fallbackLabel;
}

function dedupeSectionIds(ids) {
  return Array.from(new Set((ids || []).map((id) => canonicalizeSectionId(id)).filter(Boolean)));
}

function sectionOptionsFromLabels(labels) {
  const unique = new Map();
  labels.forEach((label, index) => {
    const normalizedLabel = normalizeWhitespace(label);
    const id = canonicalizeSectionId(normalizedLabel);
    if (!id || unique.has(id)) {
      return;
    }
    unique.set(id, { id, label: preferredLabelForSectionId(id, normalizedLabel || id), order: index });
  });
  return Array.from(unique.values());
}

function sortSections(a, b) {
  const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
  const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  return a.label.localeCompare(b.label);
}

function mergeWithFallbackSections(primarySections) {
  const merged = new Map();
  (primarySections || []).forEach((section, index) => {
    if (!section || !section.id) {
      return;
    }
    const order = typeof section.order === 'number' ? section.order : index;
    merged.set(section.id, { ...section, order });
  });

  const fallbackSections = sectionOptionsFromLabels(FALLBACK_SECTIONS);
  const fallbackBaseOrder = (primarySections || []).length + 1000;
  fallbackSections.forEach((section, index) => {
    if (merged.has(section.id)) {
      return;
    }
    merged.set(section.id, {
      ...section,
      order: fallbackBaseOrder + index
    });
  });

  return Array.from(merged.values()).sort(sortSections);
}

function parseDetectedSections(rawDetectedSections) {
  if (!Array.isArray(rawDetectedSections) || rawDetectedSections.length === 0) {
    return mergeWithFallbackSections(sectionOptionsFromLabels(FALLBACK_SECTIONS));
  }

  if (typeof rawDetectedSections[0] === 'string') {
    return mergeWithFallbackSections(sectionOptionsFromLabels(rawDetectedSections));
  }

  const unique = new Map();
  rawDetectedSections.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      return;
    }

    const id = canonicalizeSectionId(entry.id || entry.label);
    const label = normalizeWhitespace(entry.label || entry.id);
    if (!id || !label || unique.has(id)) {
      return;
    }

    const order = typeof entry.order === 'number' ? entry.order : index;
    unique.set(id, { id, label: preferredLabelForSectionId(id, label), order });
  });

  if (unique.size === 0) {
    return mergeWithFallbackSections(sectionOptionsFromLabels(FALLBACK_SECTIONS));
  }

  return mergeWithFallbackSections(Array.from(unique.values()).sort(sortSections));
}

function showLoading() {
  sectionsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">Erkenne Sektionen...</div>';
}

async function loadSettings() {
  try {
    const result = await browser.storage.sync.get(DEFAULT_SETTINGS);
    hiddenSections = Array.isArray(result.hiddenSections) ? result.hiddenSections : [];
    hiddenSectionIds = dedupeSectionIds(result.hiddenSectionIds);
    totalHiddenCount = typeof result.totalHiddenCount === 'number' ? result.totalHiddenCount : 0;
    sectionStats = result.sectionStats || {};
    extensionEnabled = result.extensionEnabled !== false;
    autoSortComments = result.autoSortComments !== false;
  } catch (error) {
    console.error('Error loading settings:', error);
    hiddenSections = [];
    hiddenSectionIds = [];
    totalHiddenCount = 0;
    sectionStats = {};
    extensionEnabled = true;
    autoSortComments = true;
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
    bySlug.set(canonicalizeSectionId(section.id), section.id);
    bySlug.set(canonicalizeSectionId(section.label), section.id);
  });

  const migrated = hiddenSections
    .map((label) => bySlug.get(canonicalizeSectionId(label)))
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
    sectionsGrid.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);">Keine Sektionen erkannt. Besuche erst tagesspiegel.de!</div>';
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

function renderStats() {
  if (topSectionsList) {
    topSectionsList.innerHTML = '';
    
    // Sort ALL stats by count descending
    const sortedStats = Object.entries(sectionStats)
      .map(([id, data]) => ({ id, ...data }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
      
    if (sortedStats.length === 0) {
      topSectionsList.innerHTML = '<div class="empty-stats">Noch keine Daten vorhanden.</div>';
      return;
    }
    
    sortedStats.forEach(item => {
      const row = document.createElement('div');
      row.className = 'stat-item';
      
      const label = document.createElement('span');
      label.className = 'stat-item-label';
      label.textContent = item.label || item.id;
      
      const count = document.createElement('span');
      count.className = 'stat-item-count';
      count.textContent = `${item.count}×`;
      
      row.appendChild(label);
      row.appendChild(count);
      topSectionsList.appendChild(row);
    });
  }
}

function renderActiveSections() {
  if (!activeSectionsList) return;
  
  activeSectionsList.innerHTML = '';
  
  // Find which available sections are currently being hidden
  const activeHidden = availableSections.filter(s => hiddenSectionIds.includes(s.id));
  
  if (activeHidden.length === 0) {
    activeSectionsList.innerHTML = '<div class="empty-stats">Auf dieser Seite wird aktuell nichts ausgeblendet.</div>';
    return;
  }
  
  activeHidden.forEach(section => {
    const row = document.createElement('div');
    row.className = 'stat-item';
    
    const label = document.createElement('span');
    label.className = 'stat-item-label';
    label.textContent = section.label;
    
    row.appendChild(label);
    activeSectionsList.appendChild(row);
  });
}

function updateVersionInfo() {
  const versionEl = document.getElementById('extensionVersion');
  if (versionEl) {
    versionEl.textContent = browser.runtime.getManifest().version;
  }
}

function renderSettings() {
  const extensionEnabledToggle = document.getElementById('extensionEnabled');
  const autoSortCommentsToggle = document.getElementById('autoSortComments');
  
  if (extensionEnabledToggle) {
    extensionEnabledToggle.checked = extensionEnabled;
  }
  
  if (autoSortCommentsToggle) {
    autoSortCommentsToggle.checked = autoSortComments;
  }
}

async function saveSettings() {
  try {
    await browser.storage.sync.set({
      extensionEnabled,
      autoSortComments
    });
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

async function toggleExtension(enabled) {
  extensionEnabled = enabled;
  await saveSettings();
  
  // Notify background script and content script
  try {
    await browser.runtime.sendMessage({
      type: 'EXTENSION_STATUS_CHANGED',
      enabled
    });
  } catch (error) {
    // Background script might not be ready
  }
  
  showStatusMessage(enabled ? 'Extension aktiviert!' : 'Extension deaktiviert!');
}

async function toggleAutoSortComments(enabled) {
  autoSortComments = enabled;
  await saveSettings();
  
  // Notify content scripts about setting change
  try {
    await browser.runtime.sendMessage({
      type: 'AUTO_SORT_COMMENTS_CHANGED',
      enabled
    });
  } catch (error) {
    // Background script might not be ready
  }
  
  showStatusMessage(enabled ? 'Kommentar-Sortierung aktiviert!' : 'Kommentar-Sortierung deaktiviert!');
}

async function saveHiddenSelections() {
  hiddenSectionIds = dedupeSectionIds(hiddenSectionIds);
  const sectionLabels = availableSections
    .filter((section) => hiddenSectionIds.includes(section.id))
    .map((section) => section.label);

  hiddenSections = sectionLabels;

  try {
    const data = {
      hiddenSectionIds,
      hiddenSections
    };
    await browser.storage.sync.set(data);
    // Keep local in sync for faster access if needed, though we primarily use sync now
    await browser.storage.local.set(data).catch(() => {});
  } catch (error) {
    console.error('Error saving hidden sections:', error);
  }
}

async function toggleSection(sectionId, isChecked) {
  if (isChecked) {
    if (!hiddenSectionIds.includes(sectionId)) {
      hiddenSectionIds.push(sectionId);
    }
  } else {
    hiddenSectionIds = hiddenSectionIds.filter((id) => id !== sectionId);
  }

  await saveHiddenSelections();
  renderStats();
  renderActiveSections();
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

  // Checkbox changes
  sectionsGrid.addEventListener('change', async (event) => {
    if (event.target.type !== 'checkbox') {
      return;
    }

    const sectionId = event.target.dataset.sectionId;
    if (!sectionId) {
      return;
    }

    await toggleSection(sectionId, event.target.checked);
    showStatusMessage('Einstellungen gespeichert!');
  });

  // Refresh button
  const refreshButton = document.getElementById('refreshSections');
  if (refreshButton) {
    refreshButton.addEventListener('click', async () => {
      showLoading();
      await loadSections();
      await migrateLegacyHiddenSectionsIfNeeded();
      renderSectionCheckboxes();
      renderStats();
      showStatusMessage('Sektionen aktualisiert!');
    });
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      // Update buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content
      const contents = document.querySelectorAll('.tab-content');
      contents.forEach(c => c.classList.remove('active'));
      document.getElementById(`${tabName}Tab`).classList.add('active');

      if (tabName === 'stats') {
        loadSettings().then(() => renderStats());
      } else if (tabName === 'active') {
        renderActiveSections();
      } else if (tabName === 'settings') {
        loadSettings().then(() => renderSettings());
      }
    });
  });

  // Settings toggles
  const extensionEnabledToggle = document.getElementById('extensionEnabled');
  if (extensionEnabledToggle) {
    extensionEnabledToggle.addEventListener('change', (event) => {
      toggleExtension(event.target.checked);
    });
  }
  
  const autoSortCommentsToggle = document.getElementById('autoSortComments');
  if (autoSortCommentsToggle) {
    autoSortCommentsToggle.addEventListener('change', (event) => {
      toggleAutoSortComments(event.target.checked);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  await loadSettings();
  await loadSections();
  await migrateLegacyHiddenSectionsIfNeeded();
  renderSectionCheckboxes();
  renderActiveSections();
  renderStats();
  updateVersionInfo();
  renderSettings();
  setupEventListeners();
});
