import { formatDate } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const LOCALE_BY_LANG: Record<string, string> = {
  en: 'en',
  it: 'it',
  es: 'es',
  fr: 'fr',
  pt: 'pt',
  de: 'de',
};

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false,
})
export class LocalizedDatePipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(value: Date | string | number | null | undefined, format = 'medium'): string | null {
    if (value == null || value === '') {
      return null;
    }
    const lang = this.transloco.getActiveLang();
    const locale = LOCALE_BY_LANG[lang] ?? 'en';
    try {
      return formatDate(value, format, locale);
    } catch {
      return formatDate(value, format, 'en');
    }
  }
}
