// Tagesspiegel Customizer - Content Script
// Section detection is based on verified recurring DOM structure:
// SECTION/ASIDE blocks with short module heading + multiple article links.

(function() {
  'use strict';

  const DEFAULT_SETTINGS = {
    fontSizeBody: 10,
    fontSizeHeadlines: 12,
    fontEnabled: true,
    hiddenSections: [], // legacy labels
    hiddenSectionIds: [] // canonical IDs
  };

  const STORAGE_KEYS = [
    'fontSizeBody',
    'fontSizeHeadlines',
    'fontEnabled',
    'hiddenSections',
    'hiddenSectionIds'
  ];

  const MODULE_RULES = {
    minLinks: 3,
    maxLinks: 24,
    minArticleLikeLinks: 2,
    minHeadingLength: 3,
    maxHeadingLength: 64,
    maxHeadingWords: 8
  };

  const LABEL_CARD_RULES = {
    minLinks: 1,
    maxLinks: 8,
    maxArticleLikeLinks: 3,
    maxHeadingCount: 3
  };

  let detectedSections = [];
  let currentSettings = { ...DEFAULT_SETTINGS };
  let domObserver = null;
  let mutationRefreshTimer = null;
  let storageListenerBound = false;

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

  function getDocumentTop(element) {
    if (!element || !element.getBoundingClientRect) {
      return Number.MAX_SAFE_INTEGER;
    }
    const rect = element.getBoundingClientRect();
    return Math.round(rect.top + window.scrollY);
  }

  function getContainerHeading(container) {
    const selectors = [
      ':scope > h2',
      ':scope > h3',
      ':scope > h4',
      ':scope > a > h2',
      ':scope > a > h3',
      ':scope > a > h4',
      ':scope > header h2',
      ':scope > header h3',
      ':scope > header h4',
      ':scope > div h2',
      ':scope > div h3',
      ':scope > div h4'
    ];

    for (const selector of selectors) {
      try {
        const heading = container.querySelector(selector);
        if (!heading) {
          continue;
        }
        const text = normalizeWhitespace(heading.textContent);
        if (text) {
          return { heading, text };
        }
      } catch (error) {
        // Keep trying compatible selectors.
      }
    }

    return null;
  }

  function isModuleHeadingText(text) {
    if (!text) {
      return false;
    }

    if (text.length < MODULE_RULES.minHeadingLength || text.length > MODULE_RULES.maxHeadingLength) {
      return false;
    }

    const words = text.split(' ').filter(Boolean);
    if (words.length > MODULE_RULES.maxHeadingWords) {
      return false;
    }

    // Article headlines usually contain sentence punctuation / long constructions.
    if (text.includes(':') || text.includes('?') || text.includes('!') || text.includes('„') || text.includes('"')) {
      return false;
    }

    // Ensure heading looks like a label and not random symbol text.
    if (!/[a-zA-ZäöüÄÖÜß]/.test(text)) {
      return false;
    }

    return true;
  }

  function collectSectionMetrics(section) {
    const links = Array.from(section.querySelectorAll('a[href]'));
    const linkTexts = links.map((link) => normalizeWhitespace(link.textContent)).filter(Boolean);
    const articleLikeLinkCount = linkTexts.filter((text) => text.length >= 35).length;
    const colonLinkCount = linkTexts.filter((text) => text.includes(':')).length;
    const nestedSectionCount = section.querySelectorAll(':scope section, :scope aside').length;
    const headingCount = section.querySelectorAll('h2, h3, h4').length;

    return {
      linkCount: links.length,
      articleLikeLinkCount,
      colonLinkCount,
      nestedSectionCount,
      headingCount
    };
  }

  function isModuleContainer(section, headingText, metrics) {
    if (!section || (section.tagName !== 'SECTION' && section.tagName !== 'ASIDE')) {
      return false;
    }

    if (!isModuleHeadingText(headingText)) {
      return false;
    }

    if (metrics.linkCount < MODULE_RULES.minLinks || metrics.linkCount > MODULE_RULES.maxLinks) {
      return false;
    }

    // Standard news modules have several long article links.
    const isStandardNewsModule = metrics.articleLikeLinkCount >= MODULE_RULES.minArticleLikeLinks;
    // Verified special-case module: games/puzzles cards (short titles, colon-formatted links).
    const isCompactUtilityModule =
      metrics.linkCount <= 4 &&
      metrics.colonLinkCount >= 2 &&
      metrics.headingCount >= 3;

    if (!isStandardNewsModule && !isCompactUtilityModule) {
      return false;
    }

    if (metrics.nestedSectionCount > 2) {
      return false;
    }

    return true;
  }

  function isInsideMainContent(element) {
    return !!(element && element.closest && element.closest('main#main-content'));
  }

  function isLabelCardContainer(container, heading, headingText, metrics) {
    if (!container || !heading) {
      return false;
    }

    if (!isInsideMainContent(container)) {
      return false;
    }

    if (isModuleContainer(container, headingText, metrics)) {
      return false;
    }

    const anchor = heading.closest('a[href]');
    if (!anchor || !container.contains(anchor)) {
      return false;
    }

    const anchorText = normalizeWhitespace(anchor.textContent);
    if (!anchorText || !anchorText.includes(headingText)) {
      return false;
    }

    if (metrics.linkCount < LABEL_CARD_RULES.minLinks || metrics.linkCount > LABEL_CARD_RULES.maxLinks) {
      return false;
    }

    if (metrics.articleLikeLinkCount > LABEL_CARD_RULES.maxArticleLikeLinks) {
      return false;
    }

    const headingCount = container.querySelectorAll('h2, h3, h4').length;
    if (headingCount > LABEL_CARD_RULES.maxHeadingCount) {
      return false;
    }

    return true;
  }

  function addDetectedSection(registry, entry) {
    if (!entry || !entry.id || !entry.element) {
      return;
    }

    if (!registry.has(entry.id)) {
      registry.set(entry.id, {
        id: entry.id,
        label: entry.label,
        aliases: new Set([entry.label]),
        elements: [],
        order: entry.order
      });
    }

    const record = registry.get(entry.id);
    record.aliases.add(entry.label);
    if (typeof entry.order === 'number') {
      record.order = typeof record.order === 'number' ? Math.min(record.order, entry.order) : entry.order;
    }

    if (!record.elements.some((item) => item && item.node === entry.element)) {
      record.elements.push({
        node: entry.element,
        kind: entry.kind || 'module'
      });
    }
  }

  function detectSections() {
    const registry = new Map();
    const candidates = document.querySelectorAll('section, aside');

    candidates.forEach((section) => {
      const headingInfo = getContainerHeading(section);
      if (!headingInfo) {
        return;
      }

      const headingText = headingInfo.text;
      const metrics = collectSectionMetrics(section);
      if (!isModuleContainer(section, headingText, metrics)) {
        return;
      }

      const id = slugify(headingText);
      if (!id) {
        return;
      }

      addDetectedSection(registry, {
        id,
        label: headingText,
        element: section,
        kind: 'module',
        order: getDocumentTop(section)
      });
    });

    // Secondary pattern from live DOM scan:
    // compact heading-link cards like "Politische Karikaturen".
    const mainRoot = document.querySelector('main#main-content');
    if (mainRoot) {
      const headingCandidates = mainRoot.querySelectorAll('h2, h3, h4');
      headingCandidates.forEach((heading) => {
        const headingText = normalizeWhitespace(heading.textContent);
        if (!isModuleHeadingText(headingText)) {
          return;
        }

        const id = slugify(headingText);
        if (!id || registry.has(id)) {
          return;
        }

        const container = heading.closest('div, section, aside');
        if (!container) {
          return;
        }

        const metrics = collectSectionMetrics(container);
        if (!isLabelCardContainer(container, heading, headingText, metrics)) {
          return;
        }

        addDetectedSection(registry, {
          id,
          label: headingText,
          element: container,
          kind: 'label-card',
          order: getDocumentTop(container)
        });
      });
    }

    const sections = Array.from(registry.values())
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        aliases: Array.from(entry.aliases),
        elements: entry.elements,
        order: entry.order
      }))
      .sort((a, b) => {
        const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER;
        const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.label.localeCompare(b.label);
      });

    console.log('[Tagesspiegel Customizer] Detected section modules:', sections.map((s) => `${s.label} (${s.id})`));
    return sections;
  }

  function resolveHiddenSectionIds(settings) {
    const ids = new Set();
    const idToSection = new Map(detectedSections.map((section) => [section.id, section]));
    const labelIndex = new Map();

    detectedSections.forEach((section) => {
      const keys = [section.id, section.label, ...(section.aliases || [])];
      keys.forEach((key) => {
        const normalized = slugify(key);
        if (normalized && !labelIndex.has(normalized)) {
          labelIndex.set(normalized, section.id);
        }
      });
    });

    const addValue = (value) => {
      const normalized = slugify(value);
      if (!normalized) {
        return;
      }
      if (idToSection.has(normalized)) {
        ids.add(normalized);
        return;
      }
      if (labelIndex.has(normalized)) {
        ids.add(labelIndex.get(normalized));
      }
    };

    (Array.isArray(settings.hiddenSectionIds) ? settings.hiddenSectionIds : []).forEach(addValue);
    (Array.isArray(settings.hiddenSections) ? settings.hiddenSections : []).forEach(addValue);

    return Array.from(ids);
  }

  function hideElement(element, sectionId, kind) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const headingInfo = getContainerHeading(element);
    if (!headingInfo) {
      return false;
    }

    const metrics = collectSectionMetrics(element);
    if (kind === 'label-card') {
      if (!isLabelCardContainer(element, headingInfo.heading, headingInfo.text, metrics)) {
        return false;
      }
    } else {
      if (!isModuleContainer(element, headingInfo.text, metrics)) {
        return false;
      }
    }

    element.style.setProperty('display', 'none', 'important');
    element.setAttribute('data-hidden-by-customizer', sectionId);
    return true;
  }

  function fallbackElementsForSectionId(sectionId) {
    const matches = [];
    const candidates = document.querySelectorAll('section, aside, div');
    candidates.forEach((candidate) => {
      const headingInfo = getContainerHeading(candidate);
      if (!headingInfo) {
        return;
      }
      if (slugify(headingInfo.text) !== sectionId) {
        return;
      }

      const metrics = collectSectionMetrics(candidate);
      if (isModuleContainer(candidate, headingInfo.text, metrics)) {
        matches.push({ node: candidate, kind: 'module' });
        return;
      }
      if (isLabelCardContainer(candidate, headingInfo.heading, headingInfo.text, metrics)) {
        matches.push({ node: candidate, kind: 'label-card' });
      }
    });
    return matches;
  }

  function hideSections(hiddenIds) {
    if (!Array.isArray(hiddenIds) || hiddenIds.length === 0) {
      return;
    }

    const byId = new Map(detectedSections.map((section) => [section.id, section]));
    console.log('[Tagesspiegel Customizer] Hiding section IDs:', hiddenIds);

    hiddenIds.forEach((sectionId) => {
      let hiddenCount = 0;
      const section = byId.get(sectionId);

      if (section) {
        section.elements.forEach((entry) => {
          if (hideElement(entry.node, sectionId, entry.kind)) {
            hiddenCount += 1;
          }
        });
      }

      // Fallback: if dynamic refresh replaced nodes, re-scan section containers by heading id.
      if (hiddenCount === 0) {
        fallbackElementsForSectionId(sectionId).forEach((entry) => {
          if (hideElement(entry.node, sectionId, entry.kind)) {
            hiddenCount += 1;
          }
        });
      }

      console.log(`[Tagesspiegel Customizer] Hidden "${sectionId}" elements: ${hiddenCount}`);
    });
  }

  function applyFontSizes(settings) {
    const bodySize = settings.fontSizeBody || DEFAULT_SETTINGS.fontSizeBody;
    const headlinesSize = settings.fontSizeHeadlines || DEFAULT_SETTINGS.fontSizeHeadlines;

    let styleElement = document.getElementById('tagesspiegel-customizer-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'tagesspiegel-customizer-styles';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      body, p, article, .c-paragraph, .article-body, .content-body,
      div[class*='text'], span[class*='text'] {
        font-size: ${bodySize}px !important;
      }
      h1, h2, h3, .c-headline, .headline, .title,
      [class*='headline'], [class*='title'] {
        font-size: ${headlinesSize}px !important;
      }
    `;
  }

  function removeFontSizes() {
    const styleElement = document.getElementById('tagesspiegel-customizer-styles');
    if (styleElement) {
      styleElement.textContent = '';
    }
  }

  async function loadSettings() {
    try {
      const stored = await browser.storage.local.get(DEFAULT_SETTINGS);
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (error) {
      console.error('[Tagesspiegel Customizer] Error loading settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  async function syncSectionsToPopup() {
    const serializable = detectedSections.map((section) => ({
      id: section.id,
      label: section.label,
      aliases: section.aliases,
      order: section.order
    }));

    try {
      await browser.storage.local.set({ detectedSections: serializable });
    } catch (error) {
      console.error('[Tagesspiegel Customizer] Error syncing sections:', error);
    }
  }

  async function persistHiddenSectionIds(hiddenIds) {
    const normalized = Array.from(new Set((hiddenIds || []).map((id) => slugify(id)).filter(Boolean)));
    const previous = Array.isArray(currentSettings.hiddenSectionIds)
      ? currentSettings.hiddenSectionIds.map((id) => slugify(id))
      : [];

    if (normalized.join('|') === previous.join('|')) {
      return;
    }

    currentSettings.hiddenSectionIds = normalized;
    try {
      await browser.storage.local.set({ hiddenSectionIds: normalized });
    } catch (error) {
      console.error('[Tagesspiegel Customizer] Error persisting hiddenSectionIds:', error);
    }
  }

  async function refreshDetectionAndApply(reason) {
    detectedSections = detectSections();
    await syncSectionsToPopup();

    const hiddenIds = resolveHiddenSectionIds(currentSettings);
    hideSections(hiddenIds);
    await persistHiddenSectionIds(hiddenIds);

    if (currentSettings.fontEnabled !== false) {
      applyFontSizes(currentSettings);
    }

    console.log('[Tagesspiegel Customizer] Refresh completed:', reason);
  }

  function scheduleMutationRefresh() {
    clearTimeout(mutationRefreshTimer);
    mutationRefreshTimer = setTimeout(() => {
      refreshDetectionAndApply('mutation').catch((error) => {
        console.error('[Tagesspiegel Customizer] Mutation refresh failed:', error);
      });
    }, 300);
  }

  function setupMutationObserver() {
    if (domObserver || !document.body) {
      return;
    }

    domObserver = new MutationObserver((mutations) => {
      let hasElementAdditions = false;
      for (const mutation of mutations) {
        if (!mutation.addedNodes || mutation.addedNodes.length === 0) {
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            hasElementAdditions = true;
            break;
          }
        }
        if (hasElementAdditions) {
          break;
        }
      }

      if (hasElementAdditions) {
        scheduleMutationRefresh();
      }
    });

    domObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function setupStorageListener() {
    if (storageListenerBound) {
      return;
    }
    storageListenerBound = true;

    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') {
        return;
      }

      const changedKeys = Object.keys(changes);
      if (changedKeys.length === 1 && changedKeys[0] === 'detectedSections') {
        return;
      }

      STORAGE_KEYS.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(changes, key)) {
          currentSettings[key] = changes[key].newValue;
        }
      });

      if (Object.prototype.hasOwnProperty.call(changes, 'fontEnabled') ||
          Object.prototype.hasOwnProperty.call(changes, 'fontSizeBody') ||
          Object.prototype.hasOwnProperty.call(changes, 'fontSizeHeadlines')) {
        if (currentSettings.fontEnabled !== false) {
          applyFontSizes(currentSettings);
        } else {
          removeFontSizes();
        }
      }

      if (Object.prototype.hasOwnProperty.call(changes, 'hiddenSectionIds') ||
          Object.prototype.hasOwnProperty.call(changes, 'hiddenSections')) {
        const hiddenIds = resolveHiddenSectionIds(currentSettings);
        hideSections(hiddenIds);
      }
    });
  }

  async function init() {
    currentSettings = await loadSettings();

    if (currentSettings.fontEnabled !== false) {
      applyFontSizes(currentSettings);
    } else {
      removeFontSizes();
    }

    await refreshDetectionAndApply('init');
    setupMutationObserver();
    setupStorageListener();
  }

  window.getTagesspiegelSections = () => detectedSections.map((section) => section.label);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init().catch((error) => {
        console.error('[Tagesspiegel Customizer] Initialization failed:', error);
      });
    });
  } else {
    init().catch((error) => {
      console.error('[Tagesspiegel Customizer] Initialization failed:', error);
    });
  }
})();
