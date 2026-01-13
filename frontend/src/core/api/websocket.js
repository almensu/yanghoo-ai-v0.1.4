/**
 * WebSocket client with auto-reconnection and heartbeat
 * @module core/api/websocket
 */
import { WS_HEARTBEAT_MS, WS_RETRY_BACKOFF } from '../config/constants';

/**
 * Creates a WebSocket connection with automatic reconnection and heartbeat
 * @param {string} url - WebSocket URL
 * @param {Object} handlers - Event handlers
 * @param {Function} handlers.onOpen - Called when connection opens
 * @param {Function} handlers.onClose - Called when connection closes
 * @param {Function} handlers.onError - Called on error
 * @param {Function} handlers.onMessage - Called on message received
 * @param {Object} options - Configuration options
 * @param {number} options.heartbeatMs - Heartbeat interval in ms
 * @param {number[]} options.retryBackoff - Retry delays array
 * @returns {Object} WebSocket controller with close method
 */
export function createWebSocket(url, handlers = {}, options = {}) {
    const { onOpen, onClose, onError, onMessage } = handlers;
    const {
        heartbeatMs = WS_HEARTBEAT_MS,
        retryBackoff = WS_RETRY_BACKOFF
    } = options;

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
                    try {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    } catch (e) {
                        // Silent fail for heartbeat
                    }
                }, heartbeatMs);
            }
            if (onOpen) onOpen();
        };

        ws.onclose = (ev) => {
            clearInterval(heartbeat);
            if (onClose) onClose(ev);
            if (!closed) scheduleReconnect();
        };

        ws.onerror = (err) => {
            if (onError) onError(err);
        };

        ws.onmessage = (ev) => {
            if (onMessage) onMessage(ev);
        };
    }

    function scheduleReconnect() {
        const delay = retryBackoff[Math.min(retryBackoff.length - 1, retry++)];
        setTimeout(() => {
            if (!closed) connect();
        }, delay);
    }

    connect();

    return {
        /**
         * Close the WebSocket connection
         */
        close() {
            closed = true;
            try {
                clearInterval(heartbeat);
            } catch (e) {
                // Silent fail
            }
            try {
                ws && ws.close();
            } catch (e) {
                // Silent fail
            }
        },

        /**
         * Send data through the WebSocket
         * @param {*} data - Data to send
         */
        send(data) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(typeof data === 'string' ? data : JSON.stringify(data));
            }
        }
    };
}

// Backward compatibility alias
export const createWS = createWebSocket;
