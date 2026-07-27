export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const TITLE_SECONDS = 4;
export const HERO_SECONDS = 4.5;
export const PHOTO_SECONDS_EACH = 3.0;
export const MIN_PHOTO_SECONDS_EACH = 1.5;
export const TRANSITION_SECONDS = 0.4;
export const FEATURES_SECONDS = 5.0;
export const CTA_SECONDS = 3.5;

// Default window used when no explicit durationSeconds is given: the video
// length follows the music track, clamped to this range.
export const MIN_DURATION_SECONDS = 25;
export const MAX_DURATION_SECONDS = 30;

// Hard bounds for an explicit durationSeconds request (e.g. a 15s TikTok cut
// or a 60s YouTube ad) - anything outside this gets clamped rather than
// rejected.
export const ABSOLUTE_MIN_DURATION_SECONDS = 6;
export const ABSOLUTE_MAX_DURATION_SECONDS = 120;

// Below MIN_DURATION_SECONDS, the intro/features/CTA segments scale down
// proportionally (see MontageAd) so a short ad doesn't spend all its time on
// text cards. These are the floors that scaling won't go under.
export const MIN_SCALED_HERO_SECONDS = 2;
export const MIN_SCALED_TITLE_SECONDS = 1.5;
export const MIN_SCALED_FEATURES_SECONDS = 2;
export const MIN_SCALED_CTA_SECONDS = 2;

export const HERO_GRADIENT = 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)';
export const GOLD_GRADIENT = 'linear-gradient(180deg, #2A1B3D 0%, #170F22 100%)';
export const GOLD = '#D4AF37';
export const DARK_PURPLE = '#170F22';

export const FONT_FAMILY = '"Arial", "Helvetica Neue", sans-serif';
