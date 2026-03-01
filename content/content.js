// Tagesspiegel Filter - Content Script
// Section detection is based on verified recurring DOM structure:
// SECTION/ASIDE blocks with short module heading + multiple article links.

(function() {
  'use strict';

  const DEFAULT_SETTINGS = {
    hiddenSections: [], // legacy labels
    hiddenSectionIds: [], // canonical IDs
    totalHiddenCount: 0, // cumulative stat
    sectionStats: {} // { sectionId: { label, count } }
  };

  const STORAGE_KEYS = [
    'hiddenSections',
    'hiddenSectionIds',
    'totalHiddenCount',
    'sectionStats'
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

  const SPECIAL_SECTION_IDS = new Set(SPECIAL_SECTION_DEFINITIONS.map((definition) => definition.id));
  const STAGE_EMBED_SELECTOR = 'section[data-bi-stage-type="stage-embed"], aside[data-bi-stage-type="stage-embed"]';

  let detectedSections = [];
  let currentSettings = { ...DEFAULT_SETTINGS };
  let domObserver = null;
  let mutationRefreshTimer = null;
  let storageListenerBound = false;
  let lastReportedBadgeCount = -1;

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

  function resolveStageEmbedElement(container) {
    if (!container || container.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    if (container.matches && container.matches(STAGE_EMBED_SELECTOR)) {
      return container;
    }

    if (container.tagName === 'DIV' && container.children.length === 1) {
      const onlyChild = container.firstElementChild;
      if (onlyChild && onlyChild.matches && onlyChild.matches(STAGE_EMBED_SELECTOR)) {
        return onlyChild;
      }
    }

    return null;
  }

  function extractStageEmbedLabel(stageEmbedElement) {
    const fullText = normalizeWhitespace(stageEmbedElement && stageEmbedElement.textContent);
    if (!fullText) {
      return '';
    }

    for (const definition of SPECIAL_SECTION_DEFINITIONS) {
      const label = normalizeWhitespace(definition.label);
      if (label && fullText.toLowerCase().includes(label.toLowerCase())) {
        return definition.label;
      }
    }

    const paragraphCandidates = Array.from(stageEmbedElement.querySelectorAll('p'))
      .map((item) => normalizeWhitespace(item.textContent))
      .filter(Boolean);

    const compactLabel = paragraphCandidates.find((text) =>
      text.length >= MODULE_RULES.minHeadingLength &&
      text.length <= MODULE_RULES.maxHeadingLength &&
      !text.includes(':') &&
      !text.includes('?') &&
      !text.includes('!')
    );

    return compactLabel || '';
  }

  function getStageEmbedInfo(container) {
    const stageEmbedElement = resolveStageEmbedElement(container);
    if (!stageEmbedElement) {
      return null;
    }

    if (!isInsideMainContent(stageEmbedElement)) {
      return null;
    }

    const rawLabel = extractStageEmbedLabel(stageEmbedElement);
    const id = canonicalizeSectionId(rawLabel);
    if (!id) {
      return null;
    }

    return {
      id,
      label: preferredLabelForSectionId(id, rawLabel),
      rawLabel,
      element: stageEmbedElement
    };
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

  function isSpecialHeadingContainer(container, heading, headingText, metrics, sectionId) {
    if (!container || !heading || !sectionId) {
      return false;
    }

    if (!SPECIAL_SECTION_IDS.has(sectionId)) {
      return false;
    }

    if (!isInsideMainContent(container)) {
      return false;
    }

    const canonicalHeadingId = canonicalizeSectionId(headingText);
    if (canonicalHeadingId !== sectionId) {
      return false;
    }

    if (metrics.linkCount > 32) {
      return false;
    }

    if (metrics.headingCount > 6) {
      return false;
    }

    const main = container.closest('main#main-content');
    if (!main || main === container) {
      return false;
    }

    return true;
  }

  function addDetectedSection(registry, entry) {
    if (!entry || !entry.id || !entry.element) {
      return;
    }

    if (!registry.has(entry.id)) {
      const aliasValues = [entry.label, ...(Array.isArray(entry.aliases) ? entry.aliases : [])];
      registry.set(entry.id, {
        id: entry.id,
        label: entry.label,
        aliases: new Set(aliasValues),
        elements: [],
        order: entry.order
      });
    }

    const record = registry.get(entry.id);
    const aliasValues = [entry.label, ...(Array.isArray(entry.aliases) ? entry.aliases : [])];
    aliasValues.forEach((alias) => {
      if (alias) {
        record.aliases.add(alias);
      }
    });
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
      const stageEmbedInfo = getStageEmbedInfo(section);
      if (stageEmbedInfo) {
        addDetectedSection(registry, {
          id: stageEmbedInfo.id,
          label: stageEmbedInfo.label,
          aliases: [stageEmbedInfo.rawLabel],
          element: stageEmbedInfo.element,
          kind: 'stage-embed',
          order: getDocumentTop(stageEmbedInfo.element)
        });
        return;
      }

      const headingInfo = getContainerHeading(section);
      if (!headingInfo) {
        return;
      }

      const headingText = headingInfo.text;
      const metrics = collectSectionMetrics(section);
      if (!isModuleContainer(section, headingText, metrics)) {
        return;
      }

      const id = canonicalizeSectionId(headingText);
      if (!id) {
        return;
      }

      const label = preferredLabelForSectionId(id, headingText);
      addDetectedSection(registry, {
        id,
        label,
        aliases: [headingText],
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

        const id = canonicalizeSectionId(headingText);
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

        const label = preferredLabelForSectionId(id, headingText);
        addDetectedSection(registry, {
          id,
          label,
          aliases: [headingText],
          element: container,
          kind: 'label-card',
          order: getDocumentTop(container)
        });
      });
    }

    if (mainRoot) {
      const headingCandidates = mainRoot.querySelectorAll('h2, h3, h4');
      headingCandidates.forEach((heading) => {
        const headingText = normalizeWhitespace(heading.textContent);
        const id = canonicalizeSectionId(headingText);

        if (!id || !SPECIAL_SECTION_IDS.has(id) || registry.has(id)) {
          return;
        }

        const container = heading.closest('section, aside, div');
        if (!container) {
          return;
        }

        const metrics = collectSectionMetrics(container);
        if (!isSpecialHeadingContainer(container, heading, headingText, metrics, id)) {
          return;
        }

        const label = preferredLabelForSectionId(id, headingText);
        addDetectedSection(registry, {
          id,
          label,
          aliases: [headingText],
          element: container,
          kind: 'special-heading',
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

    console.log('[Tagesspiegel Filter] Detected section modules:', sections.map((s) => `${s.label} (${s.id})`));
    return sections;
  }

  function resolveHiddenSectionIds(settings) {
    const ids = new Set();
    const idToSection = new Map(detectedSections.map((section) => [canonicalizeSectionId(section.id), section]));
    const labelIndex = new Map();

    detectedSections.forEach((section) => {
      const sectionId = canonicalizeSectionId(section.id);
      const keys = [sectionId, section.label, ...(section.aliases || [])];
      keys.forEach((key) => {
        const normalized = canonicalizeSectionId(key);
        if (normalized && !labelIndex.has(normalized)) {
          labelIndex.set(normalized, sectionId);
        }
      });
    });

    const addIdValue = (value) => {
      const normalized = canonicalizeSectionId(value);
      if (!normalized) {
        return;
      }
      ids.add(normalized);
    };

    const addLabelValue = (value) => {
      const normalized = canonicalizeSectionId(value);
      if (!normalized) {
        return;
      }
      if (idToSection.has(normalized)) {
        ids.add(normalized);
        return;
      }
      if (labelIndex.has(normalized)) {
        ids.add(labelIndex.get(normalized));
        return;
      }
      ids.add(normalized);
    };

    (Array.isArray(settings.hiddenSectionIds) ? settings.hiddenSectionIds : []).forEach(addIdValue);
    (Array.isArray(settings.hiddenSections) ? settings.hiddenSections : []).forEach(addLabelValue);

    return Array.from(ids);
  }

  function hideElement(element, sectionId, kind) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    // Check if already hidden by us
    if (element.hasAttribute('data-hidden-by-customizer')) {
      return false;
    }

    if (kind === 'stage-embed') {
      const stageEmbedInfo = getStageEmbedInfo(element);
      if (!stageEmbedInfo) {
        return false;
      }
      if (canonicalizeSectionId(stageEmbedInfo.id) !== canonicalizeSectionId(sectionId)) {
        return false;
      }
    } else {
      const headingInfo = getContainerHeading(element);
      if (!headingInfo) {
        return false;
      }

      const metrics = collectSectionMetrics(element);
      if (kind === 'label-card') {
        if (!isLabelCardContainer(element, headingInfo.heading, headingInfo.text, metrics)) {
          return false;
        }
      } else if (kind === 'special-heading') {
        if (!isSpecialHeadingContainer(element, headingInfo.heading, headingInfo.text, metrics, sectionId)) {
          return false;
        }
      } else {
        if (!isModuleContainer(element, headingInfo.text, metrics)) {
          return false;
        }
      }
    }

    element.style.setProperty('display', 'none', 'important');
    element.setAttribute('data-hidden-by-customizer', sectionId);
    
    // Increment total hidden count for stats (only if not already counted on this page load)
    if (!element.hasAttribute('data-stat-counted')) {
      element.setAttribute('data-stat-counted', 'true');
      incrementTotalHiddenStat(sectionId);
    }
    
    return true;
  }

  function fallbackElementsForSectionId(sectionId) {
    const matches = [];
    const canonicalId = canonicalizeSectionId(sectionId);
    if (!canonicalId) {
      return matches;
    }

    const candidates = document.querySelectorAll('section, aside, div');
    candidates.forEach((candidate) => {
      const stageEmbedInfo = getStageEmbedInfo(candidate);
      if (stageEmbedInfo && stageEmbedInfo.id === canonicalId) {
        matches.push({ node: stageEmbedInfo.element, kind: 'stage-embed' });
        return;
      }

      const headingInfo = getContainerHeading(candidate);
      if (!headingInfo) {
        return;
      }
      if (canonicalizeSectionId(headingInfo.text) !== canonicalId) {
        return;
      }

      const metrics = collectSectionMetrics(candidate);
      if (isModuleContainer(candidate, headingInfo.text, metrics)) {
        matches.push({ node: candidate, kind: 'module' });
        return;
      }
      if (isLabelCardContainer(candidate, headingInfo.heading, headingInfo.text, metrics)) {
        matches.push({ node: candidate, kind: 'label-card' });
        return;
      }
      if (isSpecialHeadingContainer(candidate, headingInfo.heading, headingInfo.text, metrics, canonicalId)) {
        matches.push({ node: candidate, kind: 'special-heading' });
      }
    });
    return matches;
  }

  function hideSections(hiddenIds) {
    if (!Array.isArray(hiddenIds) || hiddenIds.length === 0) {
      updateBadge(0);
      return;
    }

    const byId = new Map(detectedSections.map((section) => [canonicalizeSectionId(section.id), section]));
    console.log('[Tagesspiegel Filter] Hiding section IDs:', hiddenIds);

    hiddenIds.forEach((rawSectionId) => {
      const sectionId = canonicalizeSectionId(rawSectionId);
      if (!sectionId) {
        return;
      }
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
      fallbackElementsForSectionId(sectionId).forEach((entry) => {
        if (hideElement(entry.node, sectionId, entry.kind)) {
          hiddenCount += 1;
        }
      });

      console.log(`[Tagesspiegel Filter] Hidden "${sectionId}" elements: ${hiddenCount}`);
    });

    // Count all elements currently hidden on the page
    const currentlyHidden = document.querySelectorAll('[data-hidden-by-customizer]').length;
    updateBadge(currentlyHidden);
  }

  function updateBadge(count) {
    if (count === lastReportedBadgeCount) return;
    lastReportedBadgeCount = count;
    browser.runtime.sendMessage({
      type: 'UPDATE_BADGE',
      count: count
    }).catch(() => {
      // Background script might not be ready or extension reloaded
    });
  }

  async function incrementTotalHiddenStat(sectionId) {
    try {
      const data = await browser.storage.sync.get({ 
        totalHiddenCount: 0,
        sectionStats: {}
      });
      
      const stats = data.sectionStats || {};
      if (!stats[sectionId]) {
        stats[sectionId] = {
          count: 0,
          label: preferredLabelForSectionId(sectionId, sectionId)
        };
      }
      stats[sectionId].count += 1;

      await browser.storage.sync.set({ 
        totalHiddenCount: (data.totalHiddenCount || 0) + 1,
        sectionStats: stats
      });
    } catch (error) {
      console.error('[Tagesspiegel Filter] Error incrementing stat:', error);
    }
  }

  async function loadSettings() {
    try {
      const stored = await browser.storage.sync.get(DEFAULT_SETTINGS);
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (error) {
      console.error('[Tagesspiegel Filter] Error loading settings:', error);
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
      console.error('[Tagesspiegel Filter] Error syncing sections:', error);
    }
  }

  async function persistHiddenSectionIds(hiddenIds) {
    const normalized = Array.from(new Set((hiddenIds || []).map((id) => canonicalizeSectionId(id)).filter(Boolean))).sort();
    const previous = Array.isArray(currentSettings.hiddenSectionIds)
      ? Array.from(new Set(currentSettings.hiddenSectionIds.map((id) => canonicalizeSectionId(id)).filter(Boolean))).sort()
      : [];

    if (normalized.join('|') === previous.join('|')) {
      return;
    }

    currentSettings.hiddenSectionIds = normalized;
    try {
      await browser.storage.sync.set({ hiddenSectionIds: normalized });
    } catch (error) {
      console.error('[Tagesspiegel Filter] Error persisting hiddenSectionIds:', error);
    }
  }

  async function refreshDetectionAndApply(reason) {
    detectedSections = detectSections();
    await syncSectionsToPopup();

    const hiddenIds = resolveHiddenSectionIds(currentSettings);
    hideSections(hiddenIds);
    await persistHiddenSectionIds(hiddenIds);

    console.log('[Tagesspiegel Filter] Refresh completed:', reason);
  }

  function scheduleMutationRefresh() {
    clearTimeout(mutationRefreshTimer);
    mutationRefreshTimer = setTimeout(() => {
      refreshDetectionAndApply('mutation').catch((error) => {
        console.error('[Tagesspiegel Filter] Mutation refresh failed:', error);
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
      if (areaName !== 'sync') {
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

      if (Object.prototype.hasOwnProperty.call(changes, 'hiddenSectionIds') ||
          Object.prototype.hasOwnProperty.call(changes, 'hiddenSections')) {
        const hiddenIds = resolveHiddenSectionIds(currentSettings);
        hideSections(hiddenIds);
      }
    });
  }

  async function init() {
    currentSettings = await loadSettings();

    await refreshDetectionAndApply('init');
    setupMutationObserver();
    setupStorageListener();
  }

  window.getTagesspiegelSections = () => detectedSections.map((section) => section.label);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init().catch((error) => {
        console.error('[Tagesspiegel Filter] Initialization failed:', error);
      });
    });
  } else {
    init().catch((error) => {
      console.error('[Tagesspiegel Filter] Initialization failed:', error);
    });
  }
})();
