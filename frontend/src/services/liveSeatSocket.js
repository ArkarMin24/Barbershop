export function createSeatSocket({ onUpdate, onConnectionChange, onError }) {
  let reconnectTimeout = null;
  let reconnectDelay = 1000;
  let socket = null;
  let isClosedManually = false;

  const connect = () => {
    if (isClosedManually) {
      return;
    }

    onConnectionChange?.('connecting');
    const socketUrl = new URL('/ws/seats/', `${WS_BASE_URL}/`).toString();
    socket = new WebSocket(socketUrl);

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
      if (isClosedManually) {
        return;
      }

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
      isClosedManually = true;
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
