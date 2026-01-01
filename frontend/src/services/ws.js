export function createWS(url, handlers = {}, options = {}) {
  const { onOpen, onClose, onError, onMessage } = handlers;
  const { heartbeatMs = 30000, retryBackoff = [1000, 2000, 5000, 10000] } = options;
  let ws;
  let closed = false;
  let retry = 0;
  let heartbeat;

  function connect() {
    ws = new WebSocket(url);
    ws.onopen = () => {
      retry = 0;
      if (heartbeatMs > 0) {
        clearInterval(heartbeat);
        heartbeat = setInterval(() => {
          try { ws.send(JSON.stringify({ type: 'ping' })); } catch (e) {}
        }, heartbeatMs);
      }
      if (onOpen) onOpen();
    };
    ws.onclose = (ev) => {
      clearInterval(heartbeat);
      if (onClose) onClose(ev);
      if (!closed) scheduleReconnect();
    };
    ws.onerror = (err) => { if (onError) onError(err); };
    ws.onmessage = (ev) => { if (onMessage) onMessage(ev); };
  }

  function scheduleReconnect() {
    const delay = retryBackoff[Math.min(retryBackoff.length - 1, retry++)];
    setTimeout(() => { if (!closed) connect(); }, delay);
  }

  connect();

  return {
    close() {
      closed = true;
      try { clearInterval(heartbeat); } catch (e) {}
      try { ws && ws.close(); } catch (e) {}
    }
  };
}

