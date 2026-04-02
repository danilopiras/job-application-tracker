import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { startWith } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings-page',
  imports: [TranslocoPipe, MatCardModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
})
export class SettingsPage {
  private transloco = inject(TranslocoService);

  protected langs = [...environment.availableLangs];
  protected activeLang = toSignal(
    this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() },
  );

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.transloco.setActiveLang(lang);
  }
}

