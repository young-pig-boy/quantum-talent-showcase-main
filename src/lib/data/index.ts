import { siteConfig } from './site-config';
import { tracks } from './tracks';
import { partners } from './partners';
import type { Partner, Track } from '@/lib/types';

export { siteConfig, tracks, partners };

export function getActiveTracks(): Track[] {
  return tracks
    .filter((track) => track.status === 'active')
    .sort((a, b) => a.order - b.order);
}

export function getTrackById(id: string): Track | undefined {
  return tracks.find((track) => track.id === id);
}

export function getPartners(): Partner[] {
  return partners.sort((a, b) => a.order - b.order);
}
