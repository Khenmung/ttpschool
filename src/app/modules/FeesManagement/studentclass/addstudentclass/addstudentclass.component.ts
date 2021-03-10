import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-addstudentclass',
  templateUrl: './addstudentclass.component.html',
  styleUrls: ['./addstudentclass.component.scss']
})
export class AddstudentclassComponent implements OnInit {
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;
  allMasterData = [];
  Students = [];
  Classes = [];
  Batches = [];
  Sections = [];
  FeeType = [];
  LanguageSubjectUpper = [];
  LanguageSubjectLower = [];
  studentclassForm = new FormGroup({
    StudentClassId: new FormControl(''),
    StudentId: new FormControl(0, [Validators.required]),
    ClassId: new FormControl(0, [Validators.required]),
    Section: new FormControl('', [Validators.required]),
    RollNo: new FormControl('', [Validators.required]),
    Batch: new FormControl(0, [Validators.required]),
    FeeTypeId: new FormControl(0, [Validators.required]),
    LanguageSubject: new FormControl(0),
    Remarks: new FormControl(''),
    Active: new FormControl(0, [Validators.required]),
  });
  constructor(private dataservice: NaomitsuService) { }

  ngOnInit(): void {
    this.GetMasterData();
    this.GetStudents();
    this.filteredOptions = this.studentclassForm.get("StudentId").valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  get f() { return this.studentclassForm.controls }
  GetMasterData() {
    let list: List = new List();
    list.fields = ["MasterDataId", "MasterDataName", "ParentId"];
    list.PageName = "MasterDatas";
    list.filter = ["Active eq 1"];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        console.log(data.value);
        this.allMasterData = [...data.value];
        this.Classes = this.getDropDownData(globalconstants.CLASSES);
        //debugger;
        this.Batches = this.getDropDownData(globalconstants.BATCH);
        this.FeeType = this.getDropDownData(globalconstants.FEETYPE);
        this.LanguageSubjectLower = this.getDropDownData(globalconstants.LANGUAGESUBJECTLOWERCLS);
        this.LanguageSubjectUpper = this.getDropDownData(globalconstants.LANGUAGESUBJECTUPPERCLS);
        this.Sections = this.getDropDownData(globalconstants.SECTION);
      });

  }
  GetStudents() {
    let list: List = new List();
    list.fields = ["StudentId", "Name", "FatherName"];
    list.PageName = "students";
    list.filter = ["Active eq 1"];
    
    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.options = [...data.value];
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
