const { chromium } = require('playwright');

const URL = 'https://www.tagesspiegel.de/berlin/mutmassliche-vergewaltigung-im-jugendzentrum-gegen-neukollns-jugendstadtratin-laufen-ermittlungen-wegen-strafvereitelung-im-amt-15402886.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const consentButtons = [
    'Alle akzeptieren',
    'Zustimmen',
    'Akzeptieren',
    'Einverstanden'
  ];

  for (const label of consentButtons) {
    const btn = page.getByRole('button', { name: label });
    if (await btn.count()) {
      await btn.click({ force: true }).catch(() => {});
      break;
    }
  }

  const commentsBtn = page.getByRole('button', { name: /Kommentare/ });
  await commentsBtn.scrollIntoViewIfNeeded();
  await commentsBtn.click({ force: true });

  const iframeLocator = page.locator('iframe[src*="coral.tagesspiegel.de/embed/stream"]');
  await iframeLocator.waitFor({ state: 'attached', timeout: 20000 });
  await page.waitForTimeout(2000);

  const frames = page.frames().map((f) => ({ name: f.name(), url: f.url() }));
  console.log('FRAMES:', JSON.stringify(frames, null, 2));

  const frame = page.frame({ url: /coral\.tagesspiegel\.de\/embed\/stream/ });
  if (!frame) {
    console.log('ERROR: coral frame not found');
    await browser.close();
    return;
  }

  await frame.waitForLoadState('domcontentloaded');
  const sortBtn = frame.getByRole('button', { name: 'Kommentare sortieren' });
  await sortBtn.waitFor({ state: 'visible', timeout: 15000 });
  await sortBtn.click();

  // Give the menu time to render
  await page.waitForTimeout(1000);

  const results = await frame.evaluate(() => {
    const pickText = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim();
    const isVisible = (el) => {
      const style = window.getComputedStyle(el);
      return style && style.visibility !== 'hidden' && style.display !== 'none' && el.offsetParent !== null;
    };

    const candidates = Array.from(document.querySelectorAll('button, [role="menuitem"], [role="option"], [role="menu"] *'));
    const visible = candidates.filter(isVisible);
    const texts = visible.map(pickText).filter(Boolean);

    const keywords = ['respekt', 'belieb', 'neueste', 'älteste', 'sort', 'most', 'liked', 'respected'];
    const matches = visible
      .filter((el) => {
        const t = pickText(el).toLowerCase();
        return keywords.some((k) => t.includes(k));
      })
      .map((el) => ({
        text: pickText(el),
        tag: el.tagName,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid')
      }));

    const keywordHitsAll = Array.from(document.querySelectorAll('*'))
      .filter((el) => {
        const t = pickText(el).toLowerCase();
        return t && keywords.some((k) => t.includes(k));
      })
      .map((el) => ({
        text: pickText(el),
        tag: el.tagName,
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid'),
        visible: isVisible(el)
      }));

    return {
      frameUrl: location.href,
      matches,
      keywordHitsAll,
      uniqueTexts: Array.from(new Set(texts)).slice(0, 200)
    };
  });

  const storage = await frame.evaluate(() => {
    const toObj = (store) => {
      const out = {};
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i);
        out[key] = store.getItem(key);
      }
      return out;
    };
    return {
      localStorage: toObj(localStorage),
      sessionStorage: toObj(sessionStorage)
    };
  });

  console.log(JSON.stringify({ results, storage }, null, 2));
  await browser.close();
})();
