import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-mat-confirm-dialog',
  templateUrl: './mat-confirm-dialog.component.html',
  styleUrls: ['./mat-confirm-dialog.component.scss']
})
export class MatConfirmDialogComponent implements OnInit {
loading=false;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
              public dialogRef:MatDialogRef<MatConfirmDialogComponent>
  ) { }

  ngOnInit(): void {
  }
  closedialog(){
    this.dialogRef.close(false);
  }

}
