import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from '../../../shared/databaseService';
import { globalconstants } from '../../../shared/globalconstant';
import { List } from '../../../shared/interface';
import { FileUploadService } from '../../../shared/upload.service';
import { TokenStorageService } from '../../../_services/token-storage.service';

@Component({
  selector: 'app-filedrag-and-drop',
  templateUrl: './filedrag-and-drop.component.html',
  styleUrls: ['./filedrag-and-drop.component.scss']
})
export class FiledragAndDropComponent implements OnInit { PageLoading=true;
  loading = false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  Processing = false;
  Requestsize = 0;
  Albums: any[];
  errorMessage = '';
  formdata: FormData;
  dragdropForm = new UntypedFormGroup({
    folderName: new UntypedFormControl(''),
    FileId: new UntypedFormControl(0),
    parentId: new UntypedFormControl(0)

  });
  constructor(private uploadService: FileUploadService,
    private naomitsuService: NaomitsuService,
    private route: Router,
    private tokenStorage: TokenStorageService,
    private contentservice: ContentService) { }

  ngOnInit(): void {
    this.formdata = new FormData();
    this.checklogin();
    this.getAlbums();
  }
  checklogin() {

    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.contentservice.openSnackBar("Access denied! login required.", globalconstants.ActionText, globalconstants.RedBackground);
      this.route.navigate(['/home']);
    }
  }
  public files: NgxFileDropEntry[] = [];

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    ////console.log('this.files', this.files)
    //debugger;
    this.Processing = true;
    for (const droppedFile of files) {

      //20971520
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          if (this.Requestsize + file.size > globalconstants.RequestLimit) {
            let mb = (globalconstants.RequestLimit / (1024 * 1024)).toFixed(2);
            this.contentservice.openSnackBar('File upload limit is ${mb}mb!', globalconstants.ActionText, globalconstants.RedBackground);
            return;
          }
          this.Requestsize += file.size
          // Here you can access the real file
          ////console.log(droppedFile.relativePath, file);
          if (file.type.includes("image") || file.type == "application/pdf" ||
            file.type == "application/vnd.ms-excel" ||
            file.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            //this.filesForDisplayOnly.push(file);
            this.formdata.append(droppedFile.fileEntry.name, file, droppedFile.fileEntry.name)
          }
          else
            this.errorMessage = "Only pdf/images/excel/word are allowed to upload.";

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        ////console.log(droppedFile.relativePath, fileEntry);
      }
    }
    if (this.errorMessage.length > 0)
      this.contentservice.openSnackBar(this.errorMessage, globalconstants.ActionText, globalconstants.RedBackground);
    this.Processing = false;
    ////console.log('this.formdata',this.filesForDisplayOnly);
  }
  Upload() {

    if (this.Requestsize > globalconstants.RequestLimit) {
      this.contentservice.openSnackBar("File upload limit is 20mb!", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let error: boolean = false;
    //debugger;

    let selectedAlbum = this.dragdropForm.get("folderName").value;
    let selectedAlbumId = this.dragdropForm.get("parentId").value;
    ////console.log(this.Albums);//alert(selectedAlbum);
    if (this.files.length < 1) {
      error = true;
      this.contentservice.openSnackBar("No image to upload", globalconstants.ActionText, globalconstants.RedBackground);
    }

    if (selectedAlbum == '' && selectedAlbumId == 0) {
      error = true;
      this.contentservice.openSnackBar("Please enter folder or select existing folder", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    else {
      if (selectedAlbumId != 0) {
        selectedAlbum = this.Albums.filter(item => item.FileId == selectedAlbumId)[0].UpdatedFileFolderName;
      }

      this.formdata.append("folderName", selectedAlbum);
      this.formdata.append("FileId", selectedAlbumId);
      //if ()
      this.formdata.append("parentId", this.dragdropForm.get("parentId") != null ? this.dragdropForm.get("parentId").value : "0");
      this.formdata.append("description", "");
      this.formdata.append("fileOrPhoto", "0");
      let filteredAlbum: any[] = [];
      if (this.Albums.length > 0) {
        filteredAlbum = this.Albums.filter(item => {
          return item.UpdatableName == selectedAlbum
        }
        );
      }
      this.uploadFile();


    }
  }
  uploadFile() {
    ////console.log('form dasta',this.formdata);
    this.Processing = true;
    this.uploadService.postFiles(this.formdata).subscribe(res => {
      ////console.log("Upload complete");
      this.contentservice.openSnackBar("Files Uploaded successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
      this.formdata = null;
      this.files = [];
      this.getAlbums();
      this.Processing = false;
      this.route.navigate(['/home/managefile']);

    });
  }
  getAlbums() {
    let list: List = new List();
    list.fields = ["FileId", "UpdatedFileFolderName"];
    list.PageName = "StorageFnPs";
    list.filter = ["Active eq 1 and FileOrFolder eq 1 and FileOrPhoto eq 0"];
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Albums = data.value;
        }
        else
          this.Albums = [];

      });
  }
  public fileOver(event) {
    ////console.log(event);
  }

  public fileLeave(event) {
    ////console.log(event);
  }
}
