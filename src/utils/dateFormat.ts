/**
 * Global date formatting utilities enforcing DD/MM/YYYY as the platform default.
 */

export function parseDateValue(input: Date | string | number | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  const trimmed = String(input).trim();
  if (!trimmed) return null;

  // YYYY-MM-DD (avoid timezone shift by constructing local calendar date)
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmyMatch) {
    const d = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateDDMMYYYY(
  input: Date | string | number | null | undefined,
  fallback = '—'
): string {
  const d = parseDateValue(input);
  if (!d) {
    return typeof input === 'string' && input.trim() ? input.trim() : fallback;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTimeDDMMYYYY(
  input: Date | string | number | null | undefined,
  fallback = '—'
): string {
  const d = parseDateValue(input);
  if (!d) return fallback;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
}

export function normalizeDateToISO(input: string | null | undefined): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  const isoPrefix = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoPrefix) {
    return `${isoPrefix[1]}-${isoPrefix[2]}-${isoPrefix[3]}`;
  }

  const dmyMatch = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
  }

  return trimmed;
}

export function installGlobalDefaultDateFormat(): void {
  const globalObj = globalThis as Record<string, unknown>;
  if (globalObj.__truvaerDateFormatInstalled) return;
  globalObj.__truvaerDateFormatInstalled = true;

  const origToLocaleDateString = Date.prototype.toLocaleDateString;
  const origToLocaleString = Date.prototype.toLocaleString;

  Date.prototype.toLocaleDateString = function (
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (isNaN(this.getTime())) {
      return origToLocaleDateString.call(this, locales, options);
    }
    if (locales === undefined) {
      if (!options) {
        return formatDateDDMMYYYY(this);
      }
      return origToLocaleDateString.call(this, 'en-GB', options);
    }
    return origToLocaleDateString.call(this, locales, options);
  };

  Date.prototype.toLocaleString = function (
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (isNaN(this.getTime())) {
      return origToLocaleString.call(this, locales, options);
    }
    if (locales === undefined) {
      if (!options) {
        return origToLocaleString.call(this, 'en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }
      return origToLocaleString.call(this, 'en-GB', options);
    }
    return origToLocaleString.call(this, locales, options);
  };
}
