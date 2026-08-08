import * as OpenIMModule from '/sdk/index.es.js';

const state = {
  sdk: undefined,
  events: [],
  listeners: new Map(),
};

function materialize(value) {
  if (Array.isArray(value)) {
    return value.map(materialize);
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (value.__e2eFile) {
    const { name, type, bytes, lastModified } = value.__e2eFile;
    return new File([new Uint8Array(bytes)], name, { type, lastModified });
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, materialize(nested)])
  );
}

function serializable(value, seen = new WeakSet()) {
  if (value === undefined) {
    return { __e2eUndefined: true };
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (seen.has(value)) {
    return { __e2eCircular: true };
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map(item => serializable(item, seen));
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      serializable(nested, seen),
    ])
  );
}

function initialize(config) {
  if (state.sdk) {
    return;
  }
  state.sdk = OpenIMModule.getSDK({
    coreWasmPath: config.coreWasmPath,
    sqlWasmPath: config.sqlWasmPath,
    debug: config.debug,
  });
  for (const eventName of Object.values(OpenIMModule.SdkEvent)) {
    if (eventName === OpenIMModule.SdkEvent.UnUsedEvent) {
      continue;
    }
    const listener = payload => {
      state.events.push({
        name: eventName,
        payload: serializable(payload),
        receivedAt: Date.now(),
      });
    };
    state.listeners.set(eventName, listener);
    state.sdk.on(eventName, listener);
  }
}

window.__OPENIM_E2E__ = {
  module: OpenIMModule,
  initialize,
  async waitForWasm() {
    if (!state.sdk) {
      throw new Error('SDK is not initialized');
    }
    await state.sdk.wasmInitializationPromise;
  },
  surface(expectedMethods = []) {
    return expectedMethods
      .filter(key => typeof state.sdk?.[key] === 'function')
      .sort();
  },
  async database(method, args = []) {
    try {
      const fn = window[method];
      if (typeof fn !== 'function') {
        throw new Error(`Database member "${method}" is not callable`);
      }
      const value = await fn(...materialize(args));
      return {
        ok: true,
        value: serializable(
          typeof value === 'string' ? JSON.parse(value) : value
        ),
      };
    } catch (error) {
      return { ok: false, error: serializable(error) };
    }
  },
  events() {
    return serializable(state.events);
  },
  clearEvents() {
    state.events.length = 0;
  },
};

document.querySelector('#status').textContent = 'ready';
document.body.dataset.ready = 'true';
