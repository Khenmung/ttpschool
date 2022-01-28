import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { ClasssubjectComponent } from '../studentsubject/classsubject.component';

@Component({
  selector: 'app-studentsubjectdashboard',
  templateUrl: './studentsubjectdashboard.component.html',
  styleUrls: ['./studentsubjectdashboard.component.scss']
})
export class studentsubjectdashboardComponent implements OnInit {
  //@Input() StudentClassId:number;
  @ViewChild("table") mattable;
  StudentDetail:any ={};
  rowCount = 0;
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
  StudentDetailToDisplay = '';
  SelectedApplicationId=0;
  StudentClassId = 0;
  StandardFilter = '';
  loading = false;
  ClassSubjectList = [];
  Sections = [];
  Classes = [];
  Subjects = [];
  SelectedBatchId = 0;
  Batches = [];
  StudentClassSubjects = [];

  StudentSubjectList: IStudentSubject[] = [];
  dataSource: MatTableDataSource<IStudentSubject>;
  allMasterData = [];
  searchForm = this.fb.group({
    //searchBatchId: [0],
    searchClassId: [0],
    searchSubjectId: [0],
    searchSectionId: [0],
  });
  StoreForUpdate = [];
  StudentClassSubjectId = 0;
  StudentSubjectData = {
    StudentClassSubjectId: 0,
    SubjectId: 0,
    StudentClassId: 0,
    ClassSubjectId: 0,
    BatchId: 0,
    OrgId: 0,
    Active: 1
  };
  Permission = '';
  displayedColumns = [];

  constructor(
    private fb: FormBuilder,
    private dataservice: NaomitsuService,
    private contentservice: ContentService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {

    this.PageLoad();
  }
  PageLoad() {
    //debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.StudentClassId = 1;
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.STUDENTSUBJECT);
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }
      if (this.Permission != 'deny') {
        this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"],this.SelectedBatchId).subscribe((data: any) => {
          this.Classes = [...data.value];
        });

        this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
        this.shareddata.CurrentSubjects.subscribe(r => this.Subjects = r);
        if (this.Classes.length == 0 || this.Subjects.length == 0)
          this.GetMasterData();
        else {
          this.loading = false;
        }
      }
    }
  }


  GetStudentClassSubject() {
    //debugger;

    if (this.searchForm.get("searchClassId").value == 0) {
      this.alert.info("Please select class", this.optionAutoClose);
      return;
    }
    if (this.searchForm.get("searchSectionId").value == 0) {
      this.alert.info("Please select section", this.optionAutoClose);
      return;
    }
    // if (this.searchForm.get("searchSubjectId").value == 0) {
    //   this.alert.info("Please select subject", this.optionAutoClose);
    //   return;
    // }
    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"] +
      ' and ClassId eq ' + this.searchForm.get("searchClassId").value;


    filterStr += ' and SectionId eq ' + this.searchForm.get("searchSectionId").value;
    filterStr += ' and BatchId eq ' + this.SelectedBatchId;


    if (filterStr.length == 0) {
      this.alert.error("Please enter search criteria.", this.optionAutoClose);
      return;
    }
    this.loading = true;
    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'RollNo',
      'SectionId',
      'ClassId',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=FirstName,LastName)"];
    list.filter = [filterStr];
    this.dataservice.get(list)
      .subscribe((studentclassdb: any) => {
        //debugger;
        //  //console.log('data.value', data.value);
        this.StudentSubjectList = [];
        var _studentClassExisting = [];
        //if (studentclassdb.value.length > 0) {

        studentclassdb.value.forEach(item => {
          //item.StudentClassSubjects.forEach(clssubject => {
          _studentClassExisting.push({
            StudentClassId: item.StudentClassId,
            Active: item.Active,
            ClassId: item.ClassId,
            RollNo: item.RollNo,
            Student: item.RollNo + " - " + item.Student.FirstName + " " + item.Student.LastName,
            SectionId: item.SectionId
          })
        })
        this.GetExistingStudentClassSubjects(_studentClassExisting);
      });
  }
  GetExistingStudentClassSubjects(ParamstudentClassExisting) {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    orgIdSearchstr += ' and ClassId eq ' + this.searchForm.get("searchClassId").value;
    //orgIdSearchstr += ' and SectionId eq ' + this.searchForm.get("searchSectionId").value;

    let list: List = new List();

    list.fields = [
      "ClassId",
      "SubjectId",
      "ClassSubjectId",
      "Active"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["StudentClassSubjects($select=ClassSubjectId,SubjectId,StudentClassId,StudentClassSubjectId,Active)"];

    list.filter = ["Active eq 1 and " + orgIdSearchstr];
    //list.orderBy = "ParentId";
    debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {

        data.value.forEach(m => {
          if (m.StudentClassSubjects.length > 0) {
            m.StudentClassSubjects.forEach(n => {
              this.StudentClassSubjects.push({
                'StudentClassSubjectId': n.StudentClassSubjectId,
                'StudentClassId': n.StudentClassId,
                'ClassSubjectId': n.ClassSubjectId,
                'Active': n.Active,
                'ClassId': m.ClassId,
                'SubjectId': m.SubjectId
              })
            })
          }
          else {
            this.StudentClassSubjects.push({
              'StudentClassSubjectId': 0,
              'StudentClassId': 0,
              'ClassSubjectId': m.ClassSubjectId,
              'Active': 0,
              'ClassId': m.ClassId,
              'SubjectId': m.SubjectId
            })
          }
        })
        //console.log("this.StudentClassSubjects", this.StudentClassSubjects);

        //////////////
        //var _studentDetail: any = {};
        this.StoreForUpdate = [];
        if (ParamstudentClassExisting.length > 0) {
          //for all student in student class table for the selected class.
          this.displayedColumns = ["Student"];
          //console.log("ClassSubjectList",this.ClassSubjectList)
          ParamstudentClassExisting.forEach(cs => {
            //var _filteredStudentClassSubjectlist = this.StudentClassSubjects.filter(c => c.StudentClassId == cs.StudentClassId);
            this.StudentDetail = {
              // StudentClassSubjectId: cs.StudentClassSubjectId,
              StudentClassId: cs.StudentClassId,
              Student: cs.Student,
              RollNo: cs.RollNo,
              Action:false
            }

            var takensubjects = this.StudentClassSubjects.filter(f => f.StudentClassId == cs.StudentClassId);
            var specificclasssubjects = this.ClassSubjectList.filter(f=>f.ClassId == this.searchForm.get("searchClassId").value)
            specificclasssubjects.forEach(subjectTypes => {

              var clssubject = takensubjects.filter(c => c.ClassSubjectId == subjectTypes.ClassSubjectId)
              if (clssubject.length > 0) {
                clssubject[0].SubjectId =subjectTypes.SubjectId;
                clssubject[0].SubjectTypeId = subjectTypes.SubjectTypeId;
                clssubject[0].SubjectType = subjectTypes.SubjectTypeName;
                clssubject[0].SelectHowMany = subjectTypes.SelectHowMany;
                this.formatData(clssubject[0]);
              }
              else {
                //debugger;
                var newsubjects = JSON.parse(JSON.stringify(this.StudentClassSubjects[0]));
                newsubjects["StudentClassSubjectId"] = 0;
                newsubjects["ClassSubjectId"] = subjectTypes.ClassSubjectId;                
                newsubjects["StudentClassId"] = cs.StudentClassId;
                newsubjects["SubjectId"] = subjectTypes.SubjectId;
                newsubjects["SubjectTypeId"] = subjectTypes.SubjectTypeId;
                newsubjects["SubjectType"] = subjectTypes.SubjectTypeName;
                newsubjects["SelectHowMany"] = subjectTypes.SelectHowMany;
                newsubjects.Active=0;
                this.formatData(newsubjects);
              }

            })
            // takensubjects.forEach(clssubject => {

            //   var subjectTypes = this.ClassSubjectList.filter(c => c.ClassSubjectId == clssubject.ClassSubjectId);
            //   if (subjectTypes.length > 0) {
            //     clssubject.SubjectTypeId = subjectTypes[0].SubjectTypeId;
            //     clssubject.SubjectType = subjectTypes[0].SubjectTypeName;
            //     clssubject.SelectHowMany = subjectTypes[0].SelectHowMany;
            //     this.formatData(clssubject, _studentDetail);
            //   }
            //   else {
            //     clssubject.StudentClassSubjectId = 0;
            //     clssubject.StudentClassId = cs.StudentClassId;
            //     clssubject.SubjectTypeId = subjectTypes[0].SubjectTypeId;
            //     clssubject.SubjectType = subjectTypes[0].SubjectTypeName;
            //     clssubject.SelectHowMany = subjectTypes[0].SelectHowMany;
            //     this.formatData(clssubject, _studentDetail);
            //   }
            // });


            this.StudentSubjectList.push(this.StudentDetail);
          })

          this.displayedColumns.push("Action");
        }
        else {
          debugger;
          var cls = this.Classes.filter(c => c.ClassId == this.searchForm.get("searchClassId").value)
          var _clsName = '';
          if (cls.length > 0)
            _clsName = cls[0].ClassName;

          this.alert.info("No student found for the selected class " + _clsName, this.optionAutoClose);
          this.loading = false;
        }
        //console.log('this.StudentSubjectList', this.StudentSubjectList)
        if (this.StudentSubjectList.length > 0) {

          this.dataSource = new MatTableDataSource<IStudentSubject>(this.StudentSubjectList);
        }
        else {
          this.dataSource = new MatTableDataSource<IStudentSubject>([]);
        }
        this.StudentDetailToDisplay = `${this.StudentSubjectList[0].Student} Class - ${this.StudentSubjectList[0].ClassName}, RollNo - ${this.StudentSubjectList[0].RollNo}`;
        this.loading = false;


        /////////////
      })
  }
  formatData(clssubject) {
    var _subjectName = '';
    var topush = {};
    var subjectTypes = [];

    topush = this.StudentDetail;

    _subjectName = this.Subjects.filter(s => s.MasterDataId == clssubject.SubjectId)[0].MasterDataName;
    if (this.displayedColumns.indexOf(_subjectName) == -1)
      this.displayedColumns.push(_subjectName);

    topush = {
      "StudentClassSubjectId": clssubject.StudentClassSubjectId,
      "StudentClassId": this.StudentDetail["StudentClassId"],
      "Student": this.StudentDetail["Student"],
      "RollNo": this.StudentDetail["RollNo"],
      "SubjectTypeId": clssubject.SubjectTypeId,
      "SubjectType": clssubject.SubjectTypeName,
      "SelectHowMany": clssubject.SelectHowMany,
      "SubjectId": clssubject.SubjectId,
      "Subject": _subjectName,
      "ClassSubjectId": clssubject.ClassSubjectId,
      "ClassId": clssubject.ClassId,
      "ClassName": this.Classes.filter(c => c.ClassId == clssubject.ClassId)[0].ClassName,
      "Action": false,
      "Active": clssubject.Active,
    }
    this.StudentDetail[_subjectName] = clssubject.Active;
    topush[_subjectName] = clssubject.Active;
    this.StoreForUpdate.push(topush)
    ////console.log('topush',topush)
  }
  GetClassSubjects() {

    var orgIdSearchstr = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    //orgIdSearchstr += ' and ClassId eq ' + this.searchForm.get("searchClassId").value;

    let list: List = new List();

    list.fields = [
      "ClassSubjectId",
      "ClassId",
      "SubjectId",
      "SubjectTypeId"
    ];
    list.PageName = "ClassSubjects";
    list.lookupFields = ["SubjectType($select=SubjectTypeName,SelectHowMany)"];

    list.filter = ["Active eq 1 and " + orgIdSearchstr];
    //list.orderBy = "ParentId";
    this.ClassSubjectList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {

        data.value.forEach(fromdb => {
          this.ClassSubjectList.push({
            'ClassSubjectId': fromdb.ClassSubjectId,
            'ClassId': fromdb.ClassId,
            'SubjectId': fromdb.SubjectId,
            'SubjectTypeId': fromdb.SubjectTypeId,
            'SubjectTypeName': fromdb.SubjectType.SubjectTypeName,
            'SelectHowMany': fromdb.SubjectType.SelectHowMany
          })
        })

      });

  }
  SelectAll(event) {
    //var event ={checked:true}
    this.StudentSubjectList.forEach(element => {
      this.SelectAllInRow(element, event, "Action");

    })
  }
  UpdateAll() {
    this.StudentSubjectList.forEach(element => {
      this.SaveRow(element);
    })
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,
      searchSubjectId: 0,
      searchSubjectTypeId: 0,
      //searchBatchId: this.SelectedBatchId
    });
  }
  SelectAllInRow(element, event, colName) {
    debugger;
    var columnexist = [];
    if (colName == 'Action') {
      for (var prop in element) {
        columnexist = this.displayedColumns.filter(f => f == prop)
        if (columnexist.length > 0 && event.checked && prop != 'Student' && prop != 'Action') {
          element[prop] = 1;
        }
        else if (columnexist.length > 0 && !event.checked && prop != 'Student' && prop != 'Action') {
          element[prop] = 0;
        }
        element.Action=true;
      }
    }
    else {
      var currentrow = this.StoreForUpdate.filter(f => f.Subject == colName);
      if (event.checked) {
        currentrow[colName] = 1;
        element[colName] = 1;
      }
      else {
        currentrow[colName] = 0;
        element[colName] = 0;
      }
    }
  }
  SaveRow(element) {
    ////console.log("element", element)
    //debugger;
    this.loading = true;
    this.rowCount = 0;
    //var columnexist;
    for (var prop in element) {
      //columnexist = this.displayedColumns.filter(f => f == prop)

      var row: any = this.StoreForUpdate.filter(s => s.Subject == prop && s.StudentClassId == element.StudentClassId);

      if (row.length > 0 && prop != 'Student' && prop != 'Action') {
        var data = {
          Active: element[prop],
          StudentClassSubjectId: row[0].StudentClassSubjectId,
          StudentClassId: row[0].StudentClassId,
          ClassSubjectId: row[0].ClassSubjectId,
          SubjectId: row[0].SubjectId
        }
        ////console.log('data to update',data)
        if (row.length > 0)
          this.UpdateOrSave(data);
      }
    }
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
    debugger;
    let checkFilterString = "ClassSubjectId eq " + row.ClassSubjectId +
      " and StudentClassId eq " + row.StudentClassId

    if (row.StudentClassSubjectId > 0)
      checkFilterString += " and StudentClassSubjectId ne " + row.StudentClassSubjectId;
    checkFilterString += " and " + this.StandardFilter
    let list: List = new List();
    list.fields = ["ClassSubjectId"];
    list.PageName = "StudentClassSubjects";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.alert.error("Record already exists!", this.optionAutoClose);
          return;
        }
        else {
          let subjectSelectedCount = this.StudentSubjectList.filter(s => s.SubjectTypeId == row.SubjectTypeId && s.Active == 1);
          if (row.SelectHowMany > 0 && row.SelectHowMany < subjectSelectedCount.length) {
            var str = `Only ${row.SelectHowMany} Subjects can be selected for ${row.SubjectType}`;
            this.alert.warn(str, this.optionsNoAutoClose);
            return;
          }
          this.StudentSubjectData.Active = row.Active;
          this.StudentSubjectData.StudentClassSubjectId = row.StudentClassSubjectId;
          this.StudentSubjectData.OrgId = this.LoginUserDetail[0]["orgId"];
          this.StudentSubjectData.BatchId = this.SelectedBatchId;
          this.StudentSubjectData.StudentClassId = row.StudentClassId;
          this.StudentSubjectData.SubjectId = row.SubjectId;
          this.StudentSubjectData.ClassSubjectId = row.ClassSubjectId;
          ////console.log('data', this.StudentSubjectData);
          if (this.StudentSubjectData.StudentClassSubjectId == 0) {
            this.StudentSubjectData["CreatedDate"] = new Date();
            this.StudentSubjectData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            delete this.StudentSubjectData["UpdatedDate"];
            delete this.StudentSubjectData["UpdatedBy"];
            ////console.log('insert', this.StudentSubjectData);
            this.insert(row);
          }
          else {
            delete this.StudentSubjectData["CreatedDate"];
            delete this.StudentSubjectData["CreatedBy"];
            this.StudentSubjectData["UpdatedDate"] = new Date();
            this.StudentSubjectData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            this.update(row);
          }
          row.Action = false;

        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.edited = false;
          this.rowCount++;
          row.StudentClassSubjectId = data.StudentClassSubjectId;
          if (this.rowCount == Object.keys(row).length - 3) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
        });
  }
  update(row) {

    this.dataservice.postPatch('StudentClassSubjects', this.StudentSubjectData, this.StudentSubjectData.StudentClassSubjectId, 'patch')
      .subscribe(
        (data: any) => {
          this.edited = false;
          this.rowCount++;
          if (this.rowCount == Object.keys(row).length - 3) {
            this.loading = false;
            this.alert.success("Data saved successfully", this.optionAutoClose);
          }
          //this.alert.success("Data updated successfully.", this.optionAutoClose);
        });
  }
  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }


  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.Subjects = this.getDropDownData(globalconstants.MasterDefinitions.school.SUBJECT);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.ChangeSubjects(this.Subjects);
        this.GetClassSubjects();
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
export interface IStudentSubject {
  StudentClassSubjectId: number;
  StudentClassId: number;
  ClassId: number;
  ClassName: string;
  RollNo: string;
  Student: string;
  ClassSubjectId: number;
  SubjectTypeId: number;
  SubjectType: string;
  SelectHowMany: number;
  //SubjectId:number;
  Subject: string;
  Active: number;
  Action: boolean;
}

