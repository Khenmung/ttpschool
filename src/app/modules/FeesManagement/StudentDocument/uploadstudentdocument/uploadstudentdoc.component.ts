import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { FileUploadService } from 'src/app/shared/upload.service';

@Component({
  selector: 'upload-student-document',
  templateUrl: './uploadstudentdoc.component.html',
  styleUrls: ['./uploadstudentdoc.component.scss']
})
export class StudentDocumentComponent implements OnInit {
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionsAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  formdata: FormData;
  selectedFile: any;
  Id: number = 0;
  StudentClassId: number = 0;
  Edit: boolean;
  allMasterData = [];
  DocumentTypes = [];
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
    private route: Router,
    private dataservice: NaomitsuService,
    private fb: FormBuilder
    ) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      DocTypeId: [0,Validators.required]
    })
    this.routeUrl.paramMap.subscribe(param => {
      this.Id = +param.get('id')
    })
    this.routeUrl.queryParamMap.subscribe(param => {
      this.StudentClassId = +param.get('scid')
    })
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
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "Studentdocument");
    this.formdata.append("parentId", "-1");

    if (this.Id != null || this.Id != 0)
      this.formdata.append("StudentId", "-1");
    this.formdata.append("StudentClassId", this.StudentClassId.toString());
    //this.formdata.append("StudentDoc", "-1");
    this.formdata.append("DocTypeId", this.uploadForm.get("DocTypeId").value);

    this.formdata.append("image", this.selectedFile, this.selectedFile.name);
    //console.log('formdata to save',this.formdata);
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
    list.filter = ["Active eq 1 and StudentClassId eq " + this.StudentClassId];
    //list.orderBy = "ParentId";
     // console.log('globalconstants.apiUrl ',globalconstants.apiUrl);
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        //this.allMasterData = [...data.value];
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
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.DocumentTypes = this.getDropDownData(globalconstants.DOCUMENTTYPE);
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
  //DocTypeId: number;
  DocType: string;
  Active: boolean
}