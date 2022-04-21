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
  StudentId = 0;
  StudentFamilyNFriendData = {
    StudentFamilyNFriendId: 0,
    StudentId: 0,
    Name: '',
    ContactNo: '',
    RelationshipId: 0,
    Active: 0,
    Deleted: false,
    Remarks: '',
    OrgId:0,
  };
  displayedColumns = [
    'StudentFamilyNFriendId',
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
      searchClassName: [0]
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
      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.emp.employee.FAMILY)
      if (perObj.length > 0) {
        this.Permission = perObj[0].permission;
      }

      if (this.Permission == 'deny') {

      }
      else {
        this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
        this.GetMasterData();
      }
    }
  }

  AddNew() {

    var newdata = {
      StudentFamilyNFriendId: 0,
      StudentId: 0,
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

    //debugger;
    this.loading = true;
    if(row.Name.length==0)
    {
      this.loading = false;
      this.contentservice.openSnackBar("Please enter name.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if(row.RelationshipId==0)
    {
      this.loading = false;
      this.contentservice.openSnackBar("Please select relationship..", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var relationship = this.FamilyRelationship.filter(f=>f.MasterDataId == row.RelationshipId)[0].MasterDataName;
    if(relationship.toLowerCase()=='friend' && row.ContactNo.length==0)
    {
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

          this.StudentFamilyNFriendData.StudentFamilyNFriendId = row.StudentFamilyNFriendId;
          this.StudentFamilyNFriendData.Active = row.Active;
          this.StudentFamilyNFriendData.ContactNo = row.ContactNo;
          this.StudentFamilyNFriendData.StudentId = this.StudentId;
          this.StudentFamilyNFriendData.RelationshipId = row.RelationshipId;
          this.StudentFamilyNFriendData.Name = row.Name;
          this.StudentFamilyNFriendData.Remarks = row.Remarks;
          this.StudentFamilyNFriendData.OrgId = this.LoginUserDetail[0]["orgId"];
          

          if (this.StudentFamilyNFriendData.StudentFamilyNFriendId == 0) {
            this.StudentFamilyNFriendData["CreatedDate"] = new Date();
            this.StudentFamilyNFriendData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
            this.StudentFamilyNFriendData["UpdatedDate"] = new Date();
            delete this.StudentFamilyNFriendData["UpdatedBy"];
            //console.log('this.StudentFamilyNFriendData',this.StudentFamilyNFriendData)
            this.insert(row);
          }
          else {
            delete this.StudentFamilyNFriendData["CreatedDate"];
            delete this.StudentFamilyNFriendData["CreatedBy"];
            this.StudentFamilyNFriendData["UpdatedDate"] = new Date();
            this.StudentFamilyNFriendData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
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

    this.loading = true;
    let filterStr = 'StudentId eq ' + this.StudentId;
    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.StudentFamilyNFriendListName;
    list.filter = [filterStr];
    this.StudentFamilyNFriendList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.StudentFamilyNFriendList = [...data.value];
        }
        this.dataSource = new MatTableDataSource<IStudentFamilyNFriends>(this.StudentFamilyNFriendList);
        this.loadingFalse();
      });

  }

  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.FamilyRelationship = this.getDropDownData(globalconstants.MasterDefinitions.school.SIBLINGSNFRIENDSRELATIONSHIP);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.employee.GENDER);
        if (this.StudentId > 0)
          this.GetStudentFamilyNFriends();
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

