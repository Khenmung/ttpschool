import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
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
  loading=false;
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  FilterOrgnBatchId='';
  FilterOrgIdOnly ='';
  formdata: FormData;
  selectedFile: any;
  Id: number = 0;
  StudentClassId: number = 0;
  Edit: boolean;
  SelectedBatchId=0;
  allMasterData = [];
  DocumentTypes = [];
  Batches =[];
  LoginUserDetail=[];
  uploadForm: FormGroup;
  public files: NgxFileDropEntry[] = [];
  UploadDisplayedColumns = [
    "FileId",
    "UpdatedFileFolderName",
    "DocType",
    "UploadDate",
    "Action"
  ]
  documentUploadSource: MatTableDataSource<IUploadDoc>;
  constructor(private fileUploadService: FileUploadService,
    private alertMessage: AlertService,
    private routeUrl: ActivatedRoute,
    private shareddata: SharedataService,
    private dataservice: NaomitsuService,
    private fb: FormBuilder,
    private tokenService:TokenStorageService
    ) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      BatchId:[0],
      DocTypeId: [0,Validators.required]
    })
    this.routeUrl.paramMap.subscribe(param => {
      this.Id = +param.get('id')
    })
    this.routeUrl.queryParamMap.subscribe(param => {
      this.StudentClassId = +param.get('scid');
      
    })
    this.LoginUserDetail = this.tokenService.getUserDetail();
    //this.shareddata.CurrentSelectedBatchId.subscribe(s=>this.SelectedBatchId=s);
    this.SelectedBatchId = +this.tokenService.getSelectedBatchId();
    this.FilterOrgnBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenService);
    this.FilterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
    //this.GetMasterData();
  }
  PageLoad() {
    this.GetMasterData();

  }
  get f()
  {
    return this.uploadForm.controls;
  }
  uploadchange(files) {
    if (files.length === 0)
      return;
    this.selectedFile = files[0];
  }
  uploadFile() {

    if(this.selectedFile.length==0)
    {
      this.alertMessage.error('Please select a file!',this.optionsNoAutoClose);
      return;
    }
    if(this.uploadForm.get("DocTypeId").value==0)
    {
      this.alertMessage.error('Please select document type!',this.optionsNoAutoClose);
      return;
    }

      let error: boolean = false;
    this.formdata = new FormData();
    this.formdata.append("BatchId", this.SelectedBatchId.toString());
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "StudentDocument");
    this.formdata.append("parentId", "-1");

    if (this.Id != null || this.Id != 0)
      this.formdata.append("StudentId", "-1");
    this.formdata.append("StudentClassId", this.StudentClassId.toString());
    this.formdata.append("DocTypeId", this.uploadForm.get("DocTypeId").value);

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    this.uploadImage();
  }

  uploadImage() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
    this.fileUploadService.postFile(this.formdata).subscribe(res => {
      this.alertMessage.success("File uploaded successfully.", options);
      this.Edit = false;
    });
  }
  GetDocuments() {
    let list: List = new List();
   
    list.fields = [
      "FileId",
      "FileName",
      "UpdatedFileFolderName",
      "UploadDate",
      "DocTypeId"];
    list.PageName = "FilesNPhotoes";
    list.filter = [this.FilterOrgnBatchId + " and Active eq 1 and StudentClassId eq " + this.StudentClassId];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.allMasterData = data.value.map(doc => {          
            return {
              FileId: doc.FileId,
              UpdatedFileFolderName: doc.UpdatedFileFolderName,
              UploadDate: doc.UploadDate,
              DocType: this.DocumentTypes.filter(t => t.MasterDataId == doc.DocTypeId)[0].MasterDataName,
              path: globalconstants.apiUrl + "/Image/StudentDocument/" + doc.FileName
            }
          })
          this.documentUploadSource = new MatTableDataSource<IUploadDoc>(this.allMasterData);
        }
      });

  }
  pageview(path){
    window.open(path, "_blank");
    return;
  }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterItems";
    list.filter = ["(" + this.FilterOrgIdOnly + " or ParentId eq 0) and Active eq 1"];
 
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.allMasterData = [...data.value];
        this.DocumentTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.DOCUMENTTYPE);
        //this.Batches = this.getDropDownData(globalconstants.MasterDefinitions.school.BATCH);
        this.shareddata.CurrentBatch.subscribe(c=>(this.Batches=c));
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