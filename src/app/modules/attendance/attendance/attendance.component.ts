import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {

  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  edited = false;
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SaveAll = false;
  StudentDetailToDisplay = '';
  StudentClassId = 0;
  StandardFilter = '';
  loading = false;
  Sections = [];
  Classes = [];
  Subjects = [];
  CurrentBatchId = 0;
  Batches = [];
  AttendanceStatus = [];
  StudentAttendanceList: IStudentAttendance[] = [];
  StudentClassList = [];
  dataSource: MatTableDataSource<IStudentAttendance>;
  allMasterData = [];
  searchForm = this.fb.group({
    searchClassId: [0],
    searchSectionId: [0],
    searchAttendanceDate:[new Date()]
  });
  StudentClassSubjectId = 0;
  StudentAttendanceData = {
    AttendanceId: 0,
    StudentClassId: 0,
    AttendanceStatus: 0,
    AttendanceDate: Date,
    Remarks: '',
    BatchId: 0,
    OrgId: 0
  };
  displayedColumns = [
    'StudentClassRollNoSection',
    'AttendanceDate',
    'AttendanceStatus',
    'Remarks',
    'Action'
  ];

  constructor(
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
    private datepipe:DatePipe
  ) { }

  ngOnInit(): void {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.StudentClassId = 1;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.GetMasterData();

    }

  }
  PageLoad() {

  }
  checkall(value) {
    this.StudentAttendanceList.forEach(record => {
      if (value.checked)
      {
        record.AttendanceStatus = 1;
       }        
      else
        record.AttendanceStatus = 0;
      record.Action = !record.Action;
    })
  }
  saveall() {
    this.SaveAll = true;
    this.StudentAttendanceList.forEach((record, indx) => {
      if (record.Action == true) {
        this.UpdateOrSave(record);
      }
      if (indx == this.StudentAttendanceList.length - 1) {
        this.alert.success("All attendance saved sucessfully.", this.optionAutoClose);
        this.SaveAll = false;
      }
    })
  }
  GetCurrentBatchIDnAssign() {
    let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    if (CurrentBatches.length > 0) {
      this.CurrentBatchId = CurrentBatches[0].MasterDataId;
      this.searchForm.patchValue({
        "searchBatchId": this.CurrentBatchId
      })
    }
  }

  GetStudentAttendance() {

    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"]
    //' and StudentClassId eq ' + this.StudentClassId;
    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.error("Please select class.", this.optionAutoClose);
      return;
    }
    else {
      filterStr += ' and ClassId eq ' + this.searchForm.get("searchClassId").value;
    }
    if (this.searchForm.get("searchSectionId").value == 0) {
      this.alert.error("Please enter section.", this.optionAutoClose);
      return;
    }
    else {
      filterStr += " and Section eq " + this.searchForm.get("searchSectionId").value;
    }

    let batchIds = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
    let batchId = 0;
    if (batchIds.length > 0) {
      batchId = batchIds[0].MasterDataId;
      filterStr += ' and Batch eq ' + batchId;
    }

    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }
    this.StudentAttendanceList = [];
    this.dataSource =new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'Student/Name',
      'RollNo',
      'ClassId',
      'Section',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((studentclass: any) => {
        debugger;

        var _class = '';
        var _section = '';
        var _ClassRollNoSection = '';
        //  console.log('data.value', data.value);
        this.StudentClassList = studentclass.value.map(item => {
          _class = this.Classes.filter(c => c.MasterDataId == item.ClassId)[0].MasterDataName;
          _section = this.Sections.filter(c => c.MasterDataId == item.Section)[0].MasterDataName;
          _ClassRollNoSection = _class + ' - ' + item.RollNo + ' - ' + _section;
          return {
            StudentClassId: item.StudentClassId,
            Active: item.Active,
            ClassId: item.ClassId,
            RollNo: item.RollNo,
            Student: item.Student.Name,
            StudentClassRollNoSection: item.Student.Name + " - " + _ClassRollNoSection
          }
        })
        var date =this.searchForm.get("searchAttendanceDate").value;
        var fromDate = new Date(date);
        if(fromDate>new Date())
        {
          this.alert.error("Attendance date cannot be greater than today's date",this.optionAutoClose);
          return;
        }
        var toDate = new Date(date).setDate(fromDate.getDate()+1);
        //console.log('date',this.datepipe.transform(toDate,'dd/MM/yyyy'));
        let list: List = new List();
        list.fields = [
          "AttendanceId",
          "StudentClassId",
          "AttendanceDate",
          "AttendanceStatus",
          "Remarks",
          "OrgId",
          "BatchId"
        ];
        list.PageName = "Attendances";
        list.lookupFields = ["StudentClass"];
        list.filter = ["OrgId eq " + this.LoginUserDetail[0]["orgId"] + 
        " and AttendanceDate gt datetime'" + this.datepipe.transform(fromDate,'yyyy-MM-dd') + "T00:00:00.000Z'"+
        " and AttendanceDate lt datetime'" + this.datepipe.transform(toDate,'yyyy-MM-dd') + "T00:00:00.000Z'"];
       
        this.dataservice.get(list)
          .subscribe((attendance: any) => {

            this.StudentClassList.forEach(sc => {
              let existing = attendance.value.filter(db => db.StudentClassId == sc.StudentClassId);
              if (existing.length > 0) {
                this.StudentAttendanceList.push({
                  AttendanceId: existing[0].AttendanceId,
                  StudentClassId: existing[0].StudentClassId,
                  AttendanceStatus: existing[0].AttendanceStatus,
                  AttendanceDate: existing[0].AttendanceDate,
                  Remarks: existing[0].Remarks,
                  StudentClassRollNoSection: sc.StudentClassRollNoSection,
                  Action: false
                });
              }
              else
                this.StudentAttendanceList.push({
                  AttendanceId: 0,
                  StudentClassId: sc.StudentClassId,
                  AttendanceStatus: 0,
                  AttendanceDate: new Date(),
                  Remarks: '',
                  StudentClassRollNoSection: sc.StudentClassRollNoSection,
                  Action: true
                });
            })
            this.dataSource = new MatTableDataSource<IStudentAttendance>(this.StudentAttendanceList);
            this.loading = false;
          });
        //this.changeDetectorRefs.detectChanges();
      });
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSection: ''
    });
  }
  UpdateActive(element, event) {
    element.Action = true;
    debugger;
    element.AttendanceStatus = event.checked == true ? 1 : 0;
  }
  onChangeEvent(row, value) {
    debugger;
    if (row.Remarks.length > 0)
      row.Action = true;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.alert.success("Data deleted successfully.", this.optionAutoClose);

        });
  }
  UpdateOrSave(row) {

    let checkFilterString = "AttendanceId eq " + row.AttendanceId +
      " and StudentClassId eq " + row.StudentClassId +
      " and AttendanceDate eq datetime'" + new Date(row.AttendanceDate).toISOString() + "'" +
      this.StandardFilter;

    if (row.AttendanceId > 0)
      checkFilterString += " and AttendanceId ne " + row.AttendanceId;

    let list: List = new List();
    list.fields = ["AttendanceId"];
    list.PageName = "Attendances";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionsNoAutoClose);
        }
        else {
          this.StudentAttendanceData.StudentClassId = row.StudentClassId;
          this.StudentAttendanceData.AttendanceDate = row.AttendanceDate;
          this.StudentAttendanceData.AttendanceId = row.AttendanceId;
          this.StudentAttendanceData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentAttendanceData.BatchId = this.CurrentBatchId;
          this.StudentAttendanceData.AttendanceStatus = row.AttendanceStatus;
          this.StudentAttendanceData.Remarks = row.Remarks;
          //console.log('data', this.StudentSubjectData);
          if (this.StudentAttendanceData.AttendanceId == 0) {
            this.StudentAttendanceData["CreatedDate"] = new Date();
            this.StudentAttendanceData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentAttendanceData["UpdatedDate"];
            delete this.StudentAttendanceData["UpdatedBy"];
            //console.log('insert', this.StudentAttendanceData);
            this.insert(row);
          }
          else {
            delete this.StudentAttendanceData["CreatedDate"];
            delete this.StudentAttendanceData["CreatedBy"];
            this.StudentAttendanceData["UpdatedDate"] = new Date();
            this.StudentAttendanceData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update();
          }
          row.Action = false;
          // this.OutClassSubjectId.emit(0);
          // this.CallParentPageFunction.emit();
        }
      });
  }

  insert(row) {

    debugger;
    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          row.AttendanceId = data.AttendanceId;
          if (this.SaveAll == false)
            this.alert.success("Data saved successfully.", this.optionAutoClose);
        });
  }
  update() {
    this.dataservice.postPatch('Attendances', this.StudentAttendanceData, this.StudentAttendanceData.AttendanceId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;
          if (this.SaveAll == false)
            this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
  GetMasterData() {

    var orgIdSearchstr = 'and (ParentId eq 0  or OrgId eq ' + this.LoginUserDetail[0]["orgId"] + ')';

    let list: List = new List();

    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1 " + orgIdSearchstr];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SECTION);
        this.Classes = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].CLASS);
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].SUBJECT);
        this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
        this.AttendanceStatus = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].ATTENDANCESTATUS);

        this.shareddata.ChangeClasses(this.Classes);
        this.shareddata.ChangeSubjects(this.Subjects);
        this.shareddata.ChangeBatch(this.Batches);
        this.GetCurrentBatchIDnAssign();
        //this.GetStudentAttendance();
        this.loading = false;
      });
  }
  getDropDownData(dropdowntype) {
    let Id = 0;
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    })
    if (Ids.length > 0) {
      Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      })
    }
    else
      return [];

  }

}
export interface IStudentAttendance {
  AttendanceId: number;
  StudentClassId: number;
  AttendanceStatus: number;
  AttendanceDate: Date;
  StudentClassRollNoSection: string;
  Remarks: string;
  Action: boolean
}

