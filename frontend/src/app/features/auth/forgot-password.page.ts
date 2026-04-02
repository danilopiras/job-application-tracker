import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private i18n = inject(TranslocoService);

  loading = false;

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.snack.open(this.i18n.translate('auth.forgot.sent'), this.i18n.translate('common.dismiss'), {
          duration: 4500,
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}

