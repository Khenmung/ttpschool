import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { FileUploadService } from 'src/app/shared/upload.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  imagePath: string;
  message: string;
  imgURL: any;
  selectedFile: any;
  formdata: FormData;
  LoginUserDetail: any[] = [];
  CurrentRow: any = {};
  StorageFnPList = [];
  StandardFilterWithBatchId = '';
  loading = false;
  Applications = [];
  Organizations = [];
  OrganizationListName = "Organizations";
  OrganizationList = [];
  Country = [];
  States = [];
  City = [];
  Plans = [];
  CustomerPlans = [];
  dataSource: MatTableDataSource<IOrganization>;
  allMasterData = [];
  Permission = '';
  OrganizationData = {
    OrganizationId: 0,
    OrganizationName: '',
    LogoPath: '',
    Address: '',
    City: 0,
    State: 0,
    Country: 0,
    Contact: '',
    Active: 0,
    CreatedDate: new Date()
  };
  OrgId = 0;
  UserId = '';
  displayedColumns = [
    //"OrganizationId",
    //"OrganizationName",
    "Address",
    "Country",
    "State",
    "City",
    "Contact",
    "ValidTo",
    "CreatedDate",
    "Active",
    "Action"
  ];
  TopMasters = [];
  SelectedApplicationId = 0;
  searchForm: FormGroup;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,
    private fileUploadService: FileUploadService,
    private nav: Router,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //debugger;
    this.searchForm = this.fb.group({
      searchCustomerId: [0]
    });
    this.dataSource = new MatTableDataSource<IOrganization>([]);
    this.PageLoad();
  }
  get f() {
    return this.searchForm.controls;
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();
    if (this.LoginUserDetail.length != 0) {
      this.UserId = this.LoginUserDetail[0]["userId"];
      this.OrgId = this.LoginUserDetail[0]["orgId"];
    }
    else {
      this.UserId = localStorage.getItem("userId");
      this.OrgId = +localStorage.getItem("orgId");
    }

    var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.common.CONTROL.ORGANIZATION)
    if (perObj.length > 0) {
      this.Permission = perObj[0].permission;
    }
    if (this.Permission != 'deny') {
      this.Applications = this.tokenstorage.getPermittedApplications();
      var commonAppId = this.Applications.filter(f => f.appShortName == 'common')[0].applicationId;
      //var TopMasters=[];
      this.contentservice.GetParentZeroMasters().subscribe((data: any) => {
        this.TopMasters = [...data.value];
        //console.log("this.TopMasters",this.TopMasters)
        var countryparentId = this.TopMasters.filter(f => f.MasterDataName.toLowerCase() == 'country')[0].MasterDataId;
        this.contentservice.GetDropDownDataFromDB(countryparentId, this.OrgId, commonAppId)
          .subscribe((data: any) => {
            this.Country = [...data.value];
          })
      })
      this.GetOrganization();
        this.GetStorageFnP(0).subscribe((data: any) => {
          this.StorageFnPList = [...data.value];
          this.loading = false;
        })
      }
    }
  //}
  PopulateState(element) {
    var commonAppId = this.Applications.filter(f => f.appShortName == 'common')[0].applicationId;
    this.contentservice.GetDropDownDataFromDB(element.value, this.OrgId, commonAppId)
      .subscribe((data: any) => {
        this.States = [...data.value];
      })
  }
  PopulateCity(element) {
    var commonAppId = this.Applications.filter(f => f.appShortName == 'common')[0].applicationId;
    this.contentservice.GetDropDownDataFromDB(element.value, this.OrgId, commonAppId)
      .subscribe((data: any) => {
        this.City = [...data.value];
      })
  }
  updateActive(row, value) {

    row.Action = true;
    row.Active = value.checked ? 1 : 0;

  }
  login() {
    this.nav.navigate(['auth/login']);
  }

  UpdateOrSave(row) {

    if (row.OrganizationName == '') {
      this.contentservice.openSnackBar("Please enter organization name.", globalconstants.ActionText, globalconstants.RedBackground);
      this.loading = false;
      row.Action = false;
      return;
    }


    this.OrganizationData.OrganizationId = row.OrganizationId;
    this.OrganizationData.OrganizationName = row.OrganizationName;
    this.OrganizationData.Address = row.Address;
    this.OrganizationData.City = row.City;
    this.OrganizationData.State = row.State;
    this.OrganizationData.Active = row.Active;
    this.OrganizationData.Country = row.Country;
    this.OrganizationData.Contact = row.Contact;
    this.OrganizationData.LogoPath = row.LogoPath;
    //this.OrganizationData. = row.LogoPath;

    if (this.OrganizationData.OrganizationId == 0) {
      this.OrganizationData["CreatedDate"] = new Date();
      this.OrganizationData["CreatedBy"] = this.UserId;
      this.OrganizationData["UpdatedDate"] = new Date();
      delete this.OrganizationData["UpdatedBy"];
      this.insert(row);
    }
    else {
      delete this.OrganizationData["CreatedDate"];
      delete this.OrganizationData["CreatedBy"];
      this.OrganizationData["UpdatedDate"] = new Date();
      this.OrganizationData["UpdatedBy"] = this.UserId;
      this.update(row);
    }
  }
  insert(row) {

    debugger;
    this.dataservice.postPatch(this.OrganizationListName, this.OrganizationData, 0, 'post')
      .subscribe(
        (data: any) => {
          row.OrganizationId = data.OrganizationId;
          row.Action = false;
          this.loading = false;
          this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        }, error => {
          this.contentservice.openSnackBar("error occured. Please contact administrator.", globalconstants.ActionText, globalconstants.RedBackground);
        });
  }
  update(row) {

    this.dataservice.postPatch(this.OrganizationListName, this.OrganizationData, this.OrganizationData.OrganizationId, 'patch')
      .subscribe(
        (data: any) => {
          this.loading = false;
          row.Action = false;
          this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
        });
  }
  GetOrganization() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["OrganizationId", "OrganizationName"];
    list.PageName = "Organizations";
    list.filter = ["Active eq 1"];
    //debugger;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.Organizations = [...data.value];
        if (this.LoginUserDetail[0]['org'].toLowerCase() != 'ttp') {
          this.imgURL = this.LoginUserDetail[0].logoPath
          this.searchForm.patchValue({"searchCustomerId":this.LoginUserDetail[0]['orgId']});
          var cntrl =  this.searchForm.get("searchCustomerId");
          cntrl.disable();
          this.GetOrganizationDetail();
        }
        this.loading = false;
      });
  }
  GetOrganizationDetail() {
    debugger;
    this.OrganizationList = [];
    var filterstr = '';

    this.loading = true;

    var _searchCustomerId = this.searchForm.get("searchCustomerId").value;

    if (_searchCustomerId > 0)
      filterstr += "OrganizationId eq " + _searchCustomerId;

    let list: List = new List();
    list.fields = [
      "OrganizationId",
      "OrganizationName",
      "LogoPath",
      "Address",
      "City",
      "State",
      "Country",
      "Contact",
      "ValidFrom",
      "ValidTo",
      "Active",
      "CreatedDate"
    ];
    list.PageName = this.OrganizationListName;
    //list.lookupFields = [];
    list.filter = [filterstr];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //var customerapp;
        this.OrganizationList = [...data.value];
        this.dataSource = new MatTableDataSource<any>(this.OrganizationList);
        this.dataSource.paginator = this.paginator;

        // var _OrgLogoParentId = this.StorageFnPList.filter(f => f.FileName.toLowerCase() == "organization logo")[0].FileId;
        // this.GetStorageFnP(_OrgLogoParentId).subscribe((imgurldata: any) => {
        //   this.imgURL = globalconstants.apiUrl + "/uploads/" + this.LoginUserDetail[0]["org"] + "/organization logo/" + imgurldata.value[0].UpdatedFileFolderName
        //   this.loading = false;

        //   //this.loading = false;
        // })
      })
  }
  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    debugger;
    this.selectedFile = files[0];
    if (this.selectedFile.size > 60000) {
      this.loading = false;
      this.contentservice.openSnackBar("Image size should be less than 80kb", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }
  uploadFile() {
    debugger;
    let error: boolean = false;
    this.loading = true;
    if (this.selectedFile == undefined) {
      this.loading = false;
      this.contentservice.openSnackBar("Please select a file.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    var _parentId = this.StorageFnPList.filter(f => f.FileName.toLowerCase() == "organization logo")[0].FileId;
    this.formdata = new FormData();
    this.formdata.append("description", "organization logo");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "organization logo");
    this.formdata.append("parentId", _parentId);

    this.formdata.append("batchId", "0");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("pageId", "0");

    this.formdata.append("studentId", "0");
    this.formdata.append("studentClassId", "0");
    this.formdata.append("docTypeId", "0");

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }
  GetStorageFnP(pParentId) {

    var filterstr = 'Active eq 1 and ParentId eq ' + pParentId;
    let list: List = new List();
    list.fields = ["*"];
    list.PageName = "StorageFnPs";
    //list.lookupFields = [];
    list.filter = [filterstr];
    return this.dataservice.get(list);
  }
  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.loading = false;
      this.contentservice.openSnackBar("Files uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);

      //this.Edit = false;
    });
  }
  onBlur(element) {
    //debugger;
    element.Action = true;
    //element.Amount = element["AmountPerMonth"] * element.PaidMonths;
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
export interface IOrganization {
  OrganizationId: number;
  OrganizationName: '';
  LogoPath: '';
  Address: '';
  City: number;
  State: number;
  Country: number;
  Contact: '';
  ValidFrom: Date;
  ValidTo: Date;
  Active: number;
  ParentId: number;
  MainOrgId: number;
  CreatedDate: Date;
}

