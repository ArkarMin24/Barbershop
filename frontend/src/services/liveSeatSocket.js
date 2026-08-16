export function createSeatSocket({ onUpdate, onConnectionChange, onError }) {
  let reconnectTimeout = null;
  let reconnectDelay = 1000;
  let socket = null;

  const connect = () => {
    onConnectionChange?.('connecting');
    socket = new WebSocket(`${WS_BASE_URL}/ws/seats/`);

    socket.onopen = () => {
      reconnectDelay = 1000;
      onConnectionChange?.('connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'seat_update') {
        onUpdate?.(message.payload);
      }

      if (message.type === 'connection') {
        onConnectionChange?.('connected');
      }

      if (message.type === 'error') {
        onError?.(message.message || 'WebSocket error');
      }
    };

    socket.onerror = () => {
      onConnectionChange?.('error');
      onError?.('WebSocket connection error');
    };

    socket.onclose = () => {
      onConnectionChange?.('reconnecting');
      reconnectTimeout = window.setTimeout(() => {
        connect();
        reconnectDelay = Math.min(reconnectDelay * 2, 5000);
      }, reconnectDelay);
    };
  };

  connect();

  return {
    close() {
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    },
  };
}
import { WS_BASE_URL } from '../config';
