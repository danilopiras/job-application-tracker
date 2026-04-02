import { APP_INITIALIZER, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  provideTransloco,
  TranslocoLoader,
  translocoConfig,
  TranslocoService,
} from '@jsverse/transloco';

import { environment } from '../../../environments/environment';

const FALLBACK = environment.defaultLang;

function langFromNavigator(available: readonly string[]): string {
  if (typeof navigator === 'undefined') {
    return FALLBACK;
  }
  const tags =
    navigator.languages && navigator.languages.length > 0
      ? Array.from(navigator.languages)
      : [navigator.language || FALLBACK];
  const byPrimary = new Map(available.map((code) => [code.toLowerCase(), code]));
  for (const tag of tags) {
    const primary = tag.split('-')[0]?.toLowerCase();
    if (primary && byPrimary.has(primary)) {
      return byPrimary.get(primary)!;
    }
  }
  return FALLBACK;
}

function resolveInitialLang(available: readonly string[]): string {
  const stored = localStorage.getItem('lang');
  if (stored) {
    const key = stored.split('-')[0].toLowerCase();
    const match = available.find((code) => code.toLowerCase() === key);
    if (match) {
      return match;
    }
  }
  return langFromNavigator(available);
}

@Injectable()
class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string) {
    return this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`);
  }
}

export const translocoConfigProvider = makeEnvironmentProviders([
  provideTransloco({
    config: translocoConfig({
      availableLangs: [...environment.availableLangs],
      defaultLang: FALLBACK,
      fallbackLang: FALLBACK,
      reRenderOnLangChange: true,
      prodMode: false,
    }),
    loader: TranslocoHttpLoader,
  }),
  {
    provide: APP_INITIALIZER,
    useFactory: (service: TranslocoService) => () => {
      service.setActiveLang(resolveInitialLang(environment.availableLangs));
    },
    deps: [TranslocoService],
    multi: true,
  },
]);

