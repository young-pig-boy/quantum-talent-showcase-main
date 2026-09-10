'use client';

import { useState } from 'react';
import { X, MapPin, Filter } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { getActiveTracks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useLanguageMode } from '@/lib/language-mode';
import { localizeCity } from '@/lib/localized-helpers';

interface JobFilterProps {
  selectedTrack: string;
  onTrackChange: (track: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  cities: string[];
  filterPanelOpen: boolean;
  onToggleFilterPanel: () => void;
  onClearAll: () => void;
}

export function JobFilter({
  selectedTrack,
  onTrackChange,
  selectedCity,
  onCityChange,
  cities,
  filterPanelOpen,
  onToggleFilterPanel,
  onClearAll,
}: JobFilterProps) {
  const [trackPopoverOpen, setTrackPopoverOpen] = useState(false);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const { mode } = useLanguageMode();
  const isEn = mode === 'en';

  // Track options always come from full track config (getActiveTracks)
  const staticTracks = getActiveTracks().map((t) => ({ id: t.id, name: t.name }));
  const trackOptions = staticTracks;

  const hasFilters = selectedTrack !== 'all' || selectedCity !== 'all';
  const filterCount = (selectedTrack !== 'all' ? 1 : 0) + (selectedCity !== 'all' ? 1 : 0);

  const getTrackName = (id: string) => {
    const track = trackOptions.find((t) => t.id === id);
    if (!track) return id;
    if (isEn) {
      // Use englishName from full track data
      const fullTrack = getActiveTracks().find((t) => t.id === id);
      return fullTrack?.englishName || track.name;
    }
    return track.name;
  };

  return (
    <div className="space-y-4">
      {/* Top row: filter chips + filter toggle button */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Track filter — Popover */}
        <Popover open={trackPopoverOpen} onOpenChange={setTrackPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={() => setTrackPopoverOpen(true)}
              className={cn(
                'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all',
                selectedTrack !== 'all'
                  ? 'border-accent/50 bg-accent/10 text-accent-light'
                  : 'border-border bg-muted text-muted-foreground hover:border-border hover:bg-muted',
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              {selectedTrack !== 'all' ? getTrackName(selectedTrack) : (isEn ? 'All Tracks' : '全部赛道')}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={4}
            className="min-w-[200px] rounded-xl border border-border bg-card p-1.5 shadow-lg"
          >
            <button
              onClick={() => { onTrackChange('all'); setTrackPopoverOpen(false); }}
              className={cn(
                'w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                selectedTrack === 'all' ? 'text-accent-light' : 'text-foreground',
              )}
            >
              {isEn ? 'All Tracks' : '全部赛道'}
            </button>
            {trackOptions.map((track) => (
              <button
                key={track.id}
                onClick={() => { onTrackChange(track.id); setTrackPopoverOpen(false); }}
                className={cn(
                  'w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                  selectedTrack === track.id ? 'text-accent-light' : 'text-foreground',
                )}
              >
                {isEn ? (getActiveTracks().find((t) => t.id === track.id)?.englishName || track.name) : track.name}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* City filter — Popover */}
        {cities.length > 0 && (
          <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                onClick={() => setCityPopoverOpen(true)}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all',
                  selectedCity !== 'all'
                    ? 'border-accent/50 bg-accent/10 text-accent-light'
                    : 'border-border bg-muted text-muted-foreground hover:border-border hover:bg-muted',
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                {selectedCity !== 'all' ? localizeCity(selectedCity, mode) : (isEn ? 'All Locations' : '全部城市')}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="max-h-[280px] min-w-[160px] overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-lg"
            >
              <button
                onClick={() => { onCityChange('all'); setCityPopoverOpen(false); }}
                className={cn(
                  'w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                  selectedCity === 'all' ? 'text-accent-light' : 'text-foreground',
                )}
              >
                {isEn ? 'All Locations' : '全部城市'}
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => { onCityChange(city); setCityPopoverOpen(false); }}
                  className={cn(
                    'w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                    selectedCity === city ? 'text-accent-light' : 'text-foreground',
                  )}
                >
                  {localizeCity(city, mode)}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { onTrackChange('all'); onCityChange('all'); }}
            className="flex h-10 items-center gap-1.5 rounded-full border border-border bg-muted px-3 text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            {isEn ? 'Clear' : '清空'}
          </button>
        )}
      </div>

      {/* Filter panel — expandable */}
      {filterPanelOpen && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{isEn ? 'Track' : '赛道'}</span>
                <select
                  value={selectedTrack}
                  onChange={(e) => onTrackChange(e.target.value)}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                >
                  <option value="all">{isEn ? 'All Tracks' : '全部赛道'}</option>
                  {trackOptions.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{isEn ? 'Location' : '工作地点'}</span>
                <select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
                >
                  <option value="all">{isEn ? 'All Locations' : '全部城市'}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={onClearAll}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap"
            >
              {isEn ? 'Clear All Filters' : '清空所有条件'}
            </button>
          </div>

          {/* Active filter badges */}
          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
              <span className="text-xs text-muted-foreground">{isEn ? 'Active Filters:' : '当前筛选：'}</span>
              {selectedTrack !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent-light">
                  {isEn ? `Track: ${getTrackName(selectedTrack)}` : `赛道：${getTrackName(selectedTrack)}`}
                  <button
                    onClick={() => onTrackChange('all')}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent-light">
                  {isEn ? `Location: ${selectedCity}` : `城市：${selectedCity}`}
                  <button
                    onClick={() => onCityChange('all')}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter toggle — standalone button outside the panel */}
      {!filterPanelOpen && hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{isEn ? 'Active Filters:' : '当前筛选：'}</span>
          {selectedTrack !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent-light">
              {getTrackName(selectedTrack)}
              <button onClick={() => onTrackChange('all')} className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent/20">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCity !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent-light">
              {selectedCity}
              <button onClick={() => onCityChange('all')} className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent/20">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function getFilterCount(selectedTrack: string, selectedCity: string): number {
  return (selectedTrack !== 'all' ? 1 : 0) + (selectedCity !== 'all' ? 1 : 0);
}
