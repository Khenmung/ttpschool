import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ContentService } from 'src/app/shared/content.service';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import { NaomitsuService } from '../../../../shared/databaseService';
import { globalconstants } from '../../../../shared/globalconstant';
import { List } from '../../../../shared/interface';
import { FileUploadService } from '../../../../shared/upload.service';

@Component({
  selector: 'upload-student-document',
  templateUrl: './uploadstudentdoc.component.html',
  styleUrls: ['./uploadstudentdoc.component.scss']
})
export class StudentDocumentComponent implements OnInit {
  loading = false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  FilterOrgnBatchId = '';
  FilterOrgIdOnly = '';
  formdata: FormData;
  selectedFile: any;
  StudentId: number = 0;
  StudentClassId: number = 0;
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
    private fileUploadService: FileUploadService,
    private alertMessage: AlertService,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private nav: Router,
    private tokenService: TokenStorageService,

  ) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      BatchId: [0],
      DocTypeId: [0, Validators.required]
    })
debugger;
    this.StudentClassId = this.tokenService.getStudentClassId();
    
    if (this.StudentClassId == 0) {
      this.nav.navigate(['/edu']);
    }
    else {
      this.StudentId = this.tokenService.getStudentId();
      this.LoginUserDetail = this.tokenService.getUserDetail();
      this.SelectedBatchId = +this.tokenService.getSelectedBatchId();
      this.FilterOrgnBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenService);
      this.FilterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.PageLoad();
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
      this.alertMessage.error('Please select a file!', this.optionsNoAutoClose);
      return;
    }
    if (this.uploadForm.get("DocTypeId").value == 0) {
      this.alertMessage.error('Please select document type!', this.optionsNoAutoClose);
      return;
    }
    debugger;
    let error: boolean = false;
    this.formdata = new FormData();
    this.formdata.append("batchId", this.SelectedBatchId.toString());
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "StudentDocuments/" + this.SelectedBatchId.toString());
    this.formdata.append("parentId", "-1");
    this.formdata.append("description", "");
    this.formdata.append("orgName", this.LoginUserDetail[0]["org"]);
    this.formdata.append("orgId", this.LoginUserDetail[0]["orgId"]);
    this.formdata.append("pageId", "0");

    if (this.StudentId != null && this.StudentId != 0)
      this.formdata.append("studentId", this.StudentId + "");
    this.formdata.append("studentClassId", this.StudentClassId.toString());
    this.formdata.append("docTypeId", this.uploadForm.get("DocTypeId").value);
    //console.log('this.uploadForm.get("DocTypeId").value")',this.uploadForm.get("DocTypeId").value);
    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
    this.fileUploadService.postFiles(this.formdata).subscribe(res => {
      this.alertMessage.success("File uploaded successfully.", options);
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
    list.filter = [this.FilterOrgnBatchId + " and Active eq 1 and StudentClassId eq " + this.StudentClassId];
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
                path: globalconstants.apiUrl + "/Uploads/" + this.LoginUserDetail[0]["org"] + "/StudentDocuments/" + this.SelectedBatchId.toString() + "/" + doc.FileName
              });
            }
          })
          this.documentUploadSource = new MatTableDataSource<IUploadDoc>(this.StudentDocuments);
          //console.log("studentdocuments",this.StudentDocuments)
        }
      });

  }
  pageview(path) {
    window.open(path, "_blank");
    return;
  }
  GetMasterData() {
    debugger;
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["(" + this.FilterOrgIdOnly + " or ParentId eq 0) and Active eq 1"];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.DocumentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.DOCUMENTTYPE);
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