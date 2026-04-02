import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private i18n = inject(TranslocoService);

  loading = false;

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';

  form = new FormGroup({
    newPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit() {
    if (!this.token) {
      this.snack.open(this.i18n.translate('auth.reset.missingToken'), this.i18n.translate('common.dismiss'), {
        duration: 6000,
      });
      return;
    }

    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.snack.open(this.i18n.translate('auth.reset.passwordMismatch'), this.i18n.translate('common.dismiss'), {
        duration: 4500,
      });
      return;
    }

    this.loading = true;
    this.auth.resetPassword({ token: this.token, newPassword }).subscribe({
      next: () => {
        this.snack.open(this.i18n.translate('auth.reset.success'), this.i18n.translate('common.dismiss'), {
          duration: 4500,
        });
        this.router.navigateByUrl('/auth/login');
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

