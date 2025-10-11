/**
 * Text normalization utilities for Bulgarian Cyrillic to Latin transliteration
 */

// Transliteration map for Bulgarian Cyrillic to Latin
const transliterationMap: Record<string, string> = {
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ж: 'ZH',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'H',
  Ц: 'TS',
  Ч: 'CH',
  Ш: 'SH',
  Щ: 'SHT',
  Ъ: 'A',
  Ь: 'Y',
  Ю: 'YU',
  Я: 'YA'
}

/**
 * Normalize text by transliterating Cyrillic to Latin and converting to uppercase
 */
export function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toUpperCase()
    .split('')
    .map((char) => transliterationMap[char] || char)
    .join('')
    .trim()
}

/**
 * Bulgarian cities for name cleaning (sorted by length for proper matching)
 */
export const BULGARIAN_CITIES = [
  'SOFIA',
  'SOFIYA',
  'SOFIQ',
  'СОФИЯ',
  'VARNA',
  'ВАРНА',
  'BURGAS',
  'БУРГАС',
  'PLOVDIV',
  'ПЛОВДИВ',
  'RUSE',
  'РУСЕ',
  'STARA ZAGORA',
  'СТАРА ЗАГОРА',
  'PLEVEN',
  'ПЛЕВЕН',
  'SLIVEN',
  'СЛИВЕН',
  'DOBRICH',
  'ДОБРИЧ',
  'SHUMEN',
  'ШУМЕН',
  'PERNIK',
  'ПЕРНИК',
  'HASKOVO',
  'ХАСКОВО',
  'YAMBOL',
  'ЯМБОЛ',
  'PAZARDZHIK',
  'ПАЗАРДЖИК',
  'BLAGOEVGRAD',
  'БЛАГОЕВГРАД',
  'VELIKO TARNOVO',
  'ВЕЛИКО ТЪРНОВО',
  'VRACA',
  'ВРАЦА'
].sort((a, b) => b.length - a.length)

/**
 * Clean up business names by removing cities, country codes, and legal suffixes
 */
export function cleanBusinessName(name: string): string {
  // Remove country codes (BGR, LUX, DEU, FRA, USA, etc.)
  let cleaned = name.replace(/^[A-Z]{3}\s+/i, '')

  // Remove city names at the start
  for (const city of BULGARIAN_CITIES) {
    const regex = new RegExp(`^${city}\\s+`, 'i')
    cleaned = cleaned.replace(regex, '')
  }

  // Remove common legal suffixes (Bulgarian business types)
  cleaned = cleaned
    .replace(/\s+EOOD$/i, '') // ЕООД - Еднолично дружество с ограничена отговорност
    .replace(/\s+OOD$/i, '') // ООД - Дружество с ограничена отговорност
    .replace(/\s+AD$/i, '') // АД - Акционерно дружество
    .replace(/\s+EAD$/i, '') // ЕАД - Еднолично акционерно дружество
    .replace(/\s+LTD$/i, '') // Ltd - Limited
    .replace(/\s+EOOD$/i, '')
    .replace(/\s+ООД$/i, '')
    .replace(/\s+АД$/i, '')
    .replace(/\s+ЕАД$/i, '')
    .replace(/\s+ЕООД$/i, '')

  // Remove "BULGARIA" suffix
  cleaned = cleaned.replace(/\s+BULGARIA$/i, '').replace(/\s+БЪЛГАРИЯ$/i, '')

  // Trim extra whitespace
  cleaned = cleaned.trim()

  // If the cleaned name is too short or empty, return original
  if (cleaned.length < 3) {
    return name
  }

  // Capitalize first letter of each word for better readability
  cleaned = cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')

  return cleaned
}
