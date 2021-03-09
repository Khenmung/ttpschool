import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { List } from 'src/app/shared/interface';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from '../../../shared/databaseService'

@Component({
  selector: 'app-photobrowser',
  templateUrl: './photobrowser.component.html',
  styleUrls: ['./photobrowser.component.scss']
})
export class PhotobrowserComponent implements OnInit {
  //searchForm:FormGroup;
  blueColorScheme = ["#FCE786",
    "#EC7235",
    "#D22D16",
    "#77BFE2",
    "#36A1D4"];
  searchForm = new FormGroup({
    Album: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    year: new FormControl(''),
    radioAlbum: new FormControl('')
  });
  images: any[];
  Albums: any[];
  AllAlbums: any[];
  unique: any[];
  selectedAlbum: string;
  oldvalue: string;
  loading = false;
  constructor(
    private dataservice: NaomitsuService,
    private route: Router,
    private alert: AlertService
  ) { }

  ngOnInit() {
    this.getAlbums();
    this.searchForm.controls.radioAlbum.setValue('');
  }
  changeColor(indx) {
    let i = indx % 4;
    return this.blueColorScheme[i];
  }
  view(event) {
    //console.log('this.Albums.length',event)
    debugger;
    this.selectedAlbum = event;
    let selectedAlbumId = this.Albums.filter(item => {
      return item.UpdatedFileFolderName == this.selectedAlbum
    })[0].FileId;
    this.route.navigate(["/photocarousel"], { queryParams: { fileId: selectedAlbumId } });
  }
  applyFilter(strFilter) {
    let count=0;
    if (strFilter.length > 2)
      this.Albums = [...this.AllAlbums.filter(item => { return item.UpdatedFileFolderName.includes(strFilter)})];
    else if (strFilter.length == 0)
      this.Albums = this.AllAlbums.filter((item, indx) => indx<10);
    else
      return;
  }
  getAlbums() {
    this.loading = true;
    let list: List = new List();
    list.fields = ["FileId", "FileName", "UpdatedFileFolderName", "UploadDate"];
    list.PageName = "FilesNPhotoes";
    list.filter = ['Active eq 1 and FileOrFolder eq 1 and FileOrPhoto eq 1'];
    list.orderBy = "UploadDate desc";
    //list.limitTo =10;
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //        console.log(data.value);
        this.Albums = data.value.filter((item, indx) => {
          return indx < 10;
        });

        this.AllAlbums = data.value;
        this.loading = false;
      }, error => console.log(error))
  }
  selected(event) {
    //console.log('event',event)
    this.selectedAlbum = event.target.value;
    //console.log('this.selectedAlbum', this.selectedAlbum)
    // let tempImages = this.Albums.filter((item)=>{
    //   return item.Album == this.selectedAlbum
    // })
    // this.images = tempImages.map(item=> {return item.PhotoPath});
  }
  getoldvalue(value: string) {
    this.oldvalue = value;
    console.log('old value', this.oldvalue);
  }
  saveCost(value) {
    if (value.length == 0 || value.length > 50) {
      this.alert.error("Character should not be empty or less than 50!");
      return;
    }

    let albumtoUpdate = {
      UpdatedFileFolderName: value,
      Active: 1,
      UploadDate: new Date()
    }
    let selectedAlbumId = this.Albums.filter(item => {
      return item.UpdatedFileFolderName == this.oldvalue
    })[0].FileId;
    console.log('selectedAlbumId', selectedAlbumId);
    this.dataservice.postPatch('FilesNPhotoes', albumtoUpdate, selectedAlbumId, 'patch')
      .subscribe(res => {
        console.log(res);
      });
  }
}
