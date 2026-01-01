import { useEffect, useRef } from 'react';
import { createWS } from '../../../services/ws';

export default function useTaskUpdates(wsBaseUrl, { onTaskUpdate, onUnknownTask, onError } = {}) {
  const clientRef = useRef(null);
  useEffect(() => {
    if (!wsBaseUrl) return;
    const url = `${wsBaseUrl}/ws`;
    clientRef.current = createWS(url, {
      onMessage: (ev) => {
        try {
          const message = JSON.parse(ev.data);
          if (message && message.type === 'task_update' && message.uuid && message.task_data) {
            if (onTaskUpdate) onTaskUpdate(message);
            if (message.status === 'failed' && onError) onError(message);
          } else {
            if (onUnknownTask) onUnknownTask(message);
          }
        } catch (e) {}
      }
    });
    return () => { clientRef.current && clientRef.current.close(); };
  }, [wsBaseUrl, onTaskUpdate, onUnknownTask, onError]);
}

