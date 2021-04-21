import { Component, OnInit } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { FileUploadService } from '../../../shared/upload.service'
import { AlertService } from '../../../shared/components/alert/alert.service'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { List } from 'src/app/shared/interface';
import { NaomitsuService } from '../../../shared/databaseService'
import { DialogService } from '../../../shared/dialog.service';
import { Router } from '@angular/router';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { base64ToFile } from 'ngx-image-cropper';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { async } from '@angular/core/testing';
@Component({
  selector: 'app-file-drag-and-drop',
  templateUrl: './imgDragAndDrop.html',
  styleUrls: ['./imgDragAndDrop.scss'],
  //providers:[Ng2ImgMaxModule,Ng2ImgMaxService]
})
export class ImgDragAndDropComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  Albums: any[];
  title = 'Dropzone';
  files: File[] = [];
  formData: FormData;
  uploadedImage: File;
  errorMessage = '';
  constructor(
    private naomitsuService: NaomitsuService,
    private alert: AlertService,
    private uploadService: FileUploadService,
    private dialog: DialogService,
    private route: Router,
    private ng2ImgMax: Ng2ImgMaxService,
    private tokenStorage: TokenStorageService
  ) { }
  dragdropForm = new FormGroup({
    UpdatedFileFolderName: new FormControl(''),
    parentId: new FormControl(0),

  });
  ngOnInit() {
    this.checklogin();
    this.getAlbums();
  }
  checklogin() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    let token = this.tokenStorage.getToken();

    if (token == null) {
      this.alert.error("Access denied! login required.", options);
      this.route.navigate(['/']);
    }
  }
  onSelect(event) {

    this.files.push(...event.addedFiles);

    this.formData = new FormData();
    this.errorMessage = '';

    for (var i = 0; i < this.files.length; i++) {

      this.ng2ImgMax.resizeImage(this.files[i], 2500, 1000)
        .subscribe(result => {
          this.uploadedImage = result;
          this.formData.append(result.name, this.uploadedImage, result.name);

        },
          error => {
            this.alert.error(error.reason);
            //this.files.splice(i,1);
            this.errorMessage += error.reason;
            //console.log('error:', error);
          })

    }
    // if (this.errorMessage.length > 0)
    //   this.alert.error(this.errorMessage, this.options);
  }
  onImageChange(event) {
    let image = event.target.files[0];

    this.ng2ImgMax.compressImage(image, 0.075).subscribe(
      result => {
        this.uploadedImage = new File([result], result.name);
        //this.getImagePreview(this.uploadedImage);
      },
      error => {
        console.log('😢 Oh no!', error);
      }
    );
  }
  Upload() {
    if (this.files.length > 15) {
      this.alert.error("File count exceeded the maximum of 15");
      return;
    }
    else if (this.errorMessage.length > 0) {
      return;
    }
    let error: boolean = false;
    let selectedAlbum = this.dragdropForm.get("UpdatedFileFolderName").value;
    let selectedAlbumId = this.dragdropForm.get("parentId").value;
    if (this.files.length < 1) {
      error = true;
      this.alert.warn("No image to upload", this.options);
    }

    if (selectedAlbum == '' && selectedAlbumId == 0) {
      error = true;
      this.alert.error("Please enter album or existing album", this.options);
    }
    else {
      if (selectedAlbumId != 0) {
        selectedAlbum = this.Albums.filter(item => item.FileId == selectedAlbumId)[0].UpdatedFileFolderName;
      }
      this.formData.append("fileOrPhoto", "1");
      this.formData.append("description", "");
      this.formData.append("folderName", selectedAlbum);
      this.formData.append("parentId", selectedAlbumId);
      //console.log('formdata',this.formData);
      let filteredAlbum: any[] = [];
      if (this.Albums.length > 0) {
        filteredAlbum = this.Albums.filter(item => {
          return item.UpdatedFolder == selectedAlbum
        }
        );
      }
      this.uploadFile();

    }
  }
  uploadFile() {
    let options = {
      autoClose: true,
      keepAfterRouteChange: true
    };
    this.uploadService.postFiles(this.formData).subscribe(res => {
      //console.log("Upload complete");
      this.alert.success("Files Uploaded successfully.", options);
      this.formData = null;
      this.files = [];
      this.getAlbums();
      this.route.navigate(['/managefile']);
      //this.messages.push("Upload complete");
      //album.value=null;
      //image.value =null;
    });
  }
  onRemove(event) {

    this.files.splice(this.files.indexOf(event), 1);

  }

  getAlbums() {
    let list: List = new List();
    list.fields = ["FileId", "UpdatedFileFolderName"];
    list.PageName = "FilesNPhotoes";
    list.filter = ["Active eq 1 and FileOrFolder eq 1 and FileOrPhoto eq 1"];
    debugger;
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.Albums = [...data.value];
        }
        else
          this.Albums = [];
      });
  }

}
