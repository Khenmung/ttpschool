import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { FileUploadService } from 'src/app/shared/upload.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';

@Component({
  selector: 'app-employeedocuments',
  templateUrl: './employeedocuments.component.html',
  styleUrls: ['./employeedocuments.component.scss']
})
export class EmployeedocumentsComponent implements OnInit {
  loading = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SelectedApplicationId=0;
  Permission = '';
  FilterOrgnBatchId = '';
  FilterOrgIdOnly = '';
  formdata: FormData;
  selectedFile: any;
  EmployeeId: number = 0;
  StudentDocuments = [];
  Edit: boolean;
  SelectedBatchId = 0;
  allMasterData = [];
  DocumentTypes = [];
  Batches = [];
  LoginUserDetail = [];
  uploadForm: FormGroup;
  public files: NgxFileDropEntry[] = [];
  UploadDisplayedColumns = [
    //"FileId",
    "UpdatedFileFolderName",
    "DocType",
    "UploadDate",
    "Action"
  ]
  documentUploadSource: MatTableDataSource<IUploadDoc>;
  constructor(
    private contentservice:ContentService,
    private fileUploadService: FileUploadService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private tokenService: TokenStorageService,

  ) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      BatchId: [0],
      DocTypeId: [0, Validators.required]
    })
    debugger;
    this.EmployeeId = this.tokenService.getEmployeeId();

    if (this.EmployeeId == 0) {
      
      this.contentservice.openSnackBar("Please define employee first.",globalconstants.ActionText,globalconstants.RedBackground);
      //this.nav.navigate(['/employee/info']);
    }
    else {
      var perObj = globalconstants.getPermission(this.tokenService, globalconstants.Pages.emp.employee.DOCUMENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;
      if (this.Permission != 'deny') {
        //this.StudentId = this.tokenService.getStudentId();
        this.SelectedApplicationId = +this.tokenService.getSelectedAPPId();
        this.LoginUserDetail = this.tokenService.getUserDetail();
        this.SelectedBatchId = +this.tokenService.getSelectedBatchId();
        this.FilterOrgnBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenService);
        this.FilterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
        this.PageLoad();
      }
    }
  }
  PageLoad() {
    this.GetMasterData();

  }
  get f() {
    return this.uploadForm.controls;
  }
  uploadchange(files) {
    if (files.length === 0)
      return;
    this.selectedFile = files[0];
  }
  uploadFile() {

    if (this.selectedFile.length == 0) {
      this.contentservice.openSnackBar('Please select a file!', globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    if (this.uploadForm.get("DocTypeId").value == 0) {
      this.contentservice.openSnackBar('Please select document type!', globalconstants.ActionText,globalconstants.RedBackground);
      return;
    }
    debugger;
    let error: boolean = false;
    this.formdata = new FormData();
    this.formdata.append("batchId", this.SelectedBatchId.toString());
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "EmployeeDocuments/" + this.SelectedBatchId.toString());
    this.formdata.append("parentId", "-1");
    this.formdata.append("description", "");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("pageId", "0");
    this.formdata.append("studentId", "0");
    this.formdata.append("EmployeeId", this.EmployeeId.toString());
    this.formdata.append("docTypeId", this.uploadForm.get("DocTypeId").value);
    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.contentservice.openSnackBar("File uploaded successfully.", globalconstants.ActionText,globalconstants.BlueBackground);
      this.Edit = false;
    });
  }
  GetDocuments() {
    let list: List = new List();
    this.StudentDocuments = [];
    list.fields = [
      "FileId",
      "FileName",
      "UpdatedFileFolderName",
      "UploadDate",
      "DocTypeId"];
    list.PageName = "StorageFnPs";
    list.filter = [this.FilterOrgnBatchId + " and Active eq 1 and EmployeeId eq " + this.EmployeeId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          var _doctypeobj;
          var _doctypeName = "";

          data.value.forEach(doc => {
            _doctypeobj = this.DocumentTypes.filter(t => t.MasterDataId == doc.DocTypeId);
            if (_doctypeobj.length > 0) {
              _doctypeName = _doctypeobj[0].MasterDataName;
              this.StudentDocuments.push({
                FileId: doc.FileId,
                UpdatedFileFolderName: doc.UpdatedFileFolderName,
                UploadDate: doc.UploadDate,
                DocType: _doctypeName,
                path: globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] + "/EmployeeDocuments/" + doc.FileName
              });
            }
          })
          this.documentUploadSource = new MatTableDataSource<IUploadDoc>(this.StudentDocuments);
          ////console.log("studentdocuments",this.StudentDocuments)
        }
      });

  }
  pageview(path) {
    window.open(path, "_blank");
    return;
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"],this.SelectedApplicationId)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.DocumentTypes = this.getDropDownData(globalconstants.MasterDefinitions.employee.DOCUMENTTYPE);
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.GetDocuments();
      });

  }
  getDropDownData(dropdowntype) {
    let Id = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    })[0].MasterDataId;
    return this.allMasterData.filter((item, index) => {
      return item.ParentId == Id
    });
  }

}
export interface IUploadDoc {
  FileId: number;
  UpdatedFileFolderName: string;
  UploadDate: Date;
  DocType: string;
  Active: boolean
}
