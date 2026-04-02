import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

export type ConfirmDialogData = {
  titleKey: string;
  messageKey: string;
  confirmKey?: string;
  cancelKey?: string;
};

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslocoPipe],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  ref = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
