import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

export interface LoveClickedEvent {
  user_id: string;
  timestamp: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  velocity: { x: number; y: number };
  life: number;
  color: string;
  delay?: number;
  size?: number;
}
