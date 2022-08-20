import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import alasql from 'alasql';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import {SwUpdate} from '@angular/service-worker';

@Component({
  selector: 'app-chartreport',
  templateUrl: './chartreport.component.html',
  styleUrls: ['./chartreport.component.scss']
})
export class ChartReportComponent {
  PageLoading = true;
  ClickedReport = false;
  VariableObjList = [];
  ExpectedAmount = 0.0;
  ReceiptAmount = 0.0;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  loading = false;
  SearchForm: UntypedFormGroup;
  Months = [];
  MonthlyPayments = [];
  StudentClasses = [];
  ClassFees = [];
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  SelectedMonth = '';
  public pieChartLabels: Label[] = ['--', '---'];
  public pieChartData: SingleDataSet = [0, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  LoginUserDetail = [];
  SelectedApplicationId = 0;
  SelectedBatchId = 0;
  Permission = '';
  constructor(private servicework: SwUpdate,
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder
  ) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }
  ngOnInit() {

    this.SearchForm = this.fb.group(
      {
        searchMonth: [0]
      }
    )
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.REPORT.CHARTREPORT);
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    if (this.Permission != 'deny') {
      this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
      this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
      this.Months = this.contentservice.GetSessionFormattedMonths();

      this.GetClassFees();
      this.GetStudentClasses();
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
    }
  }
  GetMonthlyPayments(pMonth) {
    let list = new List();
    list.PageName = "AccountingLedgerTrialBalances";
    list.fields = ["Month,StudentClassId,TotalDebit,TotalCredit,Balance"];
    list.filter = ["Active eq 1 and Month eq " + pMonth + " and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    return this.dataservice.get(list);
    // .subscribe((data: any) => {
    //   this.MonthlyPayments = [...data.value];
    // })
  }
  GetClassFees() {
    let list = new List();
    list.PageName = "ClassFees";
    list.fields = ["ClassId,Month,Amount,FeeDefinitionId"];
    list.lookupFields = ["FeeDefinition($select=FeeName,AmountEditable)"];
    list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.ClassFees = [...data.value];

      })
  }
  GetStudentClasses() {
    let list = new List();
    list.PageName = "StudentClasses";
    //list.lookupFields=["SchoolFeeType($select=Formula,FeeTypeName;$filter=Active eq 1)"]
    //list.fields = ["StudentClassId","ClassId","FeeTypeId"];
    list.fields = [
      "StudentClassId",
      "SectionId",
      "StudentId",
      "BatchId",
      "ClassId",
      "RollNo",
      "FeeTypeId"
    ];
    list.lookupFields = [
      "Student($select=FirstName,LastName)",
      "FeeType($select=Formula,FeeTypeName;$filter=Active eq 1)",

    ];
    list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        console.log('data gg', data.value)
        this.StudentClasses = data.value.map(m => {
          m.Formula = m.FeeType != undefined ? m.FeeType.Formula : '';
          m.FirstName = m.Student.FirstName;
          m.LastName = m.Student.LastName;
          return m;
        });

      })
  }

  GetReport() {
    debugger;
    var selectedmonthId = this.SearchForm.get("searchMonth").value;
    if (selectedmonthId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar('Please select payment month', globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    this.SelectedMonth = this.Months.filter(f => f.val == selectedmonthId)[0].MonthName;
    var studentCount = this.StudentClasses.length;

    //var paymentObj = this.MonthlyPayments.filter(f => f.Month == selectedmonthId);
    this.GetMonthlyPayments(selectedmonthId)
      .subscribe((data: any) => {
        debugger;
        var paymentObj = [...data.value];
        var paymentcount = 0;
        var paymentCountobj = alasql("select sum(1) as PaidCount from ? where TotalDebit>0 and Balance=0 group by Month", [paymentObj]);

        var FreeCountobj = alasql("select sum(1) as FreeCount from ? where TotalDebit=0 and Balance=0 group by Month", [paymentObj]);
        var _freeCount = 0;
        if (FreeCountobj.length > 0)
          _freeCount = FreeCountobj[0].FreeCount;
        studentCount -= _freeCount;
        if (paymentCountobj.length > 0) {
          paymentcount = paymentCountobj[0].PaidCount;//_freeCount >= paymentCountobj[0].PaidCount ? 0 : paymentCountobj[0].PaidCount;
          this.ReceiptAmount = paymentObj.reduce((acc, current) => acc + current.TotalCredit, 0);
        }
        else {
          this.ReceiptAmount = 0;
        }
        this.ExpectedAmount = paymentObj.reduce((acc, current) => acc + current.TotalDebit, 0);

        var noofUnpaid = studentCount - paymentcount;
        this.pieChartLabels = ['Non-payment %', 'Payment %']
        var PaymentPercent = ((paymentcount * 100) / studentCount).toFixed(2);
        var NonPaymentPercent = ((noofUnpaid * 100) / studentCount).toFixed(2);
        console.log("paymentcount", paymentcount);
        this.pieChartData = [+NonPaymentPercent, +PaymentPercent];
        this.loading = false;
        this.PageLoading = false;
        this.ClickedReport = true;
      })
  }
  EnableButton() {
    this.ClickedReport = false;
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    this.VariableObjList.forEach(m => {
      Object.keys(m).forEach(f => {
        if (filledVar.includes(f)) {
          if (typeof m[f] != 'number')
            filledVar = filledVar.replaceAll("[" + f + "]", "'" + m[f] + "'");
          else
            filledVar = filledVar.replaceAll("[" + f + "]", m[f]);
        }
      });
    })
    return filledVar;
  }
}
