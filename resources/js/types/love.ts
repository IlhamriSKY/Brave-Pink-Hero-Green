import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

export interface LoveClickedEvent {
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
  drift?: number; // horizontal drift distance
  rise?: number; // vertical rise distance (positive, will be used as -rise)
  duration?: number; // animation duration seconds
}
