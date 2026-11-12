// Tagesspiegel Filter - Coral iframe auto-sort bridge (content script)
// Injects a MAIN-world patch into coral.tagesspiegel.de embed iframe.

(function () {
  'use strict';

  const EXT = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);
  if (!EXT) {
    return;
  }

  if (!/\/embed\/stream/.test(location.pathname)) {
    return;
  }

  console.log('[Tagesspiegel Filter] Coral auto-sort script loaded.');

  const CHANNEL = 'TS_CORAL_AUTO_SORT';
  const CONFIG = {
    enabledDefault: true
  };

  let autoSortEnabled = CONFIG.enabledDefault;
  let mainReady = false;

  const postToMain = (type, payload) => {
    try {
      window.postMessage({ channel: CHANNEL, type, ...payload }, '*');
    } catch (error) {
      // Ignore postMessage errors.
    }
  };

  const sendState = () => {
    if (!mainReady) {
      return;
    }
    postToMain('STATE', { enabled: autoSortEnabled });
  };

  const handleMainMessage = (event) => {
    if (event.source !== window) {
      return;
    }
    const data = event.data;
    if (!data || data.channel !== CHANNEL) {
      return;
    }
    if (data.type === 'READY') {
      mainReady = true;
      sendState();
      return;
    }
    if (data.type === 'RESULT') {
      EXT.runtime.sendMessage({
        type: 'CORAL_AUTO_SORT_RESULT',
        status: data.status,
        detail: data.detail || null
      }).catch(() => {});
    }
  };

  window.addEventListener('message', handleMainMessage);

  const injectMainWorld = () => {
    const script = document.createElement('script');
    script.textContent = `(() => {
      'use strict';

      if (window.__TS_CORAL_AUTO_SORT_INJECTED__) {
        return;
      }
      window.__TS_CORAL_AUTO_SORT_INJECTED__ = true;

      const CHANNEL = 'TS_CORAL_AUTO_SORT';
      const CONFIG = {
        enabledDefault: true,
        failureTimeoutMs: 8000
      };

      const ASSET_KEY = (() => {
        try {
          const params = new URLSearchParams(location.search);
          return params.get('asset_id') || params.get('asset_url') || location.search || 'default';
        } catch (error) {
          return 'default';
        }
      })();

      const APPLY_ONCE_KEY = 'tsAutoSortApplied:' + ASSET_KEY;

      const TARGET_SORT = {
        sortBy: 'RESPECTS',
        sortOrder: 'DESC'
      };

      let autoSortEnabled = CONFIG.enabledDefault;
      let failureTimer = null;
      let notified = false;

      const post = (type, payload) => {
        try {
          window.postMessage({ channel: CHANNEL, type, ...payload }, '*');
        } catch (error) {
          // Ignore postMessage errors.
        }
      };

      const markApplied = () => {
        try {
          sessionStorage.setItem(APPLY_ONCE_KEY, '1');
        } catch (error) {
          // Ignore storage errors.
        }
      };

      const clearApplied = () => {
        try {
          sessionStorage.removeItem(APPLY_ONCE_KEY);
        } catch (error) {
          // Ignore storage errors.
        }
      };

      const alreadyApplied = () => {
        try {
          return sessionStorage.getItem(APPLY_ONCE_KEY) === '1';
        } catch (error) {
          return false;
        }
      };

      const notifyResult = (status, detail) => {
        if (notified) {
          return;
        }
        notified = true;
        post('RESULT', { status, detail });
      };

      const scheduleFailure = () => {
        if (failureTimer) {
          return;
        }
        failureTimer = setTimeout(() => {
          if (!alreadyApplied() && autoSortEnabled) {
            notifyResult('failed', 'no-sort-request');
          }
        }, CONFIG.failureTimeoutMs);
      };

      const cancelFailure = () => {
        if (failureTimer) {
          clearTimeout(failureTimer);
          failureTimer = null;
        }
      };

      const isTargetOperation = (payload) => {
        const opName = String(payload.operationName || '');
        const query = String(payload.query || '');
        return opName === 'CoralEmbedStream_Embed' || query.includes('CoralEmbedStream_Embed');
      };

      const applySortVariables = (payload) => {
        if (!payload || typeof payload !== 'object') {
          return false;
        }
        if (!payload.variables || typeof payload.variables !== 'object') {
          payload.variables = {};
        }
        payload.variables.sortBy = TARGET_SORT.sortBy;
        payload.variables.sortOrder = TARGET_SORT.sortOrder;
        return true;
      };

      const maybeModifyPayload = (payload) => {
        if (!autoSortEnabled || alreadyApplied()) {
          return false;
        }

        let modified = false;
        if (Array.isArray(payload)) {
          payload.forEach((entry) => {
            if (entry && isTargetOperation(entry)) {
              modified = applySortVariables(entry) || modified;
            }
          });
          return modified;
        }

        if (payload && isTargetOperation(payload)) {
          modified = applySortVariables(payload);
        }
        return modified;
      };

      const tryParseJson = (bodyText) => {
        if (typeof bodyText !== 'string') {
          return null;
        }
        const trimmed = bodyText.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          return null;
        }
        try {
          return JSON.parse(trimmed);
        } catch (error) {
          return null;
        }
      };

      const parseGraphQLBody = (bodyText) => {
        const jsonPayload = tryParseJson(bodyText);
        if (jsonPayload) {
          return {
            kind: 'json',
            payload: jsonPayload,
            build: (payload) => JSON.stringify(payload)
          };
        }

        try {
          const params = new URLSearchParams(bodyText);
          if (!params.has('query')) {
            return null;
          }
          const payload = {
            operationName: params.get('operationName') || '',
            query: params.get('query') || '',
            variables: {}
          };
          const rawVariables = params.get('variables');
          if (rawVariables) {
            try {
              payload.variables = JSON.parse(rawVariables);
            } catch (error) {
              payload.variables = {};
            }
          }
          return {
            kind: 'url',
            payload,
            build: (nextPayload) => {
              if (nextPayload.operationName) {
                params.set('operationName', nextPayload.operationName);
              }
              if (nextPayload.query) {
                params.set('query', nextPayload.query);
              }
              params.set('variables', JSON.stringify(nextPayload.variables || {}));
              return params.toString();
            }
          };
        } catch (error) {
          return null;
        }
      };

      const bodyToText = (body) => {
        if (!body) {
          return null;
        }
        if (typeof body === 'string') {
          return body;
        }
        if (body instanceof URLSearchParams) {
          return body.toString();
        }
        if (body instanceof FormData) {
          const params = new URLSearchParams();
          for (const [key, value] of body.entries()) {
            if (typeof value !== 'string') {
              return null;
            }
            params.append(key, value);
          }
          return params.toString();
        }
        if (body instanceof ArrayBuffer) {
          return new TextDecoder().decode(body);
        }
        if (ArrayBuffer.isView(body)) {
          return new TextDecoder().decode(body);
        }
        return null;
      };

      const patchFetch = () => {
        if (!window.fetch) {
          return;
        }
        const originalFetch = window.fetch.bind(window);
        window.fetch = async (input, init = {}) => {
          let modified = false;
          let nextInput = input;
          let nextInit = init;

          try {
            if (autoSortEnabled && !alreadyApplied()) {
              let bodyText = null;
              let method = (init && init.method) || (input instanceof Request ? input.method : 'GET');
              if (method && ['GET', 'HEAD'].includes(String(method).toUpperCase())) {
                bodyText = null;
              } else if (init && init.body) {
                bodyText = bodyToText(init.body);
                if (!bodyText && init.body instanceof Blob) {
                  bodyText = await init.body.text();
                }
              } else if (input instanceof Request) {
                const clone = input.clone();
                bodyText = await clone.text();
              }

              if (bodyText) {
                const parsed = parseGraphQLBody(bodyText);
                if (parsed) {
                  modified = maybeModifyPayload(parsed.payload);
                  if (modified) {
                    const newBody = parsed.build(parsed.payload);
                    if (input instanceof Request && (!init || !init.body)) {
                      nextInput = new Request(input, { body: newBody });
                      nextInit = undefined;
                    } else {
                      nextInit = { ...init, body: newBody };
                    }
                  }
                }
              }
            }
          } catch (error) {
            // Ignore parse errors; fall back to original request.
          }

          const response = await originalFetch(nextInput, nextInit);
          if (modified) {
            markApplied();
            cancelFailure();
            console.log('[Tagesspiegel Filter] Applied auto-sort to Coral fetch request.');
            notifyResult('success', \`\${TARGET_SORT.sortBy}:\${TARGET_SORT.sortOrder}\`);
          }
          return response;
        };
      };

      const patchXhr = () => {
        if (!window.XMLHttpRequest) {
          return;
        }
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
          this.__tsAutoSortMethod = method;
          this.__tsAutoSortUrl = url;
          return originalOpen.call(this, method, url, ...rest);
        };

        XMLHttpRequest.prototype.send = function (body) {
          let nextBody = body;
          let modified = false;

          try {
            const method = String(this.__tsAutoSortMethod || 'POST').toUpperCase();
            if (autoSortEnabled && !alreadyApplied() && method !== 'GET' && method !== 'HEAD') {
              const bodyText = bodyToText(body);
              const parsed = bodyText ? parseGraphQLBody(bodyText) : null;
              if (parsed) {
                modified = maybeModifyPayload(parsed.payload);
                if (modified) {
                  nextBody = parsed.build(parsed.payload);
                }
              }
            }
          } catch (error) {
            // Ignore parse errors; fall back to original request.
          }

          const result = originalSend.call(this, nextBody);
          if (modified) {
            markApplied();
            cancelFailure();
            console.log('[Tagesspiegel Filter] Applied auto-sort to Coral XHR request.');
            notifyResult('success', \`\${TARGET_SORT.sortBy}:\${TARGET_SORT.sortOrder}\`);
          }
          return result;
        };
      };

      const handleMessage = (event) => {
        if (event.source !== window) {
          return;
        }
        const data = event.data;
        if (!data || data.channel !== CHANNEL) {
          return;
        }
        if (data.type === 'STATE') {
          autoSortEnabled = data.enabled !== false;
          notified = false;
          cancelFailure();
          if (!autoSortEnabled) {
            clearApplied();
            return;
          }
          if (!alreadyApplied()) {
            scheduleFailure();
          }
        }
      };

      window.addEventListener('message', handleMessage);
      patchFetch();
      patchXhr();
      if (autoSortEnabled && !alreadyApplied()) {
        scheduleFailure();
      }
      post('READY');
    })();`;

    (document.head || document.documentElement).appendChild(script);
    script.remove();
  };

  const loadSettings = async () => {
    try {
      const result = await EXT.storage.sync.get({ autoSortComments: CONFIG.enabledDefault });
      autoSortEnabled = result.autoSortComments !== false;
    } catch (error) {
      autoSortEnabled = CONFIG.enabledDefault;
    }
  };

  const init = async () => {
    injectMainWorld();
    await loadSettings();
    sendState();

    EXT.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync' || !changes.autoSortComments) {
        return;
      }
      autoSortEnabled = changes.autoSortComments.newValue !== false;
      sendState();
    });
  };

  init().catch(() => {});
})();
