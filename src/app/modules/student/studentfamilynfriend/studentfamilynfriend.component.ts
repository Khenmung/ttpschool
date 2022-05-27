import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { IStudent } from '../searchstudent/searchstudent.component';

@Component({
  selector: 'app-studentfamilynfriend',
  templateUrl: './studentfamilynfriend.component.html',
  styleUrls: ['./studentfamilynfriend.component.scss']
})
export class StudentfamilynfriendComponent implements OnInit {

  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  SelectedApplicationId = 0;
  StudentFamilyNFriendListName = 'StudentFamilyNFriends';
  Applications = [];
  loading = false;
  SelectedBatchId = 0;
  StudentFamilyNFriendList: IStudentFamilyNFriends[] = [];
  filteredOptions: Observable<IStudentFamilyNFriends[]>;
  dataSource: MatTableDataSource<IStudentFamilyNFriends>;
  allMasterData = [];
  StudentFamilyNFriends = [];
  FamilyRelationship = [];
  Genders = [];
  Permission = 'deny';
  Classes = [];
  Sections = [];
  StudentId = 0;
  Students = [];
  StudentClasses = [];
  FeeType = [];
  filteredStudents: Observable<IStudent[]>;
  StudentFamilyNFriendData = {
    StudentFamilyNFriendId: 0,
    StudentId: 0,
    SiblingId: 0,
    Name: '',
    ContactNo: '',
    RelationshipId: 0,
    Active: 0,
    Deleted: false,
    Remarks: '',
    OrgId: 0,
  };
  displayedColumns = [
    'StudentFamilyNFriendId',
    'SiblingId',
    'FeeType',
    'FeeTypeRemarks',
    'Name',
    'ContactNo',
    'RelationshipId',
    'Remarks',
    'Active',
    'Action'
  ];
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private nav: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchSiblingOrFriend: ['']
    });
    this.PageLoad();
  }

  PageLoad() {

    debugger;
    this.loading = true;

    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    this.StudentId = +this.tokenstorage.getStudentId();
    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.STUDENT.SIBLINGSNFRIENDS)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {
        this.loading = false;
        this.contentservice.openSnackBar(globalconstants.PermissionDeniedMessage, globalconstants.ActionText, globalconstants.RedBackground);
      }
      else {

        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.GetFeeTypes();
        this.GetMasterData();

      }
    }
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  // filterStates(name: string) {
  //   return name && this.states.filter(
  //     state => state.name.toLowerCase().includes(name?.toLowerCase())
  //   ) || this.states;
  // }
  AddNew() {

    var newdata = {
      StudentFamilyNFriendId: 0,
      StudentId: 0,
      SiblingId: 0,
      SiblingName: '',
      Name: '',
      ContactNo: '',
      RelationshipId: 0,
      Remarks: '',
      Active: 0,
      Action: false
    };
    this.StudentFamilyNFriendList = [];
    this.StudentFamilyNFriendList.push(newdata);
    this.dataSource = new MatTableDataSource<IStudentFamilyNFriends>(this.StudentFamilyNFriendList);
  }
  onBlur(element) {
    element.Action = true;
  }
  updateActive(row, value) {
    row.Action = true;
    row.Active = value.checked ? 1 : 0;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {

          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  UpdateOrSave(row) {

    debugger;
    this.loading = true;
    if (row.Name.length == 0 && row.SiblingName == '') {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter name or select name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (row.RelationshipId == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select relationship..", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var relationship = this.FamilyRelationship.filter(f => f.MasterDataId == row.RelationshipId)[0].MasterDataName;
    if (relationship.toLowerCase() == 'friend' && row.ContactNo.length == 0) {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter friend's contact no..", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let checkFilterString = "StudentFamilyNFriendId eq " + row.StudentFamilyNFriendId

    if (row.StudentFamilyNFriendId > 0)
      checkFilterString += " and StudentFamilyNFriendId ne " + row.StudentFamilyNFriendId;
    let list: List = new List();
    list.fields = ["StudentFamilyNFriendId"];
    list.PageName = this.StudentFamilyNFriendListName;
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        else {
          var studentIdObj = this.Students.filter(s => s.Name == row.SiblingName)
          var _studentId = 0;
          if (studentIdObj.length > 0)
            _studentId = studentIdObj[0].StudentId;

          this.StudentFamilyNFriendData.StudentFamilyNFriendId = row.StudentFamilyNFriendId;
          this.StudentFamilyNFriendData.Active = row.Active;
          this.StudentFamilyNFriendData.ContactNo = row.ContactNo;
          this.StudentFamilyNFriendData.StudentId = this.StudentId;
          this.StudentFamilyNFriendData.RelationshipId = row.RelationshipId;
          this.StudentFamilyNFriendData.SiblingId = _studentId;
          this.StudentFamilyNFriendData.Name = row.Name;
          this.StudentFamilyNFriendData.Remarks = row.Remarks;
          this.StudentFamilyNFriendData.OrgId = this.LoginUserDetail[0]["orgId"];


          if (this.StudentFamilyNFriendData.StudentFamilyNFriendId == 0) {
            this.StudentFamilyNFriendData["CreatedDate"] = new Date();
            this.StudentFamilyNFriendData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentFamilyNFriendData["UpdatedDate"] = new Date();
            delete this.StudentFamilyNFriendData["UpdatedBy"];

            this.insert(row);
          }
          else {
            delete this.StudentFamilyNFriendData["CreatedDate"];
            delete this.StudentFamilyNFriendData["CreatedBy"];
            this.StudentFamilyNFriendData["UpdatedDate"] = new Date();
            this.StudentFamilyNFriendData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
            console.log('this.StudentFamilyNFriendData', this.StudentFamilyNFriendData)
            this.update(row);
          }
        }
      });
  }
  loadingFalse() {
    this.loading = false;
  }
  insert(row) {

    //debugger;
    this.dataservice.postPatch(this.StudentFamilyNFriendListName, this.StudentFamilyNFriendData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.StudentFamilyNFriendId = data.StudentFamilyNFriendId;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse()
        });
  }
  update(row) {

    this.dataservice.postPatch(this.StudentFamilyNFriendListName, this.StudentFamilyNFriendData, this.StudentFamilyNFriendData.StudentFamilyNFriendId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          this.loadingFalse();
        });
  }
  GetStudentFamilyNFriends() {
    debugger;
    let filterStr = 'StudentId eq ' + this.StudentId;
    var siblingOrFriendId = this.searchForm.get("searchSiblingOrFriend").value;

    //var siblingOrFriendId = this.FamilyRelationship.filter(f => f.MasterDataName.toLowerCase() == 'friend')[0].MasterDataId;
    if (siblingOrFriendId > 0) {
      filterStr += ' and RelationshipId eq ' + siblingOrFriendId;
    }
    // else if (siblingOrFriend != '') {
    //   filterStr += ' and RelationshipId ne ' + siblingOrFriendId;
    // }

    this.loading = true;

    let list: List = new List();
    list.fields = [
      'StudentFamilyNFriendId',
      'StudentId',
      'SiblingId',
      'Name',
      'ContactNo',
      'RelationshipId',
      'Active',
      'Remarks'
    ];
    list.orderBy = "RelationshipId";
    list.PageName = this.StudentFamilyNFriendListName;
    list.filter = [filterStr];
    this.StudentFamilyNFriendList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.StudentFamilyNFriendList = data.value.map(m => {
            if (m.SiblingId > 0) {
              var obj = this.Students.filter(f => f.StudentId == m.SiblingId);
              if (obj.length > 0) {
                m.SiblingName = obj[0].Name;
                m.FeeType = obj[0].FeeType;
                m.FeeTypeRemarks = obj[0].Remarks;
              }
            }
            else
              m.SiblingName = ''
            return m;
          });
        }
        console.log("this.StudentFamilyNFriendList", this.StudentFamilyNFriendList)
        this.dataSource = new MatTableDataSource<IStudentFamilyNFriends>(this.StudentFamilyNFriendList);
        this.loadingFalse();
      });

  }
  GetStudentClasses() {
    debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);

    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId,Remarks,FeeTypeId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetStudents() {
    this.loading = true;
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'ContactNo',
      'FatherContactNo',
      'MotherContactNo'
    ];

    list.PageName = "Students";
    //list.lookupFields = ["StudentClasses($filter=BatchId eq " + this.SelectedBatchId + ";$select=StudentClassId,StudentId,ClassId,RollNo,SectionId)"]
    list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //this.Students = [...data.value];
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          data.value.forEach(student => {
            var _RollNo = '';
            var _name = '';
            var _className = '';
            var _section = '';
            var _feeType = '';
            var _remarks = '';
            var _studentClassId = 0;

            var studentclassobj = this.StudentClasses.filter(f => f.StudentId == student.StudentId);
            if (studentclassobj.length > 0) {
              _studentClassId = studentclassobj[0].StudentClassId;

              var feetypeobj = this.FeeType.filter(f => f.FeeTypeId == studentclassobj[0].FeeTypeId)
              if (feetypeobj.length > 0)
                _feeType = feetypeobj[0].FeeTypeName;
                
              _remarks = studentclassobj[0].Remarks;
              var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

              if (_classNameobj.length > 0)
                _className = _classNameobj[0].ClassName;
              var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;

              _RollNo = studentclassobj[0].RollNo;
              _name = student.FirstName + " " + student.LastName;
              var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
              this.Students.push({
                StudentClassId: _studentClassId,
                StudentId: student.StudentId,
                Name: _fullDescription,
                FatherName: student.FatherName,
                MotherName: student.MotherName,
                FeeType: _feeType,
                Remarks: _remarks
              });
            }
          })
        }
        this.loading = false;
      })
  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.loading = false;
      })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.school.SIBLINGSNFRIENDSRELATIONSHIP);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
          this.Classes = [...data.value];
          this.GetStudentClasses();
        });

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
export interface IStudentFamilyNFriends {
  StudentFamilyNFriendId: number;
  StudentId: number;
  SiblingId: number;
  Name: string;
  ContactNo: string;
  RelationshipId: number;
  Active: number;
  Remarks: string;
  Action: boolean;
}
export interface IApplication {
  ApplicationId: number;
  ApplicationName: string;
}

