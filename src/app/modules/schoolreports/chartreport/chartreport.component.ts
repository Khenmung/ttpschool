import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import alasql from 'alasql';
import { ChartType, ChartOptions } from 'chart.js';
import { evaluate } from 'mathjs';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
// import { NgChartsConfiguration} from 'ng2-charts'
@Component({
  selector: 'app-chartreport',
  templateUrl: './chartreport.component.html',
  styleUrls: ['./chartreport.component.scss']
})
export class ChartReportComponent {
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
  SearchForm: FormGroup;
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
  constructor(
    private tokenStorage: TokenStorageService,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private fb: FormBuilder,
    private alert: AlertService
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
    this.SelectedApplicationId = +this.tokenStorage.getSelectedAPPId();
    this.SelectedBatchId = +this.tokenStorage.getSelectedBatchId();
    this.Months = this.contentservice.GetSessionFormattedMonths();

    this.GetClassFees();
    this.GetStudentClasses();
    this.GetMonthlyPayments();
  }
  GetMonthlyPayments() {
    let list = new List();
    list.PageName = "AccountingLedgerTrialBalances";
    list.fields = ["Month,StudentClassId,TotalDebit,TotalCredit"];
    list.filter = ["Active eq 1 and BatchId eq " + this.SelectedBatchId + " and OrgId eq " + this.LoginUserDetail[0]["orgId"]];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.MonthlyPayments = [...data.value];
      })
  }
  GetClassFees() {
    let list = new List();
    list.PageName = "ClassFees";
    list.fields = ["ClassId,Month,Amount,FeeDefinitionId"];
    list.lookupFields=["FeeDefinition($select=FeeName,AmountEditable)"];
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
      this.loading = false;
      this.alert.info('Please select payment month', this.optionAutoClose);
      return;
    }
    this.loading = true;
    this.SelectedMonth = this.Months.filter(f => f.val == selectedmonthId)[0].MonthName;
    var studentCount = this.StudentClasses.length;

    var paymentObj = this.MonthlyPayments.filter(f => f.Month == selectedmonthId);
    var paymentcount = paymentObj.length;


    //var classfeeObjForSelectedMonth = alasql("select sum(Amount) AS TotalAmount, ClassId from ? GROUP BY ClassId",[classfeeobj]);
    var studentClassObj = alasql("select sum(1) AS NoOfStudent, ClassId from ? GROUP BY ClassId", [this.StudentClasses]);
    this.VariableObjList = [];
    this.ReceiptAmount = 0;
    this.ExpectedAmount = 0;
    var StudentInfoVariable;
    this.StudentClasses.forEach(studcls => {
      var classfeeobj = this.ClassFees.filter(f => f.Month == selectedmonthId && f.ClassId == studcls.ClassId);
      if (classfeeobj.length > 0 && studcls.Formula.length>0) {
        StudentInfoVariable = {
          "RollNo": studcls.RollNo,
          "Section": studcls.SectionId,
          "ClassId": studcls.ClassId,
          "Amount": classfeeobj[0].Amount,
          "BatchId": studcls.BatchId,
          "Month": classfeeobj[0].Month,
          "FeeName": classfeeobj[0].FeeDefinition.FeeName,
          "StudentId": studcls.StudentId,
          "StudentClassId": studcls.StudentClassId
        };
        this.VariableObjList.push(StudentInfoVariable);
        this.ExpectedAmount += evaluate(this.ApplyVariables(studcls.Formula));

        this.VariableObjList = [];
      }
    })

    //this.ExpectedAmount =  classfeeobj.reduce((acc,current)=> acc + current.Amount,0);
    this.ReceiptAmount = paymentObj.reduce((acc, current) => acc + current.TotalDebit, 0);

    var noofUnpaid = studentCount - paymentcount;
    this.pieChartLabels = ['Payment %', 'Non-payment %']
    var PaymentPercent = (paymentcount * 100) / studentCount
    var NonPaymentPercent = (noofUnpaid * 100) / studentCount
    this.pieChartData = [PaymentPercent, NonPaymentPercent];
    this.loading = false;
  }
  ApplyVariables(formula) {
    var filledVar = formula;
    this.VariableObjList.forEach(m => {
      Object.keys(m).forEach(f => {
        if (filledVar.includes(f)) {
          if (isNaN(m[f]))
            filledVar = filledVar.replaceAll("[" + f + "]", "'" + m[f] + "'");
          else
            filledVar = filledVar.replaceAll("[" + f + "]", m[f]);
        }
      });
    })
    return filledVar;
  }
}