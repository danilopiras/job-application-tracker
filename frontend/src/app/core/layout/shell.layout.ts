import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { startWith } from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shell-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './shell.layout.html',
  styleUrl: './shell.layout.scss',
})
export class ShellLayout {
  private auth = inject(AuthService);
  private transloco = inject(TranslocoService);

  protected langs = [...environment.availableLangs];
  protected activeLang = toSignal(
    this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() },
  );

  protected userEmail = computed(() => this.auth.auth()?.email ?? '');

  protected sidenavOpen = signal(true);

  protected isSmall = computed(() => window.matchMedia('(max-width: 960px)').matches);

  toggleSidenav() {
    this.sidenavOpen.update((v) => !v);
  }

  setLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.transloco.setActiveLang(lang);
  }

  logout() {
    this.auth.logout().subscribe({
      complete: () => {
        location.href = '/auth/login';
      },
      error: () => {
        location.href = '/auth/login';
      },
    });
  }
}

