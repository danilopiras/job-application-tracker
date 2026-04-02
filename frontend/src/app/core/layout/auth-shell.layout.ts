import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { startWith } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-shell-layout',
  imports: [RouterOutlet, TranslocoPipe, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './auth-shell.layout.html',
  styleUrl: './auth-shell.layout.scss',
})
export class AuthShellLayout {
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
