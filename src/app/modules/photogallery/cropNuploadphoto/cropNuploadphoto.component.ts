import { Component, OnInit, ViewChild,Input } from '@angular/core';
import { Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { base64ToFile } from 'ngx-image-cropper';
import { DatePipe } from '@angular/common';
import { FileUploadService } from '../../../shared/upload.service'
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { List } from 'src/app/shared/interface';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { Router } from '@angular/router';
import { DialogService } from 'src/app/shared/dialog.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
//import { formmodule } from 'src/app/interface';
const MAX_SIZE: number = 1048576;

@Component({
    selector: 'app-uploadphoto',
    templateUrl: './cropNuploadphoto.component.html',
    styleUrls: ['./cropNuploadphoto.component.scss'],
    providers: [FileUploadService, ConfirmationService, MessageService]
})
export class cropNUploadphotoComponent implements OnInit {
    options = {
        autoClose: true,
        keepAfterRouteChange: true
    };
    Albums: any[];
    formData: FormData;
    UploadForm: FormGroup = new FormGroup({});
    selectedRatio:string="5/2";
    constructor(private datePipe: DatePipe,
        private uploadService: FileUploadService,
        private alertMessage: AlertService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private naomitsuService: NaomitsuService,
        private route: Router,
        private dialog: DialogService,
        private tokenStorage: TokenStorageService) {
        this.UploadForm = new FormGroup(
            {
                parentId: new FormControl(0),
                UpdatedFileFolderName: new FormControl(''),
                description: new FormControl(''),
               
            });
    }
    ngOnInit() {
        
        this.UploadForm.patchValue({"aspectRatio":"4/3"})
        this.Albums = [];
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
            this.alertMessage.error("Access denied! login required.", options);
            this.route.navigate(['/']);
        }
    }
    fileName: string;
    selectedAlbum: string;
    ParentId: number;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    canvasRotation = 0;
    rotation = 0;
    scale = 1;
    showCropper = false;
    containWithinAspectRatio = false;
    transform: ImageTransform = {};

    @ViewChild(ImageCropperComponent, { static: true }) imageCropper: ImageCropperComponent;

    fileChangeEvent(event: any): void {
        if (event === null || event === undefined){
            return null
            }
        this.imageChangedEvent = event;
        this.fileName = this.imageChangedEvent.target.files[0].name;
        console.log('this.fileName',this.fileName);
    }

    imageCropped(event: ImageCroppedEvent) {
        //this.cropper.setAspectRatio(this.aspectRatio);
        this.croppedImage = event.base64;
        this.formData = new FormData();
        this.formData.append("Image", <File>base64ToFile(this.croppedImage), this.fileName);
        //this.formData.append("album", this.selectedAlbum);
        //this.formData.append("description", this.UploadForm.get("Description").value);
        // this.fileName =file.name;
          
    }

    uploadFile() {
        let error: boolean = false;
        
        //console.log('this.fileName', this.fileName);
        this.selectedAlbum = this.UploadForm.get("UpdatedFileFolderName").value;
        this.ParentId = this.UploadForm.get("parentId").value;
        //this.formData = new FormData();
        //this.formData.append(this.fileName,<File>base64ToFile(this.croppedImage),this.fileName);
        if (this.selectedAlbum == '' && this.ParentId == 0) {
            error = true;
            this.alertMessage.error("Please enter album or select existing album!", this.options);
        }
        else {
            if (this.ParentId > 0) {
                var existingAlbum = this.Albums.filter(item => item.FileId == this.ParentId)[0].UpdatedFileFolderName;
                this.formData.append("folderName", existingAlbum);
            }
            else
                this.formData.append("folderName", this.selectedAlbum);

            this.formData.append("parentId", this.ParentId.toString());
            this.formData.append("description", this.UploadForm.get("description").value);
            this.formData.append("fileOrPhoto", "1");
            let filteredAlbum: any[] = [];
            if (this.Albums.length > 0) {
                filteredAlbum = this.Albums.filter(item => {
                    return item.UpdatedFileFolderName == this.selectedAlbum
                });
            }
            this.uploadImage();
            
        }
    }
    uploadImage() {
        let options = {
            autoClose: true,
            keepAfterRouteChange: true
        };
        //this.formData.append("Image", <File>base64ToFile(this.croppedImage),this.fileName);
        this.uploadService.postFile(this.formData).subscribe(res => {
            this.alertMessage.success("Files Uploaded successfully.", options);
            this.route.navigate(["/managefile"]);
        });
    }
   
    confirm(event: Event) {
        this.confirmationService.confirm({
            target: event.target,
            message: 'Album already exists! Do you want to add to existing album?',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Added to existing album.' });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Image not added' });
            }
        });
    }
    getAlbums() {
        let list: List = new List();
        list.fields = ["FileId", "UpdatedFileFolderName"];
        list.PageName = "FilesNPhotoes";
        list.filter = ["Active eq 1 and FileOrPhoto eq 1 and FileOrFolder eq 1"];
        this.naomitsuService.get(list)
            .subscribe((data: any) => {
                if (data.value.length > 0) {
                    this.Albums = data.value;
                }
            });
    }

    imageLoaded() {
        this.showCropper = true;
        console.log('Image loaded');
    }

    cropperReady(sourceImageDimensions: Dimensions) {
        console.log('Cropper ready', sourceImageDimensions);
    }

    loadImageFailed() {
        console.log('Load failed');
    }

    rotateLeft() {
        this.canvasRotation--;
        this.flipAfterRotate();
    }

    rotateRight() {
        this.canvasRotation++;
        this.flipAfterRotate();
    }

    private flipAfterRotate() {
        const flippedH = this.transform.flipH;
        const flippedV = this.transform.flipV;
        this.transform = {
            ...this.transform,
            flipH: flippedV,
            flipV: flippedH
        };
    }


    flipHorizontal() {
        this.transform = {
            ...this.transform,
            flipH: !this.transform.flipH
        };
    }

    flipVertical() {
        this.transform = {
            ...this.transform,
            flipV: !this.transform.flipV
        };
    }

    resetImage() {
        this.scale = 1;
        this.rotation = 0;
        this.canvasRotation = 0;
        this.transform = {};
    }

    zoomOut() {
        this.scale -= .1;
        this.transform = {
            ...this.transform,
            scale: this.scale
        };
    }

    zoomIn() {
        this.scale += .1;
        this.transform = {
            ...this.transform,
            scale: this.scale
        };
    }

    toggleContainWithinAspectRatio() {
        this.containWithinAspectRatio = !this.containWithinAspectRatio;
    }

    updateRotation() {
        this.transform = {
            ...this.transform,
            rotate: this.rotation
        };
    }

}


