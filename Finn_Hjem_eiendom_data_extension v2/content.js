// --- Utility functions ---
const cleanNumber = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/\s|kr|m²|per år|år|\(.*?\)|soverom|rom|\.|\//gi, '') // Remove common text, periods, and slashes
    .replace(/\.$/, '') // Remove trailing period
    .trim() || '';
};
const getText = (selector) => document.querySelector(selector)?.innerText.trim() || '';
const getTextByDt = (label) => {
  const dtElements = [...document.querySelectorAll('dt')];
  for (const dt of dtElements) {
    if (dt.textContent.trim().toLowerCase() === label.toLowerCase()) {
      return dt.nextElementSibling?.innerText.trim() || '';
    }
  }
  return '';
};
const parseNorwegianDate = (text) => {
  const months = {
    januar: '01', februar: '02', mars: '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', desember: '12'
  };
  const match = text.match(/(\d{1,2})\.?\s*(\w+)/i);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = months[match[2].toLowerCase()];
  const year = new Date().getFullYear();
  return `${day}.${month}.${year}`;
};
const parseNorwegianDateTime = (text) => {
  const months = {
    januar: '01', februar: '02', mars: '03', april: '04', mai: '05', juni: '06',
    juli: '07', august: '08', september: '09', oktober: '10', november: '11', desember: '12'
  };
  const match = text.match(/(\d{1,2})\.?\s*(\w+)/i);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = months[match[2].toLowerCase()];
  const year = new Date().getFullYear();
  const date = `${day}.${month}.${year}`;
  // Try to extract time (e.g. "17:30 - 18:30" or "17:30 – 18:30")
  const timeMatch = text.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (timeMatch) {
    return `${date} ${timeMatch[1]}-${timeMatch[2]}`;
  }
  return date;
};
const getTextByLabel = (label) => {
  const elements = [...document.querySelectorAll('dt, th')];
  for (const el of elements) {
    if (el.textContent.trim().toLowerCase() === label.toLowerCase()) {
      return el.nextElementSibling?.innerText.trim() || '';
    }
  }
  return '';
};
const makeTimestamp = () => {
  const now = new Date();
  return `${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
};

// --- Hjem.no specific data extraction ---
const extractHjemData = () => {
  return new Promise((resolve) => {
    // Wait a bit for React app to load
    setTimeout(() => {
      const getHjemTextByLabel = (label) => {
        const elements = [...document.querySelectorAll('.text-br3')];
        let lastMatch = null;
        for (const el of elements) {
          if (el.textContent.trim().toLowerCase() === label.toLowerCase()) {
            const nextSibling = el.nextElementSibling;
            if (nextSibling && (nextSibling.classList.contains('text-bs2') || nextSibling.classList.contains('text-bs0'))) {
              lastMatch = nextSibling.innerText.trim() || '';
            }
          }
        }
        return lastMatch || '';
      };

      console.log('[ExtractorExt] Starting Hjem.no data extraction...');

      const fields = [
        window.location.href,
        document.querySelector('meta[property="og:title"]')?.content || '',
        document.querySelector('meta[property="og:url"]')?.content || '',
        cleanNumber(getHjemTextByLabel('Prisantydning')) || '',
        cleanNumber(getHjemTextByLabel('Totalpris')) || '',
        cleanNumber(getHjemTextByLabel('Omkostninger')) || '',
        cleanNumber(getHjemTextByLabel('Fellesgjeld')) || '',
        cleanNumber(getHjemTextByLabel('Månedlig felleskost')) || '',
        cleanNumber(getHjemTextByLabel('Kommunale avgifter')) || '',
        cleanNumber(getHjemTextByLabel('Eiendomsskatt')) || '',
        getHjemTextByLabel('Boligtype') || '',
        getHjemTextByLabel('Eieform') || '',
        cleanNumber(getHjemTextByLabel('Soverom')) || '',
        cleanNumber(getHjemTextByLabel('Areal')) || '',
        cleanNumber(getHjemTextByLabel('Bruksareal')) || '',
        cleanNumber(getHjemTextByLabel('Internt bruksareal')) || '',
        cleanNumber(getHjemTextByLabel('Eksternt bruksareal')) || '',
        cleanNumber(getHjemTextByLabel('Etasje')) || '',
        getHjemTextByLabel('Byggeår') || '',
        getHjemTextByLabel('Energimerking') || '',
        cleanNumber(getHjemTextByLabel('Rom')) || '',
        cleanNumber(getHjemTextByLabel('Tomteareal')) || '',
        getHjemTextByLabel('Fellesgjeld') || ''
      ];

      // Last 3 date fields: Visning, Sist endret, Timestamp
      const viewingText = getText('[data-testid*="viewing"], [data-testid*="visning"]');
      fields.push(viewingText ? parseNorwegianDateTime(viewingText) : '');
      fields.push(getHjemTextByLabel('Sist endret') || '');
      fields.push(makeTimestamp());

      // Count non-empty fields (skip URL and timestamp which are always filled)
      const dataFields = fields.slice(1, -1);
      const filledCount = dataFields.filter(f => f !== '').length;
      const totalCount = dataFields.length;

      console.log(`[ExtractorExt] Hjem.no extraction complete: ${filledCount}/${totalCount} fields`);
      resolve({ fields, filledCount, totalCount, title: fields[1] || fields[2] || 'Ukjent' });
    }, 2000);
  });
};

// --- Finn.no specific data extraction (fresh on every click) ---
const extractFinnData = () => {
  const fields = [
    window.location.href,
    getText('[data-testid="object-title"] h1'),
    getText('[data-testid="object-address"]'),
    cleanNumber(getText('[data-testid="pricing-incicative-price"] dd') || getText('[data-testid="pricing-incicative-price"] span[class*="font-bold"]')),
    cleanNumber(getText('[data-testid="pricing-total-price"] dd')),
    cleanNumber(getText('[data-testid="pricing-registration-charge"] dd')),
    cleanNumber(getText('[data-testid="pricing-joint-debt"] dd')),
    cleanNumber(getText('[data-testid="pricing-common-monthly-cost"] dd')),
    cleanNumber(getText('[data-testid="pricing-municipal-fees"] dd')),
    cleanNumber(getTextByDt('Eiendomsskatt')),
    getText('[data-testid="info-property-type"] dd'),
    getText('[data-testid="info-ownership-type"] dd'),
    cleanNumber(getText('[data-testid="info-bedrooms"] dd')),
    cleanNumber(getText('[data-testid="info-usable-i-area"] dd')),
    cleanNumber(getText('[data-testid="info-usable-area"] dd')),
    cleanNumber(getText('[data-testid="info-usable-e-area"] dd')),
    getText('[data-testid="info-floor"] dd'),
    getText('[data-testid="info-construction-year"] dd'),
    getText('[data-testid="energy-label-info"]'),
    cleanNumber(getText('[data-testid="info-rooms"] dd')),
    cleanNumber(getText('[data-testid="info-plot-area"] dd')),
    getText('[data-testid="common-cost"]') || getText('[data-testid="common-cost"] + div')
  ];

  // Last 3 date fields: Visning (with time), Sist endret, Timestamp
  const viewingEl = document.querySelector('[data-testid^="viewings-"]');
  const viewingDateText = viewingEl?.querySelector('.capitalize-first')?.innerText?.trim() || '';
  const viewingTimeText = viewingEl?.innerText || '';
  if (viewingDateText) {
    fields.push(parseNorwegianDateTime(viewingDateText + ' ' + viewingTimeText));
  } else {
    fields.push('');
  }
  fields.push(getTextByLabel('Sist endret'));
  fields.push(makeTimestamp());

  // Count non-empty fields (skip URL and timestamp)
  const dataFields = fields.slice(1, -1);
  const filledCount = dataFields.filter(f => f !== '').length;
  const totalCount = dataFields.length;

  console.log(`[ExtractorExt] Finn.no extraction complete: ${filledCount}/${totalCount} fields`);
  return { fields, filledCount, totalCount, title: fields[2] || fields[1] || 'Ukjent' };
};


// --- Main ---
console.log('[ExtractorExt] Checking URL:', window.location.href);
const isFinn = window.location.hostname.includes('finn.no');
const isHjem = window.location.hostname.includes('hjem.no');

if (!isFinn && !isHjem) {
  console.warn('[ExtractorExt] Not a supported site');
} else {
  const siteName = isFinn ? 'Finn.no' : 'Hjem.no';
  console.log(`[ExtractorExt] ${siteName} detected`);

  const EXTENSION_HOST_ID = 'finn-hjem-data-extractor-host';
  let lastCopiedUrl = null; // Track last copied URL for duplicate detection

  // --- Clipboard fallback for when document is not focused ---
  function fallbackCopyToClipboard(text, toastEl, toastMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const success = document.execCommand('copy');
      if (success) {
        console.log('[ExtractorExt] Fallback copy succeeded');
        showToast(toastEl, toastMsg);
      } else {
        console.error('[ExtractorExt] Fallback copy also failed');
        showToast(toastEl, '\u274c Kopieringsfeil', '#c0392b');
      }
    } catch (err) {
      console.error('[ExtractorExt] execCommand error:', err);
    } finally {
      textarea.remove();
    }
  }

  // --- Toast helper ---
  function showToast(toastEl, msg, bg = '#333', duration = 2500) {
    toastEl.textContent = msg;
    toastEl.style.background = bg;
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, duration);
  }

  // --- Copy handler with fallback ---
  function copyToClipboard(text, toastEl, toastMsg) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('[ExtractorExt] Copied data to clipboard');
        showToast(toastEl, toastMsg);
      })
      .catch(err => {
        console.warn('[ExtractorExt] Clipboard API failed, trying fallback:', err.message);
        fallbackCopyToClipboard(text, toastEl, toastMsg);
      });
  }

  // --- Build toast message with address and field count ---
  function buildToastMsg(title, filledCount, totalCount, isDuplicate) {
    const short = title.length > 35 ? title.substring(0, 35) + '...' : title;
    const dup = isDuplicate ? ' (duplikat)' : '';
    return `\u2705 ${short} (${filledCount}/${totalCount})${dup}`;
  }

  // --- Create the extension UI inside a Shadow DOM ---
  function createExtensionHost() {
    const existing = document.getElementById(EXTENSION_HOST_ID);
    if (existing) existing.remove();

    const host = document.createElement('div');
    host.id = EXTENSION_HOST_ID;
    host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;';

    const shadow = host.attachShadow({ mode: 'closed' });

    // --- Button ---
    const btn = document.createElement('button');
    btn.innerHTML = '\uD83D\uDCCB';
    btn.title = `Kopier ${siteName}-data`;
    btn.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:2147483647;
      width:50px; height:50px; border-radius:50%;
      background:${isFinn ? '#0078D7' : '#FF6B35'}; color:#fff; border:none;
      font-size:24px; cursor:pointer; box-shadow:0 4px 8px rgba(0,0,0,0.2);
      display:flex; align-items:center; justify-content:center;
      transition:transform 0.2s; pointer-events:auto;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';

    // --- Toast ---
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:90px; right:20px;
      background:#333; color:#fff; padding:10px 16px;
      border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.2);
      opacity:0; transition:opacity 0.3s; pointer-events:none;
      max-width:320px; font-size:13px; font-family:system-ui,sans-serif;
      line-height:1.3;
    `;

    // --- Click handler: always extract fresh data ---
    btn.onclick = () => {
      if (isHjem) {
        extractHjemData().then(result => {
          const isDuplicate = lastCopiedUrl === window.location.href;
          lastCopiedUrl = window.location.href;
          const msg = buildToastMsg(result.title, result.filledCount, result.totalCount, isDuplicate);
          copyToClipboard(result.fields.join('\t'), toast, msg);
        });
      } else {
        const result = extractFinnData();
        const isDuplicate = lastCopiedUrl === window.location.href;
        lastCopiedUrl = window.location.href;
        const msg = buildToastMsg(result.title, result.filledCount, result.totalCount, isDuplicate);
        copyToClipboard(result.fields.join('\t'), toast, msg);
      }
    };

    shadow.appendChild(toast);
    shadow.appendChild(btn);
    document.body.appendChild(host);
    console.log('[ExtractorExt] Shadow DOM host injected');
    return host;
  }

  // --- Persistence: re-inject if React removes the host ---
  function ensureHostPresent() {
    if (!document.getElementById(EXTENSION_HOST_ID)) {
      console.log('[ExtractorExt] Host element was removed, re-injecting...');
      createExtensionHost();
    }
  }

  let observer = null;

  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removed of mutation.removedNodes) {
          if (removed.id === EXTENSION_HOST_ID ||
              (removed.nodeType === Node.ELEMENT_NODE && removed.querySelector && removed.querySelector('#' + EXTENSION_HOST_ID))) {
            console.log('[ExtractorExt] MutationObserver detected host removal');
            setTimeout(ensureHostPresent, 0);
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Polling fallback every 2s
  setInterval(ensureHostPresent, 2000);

  // Re-check on tab focus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') setTimeout(ensureHostPresent, 500);
  });

  // Re-check on SPA navigation
  const _origPushState = history.pushState;
  history.pushState = function(...args) {
    _origPushState.apply(this, args);
    lastCopiedUrl = null; // Reset duplicate detection on navigation
    setTimeout(ensureHostPresent, 1000);
  };
  window.addEventListener('popstate', () => {
    lastCopiedUrl = null;
    setTimeout(ensureHostPresent, 1000);
  });

  // --- Wait for DOM to stabilize before initial injection ---
  function waitForStableDOM(callback) {
    let lastMutationTime = Date.now();
    let settled = false;

    const tempObserver = new MutationObserver(() => { lastMutationTime = Date.now(); });
    tempObserver.observe(document.body, { childList: true, subtree: true });

    const checkInterval = setInterval(() => {
      if (Date.now() - lastMutationTime > 500 && !settled) {
        settled = true;
        clearInterval(checkInterval);
        tempObserver.disconnect();
        console.log('[ExtractorExt] DOM stable, injecting UI');
        callback();
      }
    }, 200);

    // Safety: inject after 5s max
    setTimeout(() => {
      if (!settled) {
        settled = true;
        clearInterval(checkInterval);
        tempObserver.disconnect();
        console.log('[ExtractorExt] Max wait reached, injecting UI');
        callback();
      }
    }, 5000);
  }

  // --- Initialize ---
  waitForStableDOM(() => {
    createExtensionHost();
    startObserver();
  });
}
