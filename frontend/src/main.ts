import 'zone.js';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localePt from '@angular/common/locales/pt';
import { bootstrapApplication } from '@angular/platform-browser';

registerLocaleData(localeEn);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localeFr);
registerLocaleData(localePt);
registerLocaleData(localeDe);
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
