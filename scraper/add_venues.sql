-- Run this in Supabase SQL Editor to add new venues

INSERT INTO venues (id, name, address, city, state, website_url, color_bg, color_text, color_border, color_hex, active, aliases)
VALUES
  (
    'chi-health-center',
    'CHI Health Center',
    '455 N 10th St',
    'Omaha',
    'NE',
    'https://chihealthcenteromaha.com',
    'bg-red-500/20',
    'text-red-400',
    'border-red-500',
    '#ef4444',
    true,
    ARRAY['chi health center omaha', 'chi center', 'chi', 'centurylink center']
  ),
  (
    'pinnacle-bank-arena',
    'Pinnacle Bank Arena',
    '400 Pinnacle Arena Dr',
    'Lincoln',
    'NE',
    'https://www.pinnaclebankarena.com',
    'bg-orange-500/20',
    'text-orange-400',
    'border-orange-500',
    '#f97316',
    true,
    ARRAY['pinnacle bank arena lincoln', 'pinnacle arena', 'pba']
  ),
  (
    'pinewood-bowl',
    'Pinewood Bowl Theater',
    '4000 S 80th St',
    'Lincoln',
    'NE',
    'https://www.pinnaclebankarena.com/venue/pinewood-bowl',
    'bg-green-500/20',
    'text-green-400',
    'border-green-500',
    '#22c55e',
    true,
    ARRAY['pinewood bowl', 'pinewood bowl amphitheater', 'pinewood bowl theater']
  ),
  (
    'memorial-stadium',
    'Memorial Stadium',
    '1 Memorial Stadium Dr',
    'Lincoln',
    'NE',
    'https://huskers.com/facilities/memorial-stadium',
    'bg-rose-500/20',
    'text-rose-400',
    'border-rose-500',
    '#f43f5e',
    true,
    ARRAY['memorial stadium lincoln', 'nebraska memorial stadium']
  ),
  (
    'rococo-theatre',
    'Rococo Theatre',
    '140 N 13th St',
    'Lincoln',
    'NE',
    'https://rfrococoandkindred.com/rococo',
    'bg-violet-500/20',
    'text-violet-400',
    'border-violet-500',
    '#8b5cf6',
    true,
    ARRAY['rococo theatre lincoln', 'rococo theater']
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  website_url = EXCLUDED.website_url,
  color_bg = EXCLUDED.color_bg,
  color_text = EXCLUDED.color_text,
  color_border = EXCLUDED.color_border,
  color_hex = EXCLUDED.color_hex,
  active = EXCLUDED.active,
  aliases = EXCLUDED.aliases;
