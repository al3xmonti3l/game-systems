export function getConstellation(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

// Chinese zodiac cycles on year mod 12, anchored to 1900 = Rat
const CHINESE_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

export function getChineseZodiac(year: number): string {
  return CHINESE_ANIMALS[((year - 1900) % 12 + 12) % 12];
}

export interface TitlePair {
  constellationTitle: string;
  zodiacTitle: string;
}

// Maps each sign/animal to a lore-flavoured title
const CONSTELLATION_TITLES: Record<string, string> = {
  Aries:       'Ember Vanguard',
  Taurus:      'Iron Bulwark',
  Gemini:      'Twin-Souled Wanderer',
  Cancer:      'Tidewarden',
  Leo:         'Crown of Solfire',
  Virgo:       'Sage of the Still Grove',
  Libra:       'Arbiter of the Void Scale',
  Scorpio:     'Phantom Sting',
  Sagittarius: 'Starchaser Nomad',
  Capricorn:   'Stonepeak Sovereign',
  Aquarius:    'Current Binder',
  Pisces:      'Dreamer of Deep Waters',
};

const ZODIAC_TITLES: Record<string, string> = {
  Rat:     'Child of Silver Cunning',
  Ox:      'Bearer of the Iron Yoke',
  Tiger:   'Storm-Mane Challenger',
  Rabbit:  'Moonlit Artisan',
  Dragon:  'Heir of Celestial Fire',
  Snake:   'Keeper of Hidden Coils',
  Horse:   'Windborn Galloper',
  Goat:    'Tender of the High Pasture',
  Monkey:  'Trickster of the Jade Branch',
  Rooster: 'Herald at Dawn\'s Gate',
  Dog:     'Sentinel of Loyal Bones',
  Pig:     'Feaster in the Golden Hall',
};

export function deriveTitles(month: number, day: number, year: number): TitlePair {
  const constellation = getConstellation(month, day);
  const animal = getChineseZodiac(year);
  return {
    constellationTitle: CONSTELLATION_TITLES[constellation],
    zodiacTitle: ZODIAC_TITLES[animal],
  };
}
