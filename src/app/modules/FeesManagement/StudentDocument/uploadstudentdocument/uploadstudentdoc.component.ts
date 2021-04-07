import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    "StudentDocId",
    "DocName",
    "UploadDate",
    "Action"
  ]
  documentUploadSource: MatTableDataSource<IUploadDoc>;
  constructor(private fileUploadService: FileUploadService,
    private alertMessage: AlertService,
    private routeUrl: ActivatedRoute,
    private dataservice: NaomitsuService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      DocTypeId: [0]
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
  uploadchange(files) {
    if (files.length === 0)
      return;
    this.selectedFile = files[0];
  }
  uploadFile() {
    let error: boolean = false;
    this.formdata = new FormData();
    //this.formdata.append("description", "Passport photo of student");
    this.formdata.append("fileOrPhoto", "0");
    this.formdata.append("folderName", "Studentdocument");
    this.formdata.append("parentId", "-1");

    if (this.Id != null || this.Id != 0)
      this.formdata.append("StudentId", this.Id.toString());
    this.formdata.append("StudentClassId", this.StudentClassId.toString());
    this.formdata.append("StudentDoc", "-1");
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
      "StudentDocId",
      "DocName",
      "UploadDate",
      "DocTypeId",
      "Active"];
    list.PageName = "StudentDocuments";
    list.filter = ["StudentClassId eq "];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //console.log(data.value);
        this.allMasterData = [...data.value];
        this.DocumentTypes = this.getDropDownData(globalconstants.DOCUMENTTYPE);
        this.allMasterData = data.value.map(doc => {
          doc.DocType = this.DocumentTypes.filter(t => t.MasterDataId == doc.DocTypeId)[0].MasterDataName;
          return {
            doc
          }
        })
      });

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
  StudentDocId: number;
  DocName: string;
  UploadDate: Date;
  DocTypeId: number;
  DocType: string;
  Active: boolean
}