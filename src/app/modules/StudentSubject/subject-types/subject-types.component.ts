import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-subject-types',
  templateUrl: './subject-types.component.html',
  styleUrls: ['./subject-types.component.scss']
})
export class SubjectTypesComponent implements OnInit {
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  StandardFilter = '';
  loading = false;
  Classes = [];
  Subjects = [];
  SubjectTypes : ISubjectType[];
  CurrentBatchId = 0;
  Batches = [];
  dataSource: MatTableDataSource<ISubjectType>;
  allMasterData = [];

  SubjectTypeId = 0;
  SubjectTypeData = {
    SubjectTypeId: 0,
    SubjectTypeName: '',
    OrgId: 0,
    BatchId: 0,
    SelectHowMany: 0,
    Active: 1
  };
  displayedColumns = [
    'SubjectTypeName',
    'SelectHowMany',
    'Active',
    'Action'
  ];

  constructor(
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private alert: AlertService,
    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    
  }

PageLoad() {
  
  debugger;   
  this.loading = true;
  this.LoginUserDetail = this.tokenstorage.getUserDetail();
  if (this.LoginUserDetail == null)
    this.nav.navigate(['/auth/login']);
  else {
    this.StandardFilter = globalconstants.getStandardFilter(this.LoginUserDetail);
    this.GetSubjectTypes();
    this.GetMasterData();      
  }
}
GetCurrentBatchIDnAssign() {
  let CurrentBatches = this.Batches.filter(b => b.MasterDataName == globalconstants.getCurrentBatch());
  if (CurrentBatches.length > 0) {
    this.CurrentBatchId = CurrentBatches[0].MasterDataId;   
  }
}
addnew(){
 
  let toadd={    
      SubjectTypeId: 0,
      SubjectTypeName: 'new subject type',
      OrgId: 0,
      BatchId: 0,
      SelectHowMany: 0,
      Active: 1
    };
    this.SubjectTypes.push(toadd);
    this.dataSource = new MatTableDataSource<ISubjectType>(this.SubjectTypes);
  
}
updateActive(row,value) {
  
  row.Active = value.checked?1:0;
  row.Action =true;
}
delete (element) {
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

  let checkFilterString = "SubjectTypeName eq '" + row.SubjectTypeName + "'" +
       this.StandardFilter;

  if (row.SubjectTypeId > 0)
    checkFilterString += " and SubjectTypeId ne " + row.SubjectTypeId;

  let list: List = new List();
  list.fields = ["SubjectTypeId"];
  list.PageName = "SubjectTypes";
  list.filter = [checkFilterString];

  this.dataservice.get(list)
    .subscribe((data: any) => {
      debugger;
      if (data.value.length > 0) {
        this.alert.error("Record already exists!", this.optionsNoAutoClose);
      }
      else {

        this.SubjectTypeData.Active = row.Active;
        this.SubjectTypeData.SubjectTypeName = row.SubjectTypeName;
        this.SubjectTypeData.SubjectTypeId = row.SubjectTypeId;
        this.SubjectTypeData.OrgId = this.LoginUserDetail[0]["orgId"];
        this.SubjectTypeData.BatchId = this.CurrentBatchId;
        //console.log('data', this.ClassSubjectData);
        if (this.SubjectTypeData.SubjectTypeId == 0) {
          this.SubjectTypeData["CreatedDate"] = new Date();
          this.SubjectTypeData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
          delete this.SubjectTypeData["UpdatedDate"];
          delete this.SubjectTypeData["UpdatedBy"];
          this.insert(row);
        }
        else {
          delete this.SubjectTypeData["CreatedDate"];
          delete this.SubjectTypeData["CreatedBy"];
          this.SubjectTypeData["UpdatedDate"] = new Date();
          this.SubjectTypeData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
          console.log('this',this.SubjectTypeData)
          this.update();
        }        
      }
    });
}

insert(row) {

  debugger;
  this.dataservice.postPatch('SubjectTypes', this.SubjectTypeData, 0, 'post')
    .subscribe(
      (data: any) => {
        row.SubjectTypeId = data.SubjectTypeId;
        this.alert.success("Data saved successfully.", this.optionAutoClose);
      });
}
update() {

  this.dataservice.postPatch('SubjectTypes', this.SubjectTypeData, this.SubjectTypeData.SubjectTypeId, 'patch')
    .subscribe(
      (data: any) => {
        this.alert.success("Data updated successfully.", this.optionAutoClose);
      });
}
GetSubjectTypes() {

  var orgIdSearchstr = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];

  let list: List = new List();

  list.fields = ["SubjectTypeId", "SubjectTypeName","SelectHowMany","Active"];
  list.PageName = "SubjectTypes";
  list.filter = [orgIdSearchstr];
  //list.orderBy = "ParentId";

  this.dataservice.get(list)
    .subscribe((data: any) => {
      this.SubjectTypes = [...data.value];
      this.dataSource = new MatTableDataSource<ISubjectType>(this.SubjectTypes);
      this.loading = false;
    })
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

      this.Batches = this.getDropDownData(globalconstants.MasterDefinitions[1].school[0].BATCH);
      this.shareddata.ChangeBatch(this.Batches);
      this.GetCurrentBatchIDnAssign();
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
export interface ISubjectType {
  SubjectTypeName: string;
  SelectHowMany: number;
  SubjectTypeId: number;
  OrgId:number;
  BatchId:number;
  Active:number;
}