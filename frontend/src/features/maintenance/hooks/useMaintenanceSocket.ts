import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || '', {
      auth: { token: localStorage.getItem('accessToken') },
      reconnectionDelayMax: 30000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}

export function useMaintenanceSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = getSocket();

    s.on('maintenance:status-update', (data: { requestId: string; requestNumber: string; newStatus: string }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-request', data.requestId] });
    });

    s.on('reconnect', () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    });

    return () => {
      s.off('maintenance:status-update');
      s.off('reconnect');
    };
  }, [queryClient]);
}
