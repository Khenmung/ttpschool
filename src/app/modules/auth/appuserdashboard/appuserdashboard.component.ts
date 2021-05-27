import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IStudentFeePayment } from '../../FeesManagement/studentfeepayment/addstudentfeepayment/addstudentfeepayment.component';

@Component({
  selector: 'app-appuserdashboard',
  templateUrl: './appuserdashboard.component.html',
  styleUrls: ['./appuserdashboard.component.scss']
})
export class AppuserdashboardComponent implements OnInit {
  constructor(){}
  ngOnInit(){}
}
