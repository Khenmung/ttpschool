import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TableUtil } from 'src/app/shared/TableUtil';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-datadump',
  templateUrl: './datadump.component.html',
  styleUrls: ['./datadump.component.scss']
})
export class DatadumpComponent implements OnInit {
  PageLoading = true;
  @ViewChild("table") tableRef: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  loading = false;
  filterOrgIdNBatchId = '';
  filterOrgIdOnly = '';
  filterBatchIdNOrgId = '';
  ELEMENT_DATA: IStudent[];
  dataSource: MatTableDataSource<IStudent>;
  displayedColumns = [];
  allMasterData = [];
  Students = [];
  Genders = [];
  Classes = [];
  Batches = [];
  Bloodgroup = [];
  Category = [];
  Religion = [];
  States = []
  Remarks = [];
  PrimaryContact = [];
  Location = [];
  LanguageSubjUpper = [];
  LanguageSubjLower = [];
  FeeType = [];
  FeeDefinitions = [];
  Sections = [];
  Houses = [];
  StudentClasses = [];
  UploadTypes = [];
  ReasonForLeaving = [];
  Siblings = [];
  AdmissionStatus = [];
  Clubs = [];
  SelectedApplicationId = 0;
  SelectedBatchId = 0;
  SelectedBatchStudentIDRollNo = [];
  StudentClassId = 0;
  StudentId = 0;
  StudentFamilyNFriendList = [];
  studentSearchForm: FormGroup;
  filteredStudents: Observable<IStudent[]>;
  filteredFathers: Observable<IStudent[]>;
  filteredMothers: Observable<IStudent[]>;
  LoginUserDetail;
  FeePaymentPermission = '';
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private route: Router,

    private fb: FormBuilder,
    private shareddata: SharedataService,
    private token: TokenStorageService) { }

  ngOnInit(): void {

    this.loading = true;
    this.LoginUserDetail = this.token.getUserDetail();
    if (this.LoginUserDetail == "") {
      this.route.navigate(['/auth/login']);
    }
    else {
      var perObj = globalconstants.getPermission(this.token, globalconstants.Pages.edu.STUDENT.FEEPAYMENT);
      if (perObj.length > 0) {
        this.FeePaymentPermission = perObj[0].permission;
      }
      //var perObj = globalconstants.getPermission(this.token, globalconstants.Pages.edu.STUDENT.SEARCHSTUDENT);
      this.SelectedBatchId = +this.token.getSelectedBatchId();
      this.filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.token);
      this.SelectedApplicationId = +this.token.getSelectedAPPId();
      this.filterOrgIdOnly = globalconstants.getStandardFilter(this.LoginUserDetail);
      this.filterBatchIdNOrgId = globalconstants.getStandardFilterWithBatchId(this.token);
      this.studentSearchForm = this.fb.group({
        searchRemarkId: [0],
        searchClassId: [0],
      })

      // this.filteredStudents = this.studentSearchForm.get("searchStudentName").valueChanges
      //   .pipe(
      //     startWith(''),
      //     map(value => typeof value === 'string' ? value : value.Name),
      //     map(Name => Name ? this._filter(Name) : this.Students.slice())
      //   );
      // this.filteredFathers = this.studentSearchForm.get("FatherName").valueChanges
      //   .pipe(
      //     startWith(''),
      //     map(value => typeof value === 'string' ? value : value.FatherName),
      //     map(FatherName => FatherName ? this._filterF(FatherName) : this.Students.slice())
      //   );
      // this.filteredMothers = this.studentSearchForm.get("MotherName").valueChanges
      //   .pipe(
      //     startWith(''),
      //     map(value => typeof value === 'string' ? value : value.MotherName),
      //     map(MotherName => MotherName ? this._filterM(MotherName) : this.Students.slice())
      //   );

      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value];
      });


      this.GetMasterData();
      this.GetFeeTypes();
      if (+localStorage.getItem('studentId') > 0) {
        this.GetSibling();
      }
    }
    //this.GetStudents();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  private _filterF(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.FatherName.toLowerCase().includes(filterValue));

  }
  private _filterM(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.MotherName.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  displayFnF(stud: IStudent): string {
    return stud && stud.FatherName ? stud.FatherName : '';
  }
  displayFnM(stud: IStudent): string {
    return stud && stud.MotherName ? stud.MotherName : '';
  }
  GetMasterData() {
    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {

        this.shareddata.ChangeMasterData(data.value);
        this.allMasterData = [...data.value];

        this.ReasonForLeaving = this.getDropDownData(globalconstants.MasterDefinitions.school.REASONFORLEAVING);
        this.shareddata.ChangeReasonForLeaving(this.ReasonForLeaving);

        //this.shareddata.CurrentBatch.subscribe(c => (this.Batches = c));
        this.Batches = this.token.getBatches()
        this.Category = this.getDropDownData(globalconstants.MasterDefinitions.common.CATEGORY);
        this.shareddata.ChangeCategory(this.Category);

        this.Religion = this.getDropDownData(globalconstants.MasterDefinitions.common.RELIGION);
        this.shareddata.ChangeReligion(this.Religion);

        this.States = this.getDropDownData(globalconstants.MasterDefinitions.common.STATE);
        this.shareddata.ChangeStates(this.States);

        this.PrimaryContact = this.getDropDownData(globalconstants.MasterDefinitions.school.PRIMARYCONTACT);
        this.shareddata.ChangePrimaryContact(this.PrimaryContact);

        this.Location = this.getDropDownData(globalconstants.MasterDefinitions.ttpapps.LOCATION);
        this.shareddata.ChangeLocation(this.Location);

        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.shareddata.ChangeGenders(this.Genders);

        this.Bloodgroup = this.getDropDownData(globalconstants.MasterDefinitions.common.BLOODGROUP);
        this.Clubs = this.getDropDownData(globalconstants.MasterDefinitions.school.CLUBS);
        this.AdmissionStatus = this.getDropDownData(globalconstants.MasterDefinitions.school.ADMISSIONSTATUS);
        this.shareddata.ChangeBloodgroup(this.Bloodgroup);

        this.LanguageSubjUpper = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTUPPERCLS);
        this.shareddata.ChangeLanguageSubjectUpper(this.LanguageSubjUpper);

        this.LanguageSubjLower = this.getDropDownData(globalconstants.MasterDefinitions.school.LANGUAGESUBJECTLOWERCLS);
        this.shareddata.ChangeLanguageSubjectLower(this.LanguageSubjLower);
        this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARKS);
        this.contentservice.GetFeeDefinitions(this.LoginUserDetail[0]["orgId"], 1).subscribe((f: any) => {
          this.FeeDefinitions = [...f.value];
          this.shareddata.ChangeFeeDefinition(this.FeeDefinitions);
        });

        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.shareddata.ChangeSection(this.Sections);

        this.Houses = this.getDropDownData(globalconstants.MasterDefinitions.school.HOUSE);
        this.shareddata.ChangeHouse(this.Houses);

        this.UploadTypes = this.getDropDownData(globalconstants.MasterDefinitions.school.UPLOADTYPE);
        this.shareddata.ChangeUploadType(this.UploadTypes);

        this.loading = false; this.PageLoading = false;
        this.getSelectedBatchStudentIDRollNo();
        this.GetStudentClasses();

      });

  }
  getDropDownData(dropdowntype) {
    let Ids = this.allMasterData.filter((item, indx) => {
      return item.MasterDataName.toLowerCase() == dropdowntype//globalconstants.GENDER
    });
    if (Ids.length > 0) {
      var Id = Ids[0].MasterDataId;
      return this.allMasterData.filter((item, index) => {
        return item.ParentId == Id
      });
    }
    else
      return [];
  }
  fee(id) {
    this.route.navigate(['/edu/addstudentfeepayment/' + id]);
  }
  class(id) {
    this.route.navigate(['/edu/addstudentcls/' + id]);
  }
  view(element) {
    debugger;
    this.generateDetail(element);
    var _ClassId = 0;
    if (element.StudentClasses.length > 0) {
      this.StudentClassId = element.StudentClasses[0].StudentClassId;
      _ClassId = element.StudentClasses[0].ClassId;
    }

    this.StudentId = element.StudentId;

    this.token.saveStudentClassId(this.StudentClassId + "");
    this.token.saveClassId(_ClassId + "");
    this.token.saveStudentId(this.StudentId + "");

    this.route.navigate(['/edu/addstudent/' + element.StudentId]);
  }
  feepayment(element) {
    this.generateDetail(element);
    this.route.navigate(['/edu/feepayment']);
  }
  generateDetail(element) {
    let StudentName = element.PID + ' ' + element.Name + ' ' + element.FatherName + ' ' + element.MotherName + ',';

    let studentclass = this.SelectedBatchStudentIDRollNo.filter(sid => sid.StudentId == element.StudentId);
    if (studentclass.length > 0) {
      var _clsName = '';
      var objcls = this.Classes.filter(f => f.ClassId == studentclass[0].ClassId);
      if (objcls.length > 0)
        _clsName = objcls[0].ClassName

      var _sectionName = '';
      var sectionObj = this.Sections.filter(f => f.MasterDataId == studentclass[0].SectionId)
      if (sectionObj.length > 0)
        _sectionName = sectionObj[0].MasterDataName;
      this.StudentClassId = studentclass[0].StudentClassId
      StudentName += "\n " + _clsName + "-" + _sectionName;
    }

    this.shareddata.ChangeStudentName(StudentName);

    //this.shareddata.ChangeStudentClassId(this.StudentClassId);
    this.token.saveStudentClassId(this.StudentClassId.toString());
    this.token.saveStudentId(element.StudentId);
    //this.shareddata.ChangeStudentId(element.StudentId);

  }
  new() {
    //var url = this.route.url;
    this.token.saveStudentId("0");
    this.token.saveStudentClassId("0");
    this.shareddata.ChangeStudentName("");
    this.route.navigate(['/edu/addstudent']);
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.tableRef.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'basicinfo.xlsx');
  }
  exportArray() {
    const datatoExport: Partial<IStudentDownload>[] = this.ELEMENT_DATA;
    // .map(x => ({
    //   StudentId: x.StudentId,
    //   Name: x.Name,
    //   FatherName: x.FatherName,
    //   Class: '',
    //   RollNo: '',
    //   Section: '',
    //   AdmissionDate: null
    // }));
    TableUtil.exportArrayToExcel(datatoExport, "StudentInfoDump");
  }
  getSelectedBatchStudentIDRollNo() {
    let list: List = new List();
    list.fields = ["StudentId", "RollNo", "SectionId", "StudentClassId", "ClassId"];
    list.PageName = "StudentClasses";
    list.filter = [this.filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        if (data.value.length > 0) {
          this.SelectedBatchStudentIDRollNo = [...data.value];

        }
      })
  }
  GetFeeTypes() {
    debugger;
    this.loading = true;
    //var filter = globalconstants.getStandardFilterWithBatchId(this.token);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeType = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeType);
        this.loading = false; this.PageLoading = false;
      })
  }
  GetStudent() {
    debugger;
    this.loading = true;
    let checkFilterString = '';//"OrgId eq " + this.LoginUserDetail[0]["orgId"] + ' and Batch eq ' + 
    var _ClassId = this.studentSearchForm.get("searchClassId").value;
    var _remarkId = this.studentSearchForm.get("searchRemarkId").value;

    if (_remarkId == 0 && _ClassId == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter atleast one parameter.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_remarkId > 0) {
      checkFilterString += " and RemarkId eq " + _remarkId;
    }
    var classfilter = '';
    if (_ClassId > 0) {
      classfilter = 'ClassId eq ' + _ClassId + ' and '
    }
    let list: List = new List();
    list.fields = ["*"];
    list.lookupFields = ["StudentClasses($filter=" + classfilter + "BatchId eq " + this.SelectedBatchId + ";$select=StudentClassId,HouseId,BatchId,ClassId,RollNo,FeeTypeId,Remarks,SectionId)"];
    list.PageName = "Students";
    list.filter = [this.filterOrgIdOnly + checkFilterString];
    //list.orderBy = "ParentId";

    this.dataservice.get(list)
      .subscribe((data: any) => {
        ////console.log(data.value);
        if (data.value.length > 0) {
          var formattedData = [];
          if (_ClassId > 0) {
            formattedData = data.value.filter(f => f.StudentClasses.length > 0);
          }
          else {
            formattedData = [...data.value];
          }
          formattedData = formattedData.filter(sc => {
            let reason = this.ReasonForLeaving.filter(r => r.MasterDataId == sc.ReasonForLeavingId)
            if (sc.StudentClasses.length > 0) {
              var obj = this.FeeType.filter(f => f.FeeTypeId == sc.StudentClasses[0].FeeTypeId);
              if (obj.length > 0) {
                sc.FeeType = obj[0].FeeTypeName
              }
              else
                sc.FeeType = '';
            }

            delete sc.FeeTypeId;
            delete sc.ReasonForLeavingId;

            sc.ReasonForLeaving = reason.length > 0 ? reason[0].MasterDataName : '';
            return sc;
          });
          this.ELEMENT_DATA = formattedData.map(element => {
            element.Name = element.FirstName + " " + element.LastName;
            if (element.RemarkId > 0)
              element.Remarks = this.Remarks.filter(f => f.MasterDataId == element.RemarkId)[0].MasterDataName;
            else
              element.Remarks = '';
            delete element.RemarkId;

            if (element.StudentClasses.length == 0) {
              //item.Remarks = '';
              element.ClassName = '';
            }
            else {
              element.StudentClasses.forEach(studcls => {
                if (studcls.SectionId > 0) {
                  let SectionFilter = this.Sections.filter(g => g.MasterDataId == studcls.SectionId);
                  if (SectionFilter.length == 0)
                    element.Section = '';
                  else
                  element.Section = SectionFilter[0].MasterDataName;
                }
                else
                element.Section = '';
                delete studcls.SectionId;

                var clsobj = this.Classes.filter(cls => {
                  return cls.ClassId == element.StudentClasses[0].ClassId
                })
                if (clsobj.length > 0)
                element.ClassName = clsobj[0].ClassName;
                else
                element.ClassName = '';
                element.RollNo = studcls.RollNo;
                element.StudentClassId =studcls.StudentClassId;
              })
              //delete element.ClassId;
            }

            /////////////////
            if (element.GenderId > 0) {
              let GenderFilter = this.Genders.filter(g => g.MasterDataId == element.GenderId);
              if (GenderFilter.length == 0)
                element.Gender = '';
              else
                element.Gender = GenderFilter[0].MasterDataName;
            }
            else
              element.Gender = '';
            delete element.GenderId;
            if (element.HouseId > 0) {
              let houseFilter = this.Houses.filter(g => g.MasterDataId == element.HouseId);
              if (houseFilter.length == 0)
                element.House = '';
              else
                element.House = houseFilter[0].MasterDataName;
            }
            else
              element.House = '';
            delete element.HouseId;

            if (element.BloodgroupId > 0) {
              let BloodgroupFilter = this.Bloodgroup.filter(g => g.MasterDataId == element.BloodgroupId);
              if (BloodgroupFilter.length == 0)
                element.Bloodgroup = '';
              else
                element.Bloodgroup = BloodgroupFilter[0].MasterDataName;
            }
            else
              element.Bloodgroup = '';
            delete element.BloodgroupId;



            if (element.CategoryId > 0) {
              let Categoryfilter = this.Category.filter(g => g.MasterDataId == element.CategoryId);
              if (Categoryfilter.length == 0)
                element.Category = '';
              else
                element.Category = Categoryfilter[0].MasterDataName;
            }
            else
              element.Category = '';
            delete element.CategoryId;

            if (element.ReligionId > 0) {
              let ReligionFilter = this.Religion.filter(g => g.MasterDataId == element.ReligionId);
              if (ReligionFilter.length == 0)
                element.Religion = '';
              else
                element.Religion = ReligionFilter[0].MasterDataName;
            }
            else
              element.Religion = '';
            delete element.ReligionId;

            if (element.AdmissionStatusId > 0) {
              let AdmissionStatusFilter = this.AdmissionStatus.filter(g => g.MasterDataId == element.AdmissionStatusId);
              if (AdmissionStatusFilter.length == 0)
                element.AdmissionStatus = '';
              else
                element.AdmissionStatus = AdmissionStatusFilter[0].MasterDataName;
            }
            else
              element.AdmissionStatus = '';
            delete element.AdmissionStatusId;

            if (element.PrimaryContactFatherOrMother > 0) {
              let PrimaryContactFatherOrMotherFilter = this.PrimaryContact.filter(g => g.MasterDataId == element.PrimaryContactFatherOrMother);
              if (PrimaryContactFatherOrMotherFilter.length == 0)
                element.PrimaryContactFatherOrMother = ''
              else
                element.PrimaryContactFatherOrMother = PrimaryContactFatherOrMotherFilter[0].MasterDataName;
            }
            else
              element.PrimaryContactFatherOrMother = '';

            if (element.ClassAdmissionSought > 0) {
              let ClassAdmissionSoughtFilter = this.Classes.filter(g => g.ClassId == element.ClassAdmissionSought);
              if (ClassAdmissionSoughtFilter.length == 0)
                element.ClassAdmissionSought = '';
              else
                element.ClassAdmissionSought = ClassAdmissionSoughtFilter[0].ClassName;
            }
            else
              element.ClassAdmissionSought = '';


            if (element.ClubId > 0) {
              let ClubObj = this.Clubs.filter(g => g.MasterDataId == element.ClubId);
              if (ClubObj.length == 0)
                element.Club = '';
              else
                element.Club = ClubObj[0].MasterDataName;
            }
            else
              element.Club = '';
            delete element.ClubId;

            // if (element.HouseId >0) {
            //   let houseObj = this.Houses.filter(g => g.MasterDataId == element.HouseId);
            //   if (houseObj.length == 0)
            //   element.House ='';
            //   else
            //     element.House = houseObj[0].MasterDataName;
            // }
            // else
            //   element.House = '';

            if (element.RemarkId > 0) {
              let remarkObj = this.Remarks.filter(g => g.MasterDataId == element.RemarkId);
              if (remarkObj.length == 0)
                element.Remarks = '';
              else
                element.Remarks = remarkObj[0].MasterDataName;
            }
            else
              element.RemarkId = 0;
            delete element.RemarkId;

            if (element.PermanentAddressCountryId > 0) {
              let CountryObj = this.allMasterData.filter(g => g.MasterDataName.toLowerCase() == element.PermanentAddressCountryId);
              if (CountryObj.length == 0)
                element.PermanentAddressCountry = '';
              else {
                element.PermanentAddressCountry = CountryObj[0].MasterDataName;
                if (element.PermanentAddressStateId > 0) {
                  let stateObj = this.allMasterData.filter(g => g.MasterDataId == element.PermanentAddressStateId
                    && g.ParentId == element.PermanentAddressCountryId);
                  if (stateObj.length == 0)
                    element.PermanentAddressState = '';
                  else {
                    element.PermanentAddressState = stateObj[0].MasterDataName;
                    if (element.PermanentAddressCityId > 0) {
                      let CityObj = this.allMasterData.filter(g => g.MasterDataId == element.PermanentAddressCityId
                        && g.ParentId == element.PermanentAddressStateId);
                      if (CityObj.length == 0)
                        element.PermanentAddressCity = '';
                      else
                        element.PermanentAddressCity = CityObj[0].MasterDataName;
                    }
                    else
                      element.PermanentAddressCity = '';
                  }
                }
                else {
                  element.PermanentAddressState = '';
                  element.PermanentAddressCity = '';
                }
              }
            }
            else {
              element.PermanentAddressCountry = '';
              element.PermanentAddressState = '';
              element.PermanentAddressCity = '';

            }
            delete element.PermanentAddressCountryId;
            delete element.PermanentAddressStateId;
            delete element.PermanentAddressCityId;

            if (element.PresentAddressCountryId > 0) {
              let CountryObj = this.allMasterData.filter(g => g.MasterDataId == element.PresentAddressCountryId);
              if (CountryObj.length == 0)
                element.PresentAddressCountry = '';
              else {
                element.PresentAddressCountry = CountryObj[0].MasterDataName;
                if (element.PresentAddressStateId > 0) {
                  let stateObj = this.allMasterData.filter(g => g.MasterDataId == element.PresentAddressStateId
                    && g.ParentId == element.PresentAddressCountryId);
                  if (stateObj.length == 0)
                    element.PresentAddressState = '';
                  else {
                    element.PresentAddressState = stateObj[0].MasterDataName;
                    if (element.PresentAddressCityId > 0) {
                      let CityObj = this.allMasterData.filter(g => g.MasterDataId == element.PresentAddressCityId
                        && g.ParentId == element.PresentAddressStateId);
                      if (CityObj.length == 0)
                        element.PresentAddressCity = '';
                      else
                        element.PresentAddressCity = CityObj[0].MasterDataName;
                    }
                    else
                      element.PresentAddressCity = '';
                  }
                }
                else {
                  element.PresentAddressState = '';
                  element.PresentAddressCity = '';
                }
              }
            }
            else {
              element.PresentAddressCountry = '';
              element.PresentAddressState = '';
              element.PresentAddressCity = '';
            }

            delete element.PresentAddressCountryId;
            delete element.PresentAddressStateId;
            delete element.PresentAddressCityId;
            delete element.OrgId;
            delete element.UserId;
            delete element.SectionId;
            ///////////////


            return element;
          })


        }
        else {
          this.ELEMENT_DATA = [];
          this.contentservice.openSnackBar(globalconstants.NoRecordFoundMessage, globalconstants.ActionText, globalconstants.RedBackground);
        }
        this.exportArray();
        console.log("this.ELEMENT_DATA",this.ELEMENT_DATA);
        // if (this.ELEMENT_DATA.length > 0) {
        //   Object.keys(this.ELEMENT_DATA[0]).forEach(prop => {
        //     if (this.displayedColumns.indexOf(prop) == -1)
        //       this.displayedColumns.push(prop);
        //   })
        // }
        // console.log("this.ELEMENT_DATA",this.ELEMENT_DATA)
        // this.dataSource = new MatTableDataSource<IStudent>(this.ELEMENT_DATA);
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        this.loading = false; this.PageLoading = false;
      });

  }
  GetStudentClasses() {
    //debugger;
    var filterOrgIdNBatchId = globalconstants.getStandardFilterWithBatchId(this.token);

    let list: List = new List();
    list.fields = ["StudentClassId,StudentId,ClassId,RollNo,SectionId"];
    list.PageName = "StudentClasses";
    list.filter = [filterOrgIdNBatchId];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.StudentClasses = [...data.value];
        this.GetStudents();
      })
  }
  GetSibling() {

    var _studentId = localStorage.getItem('studentId');
    var StudentFamilyNFriendListName = 'StudentFamilyNFriends';
    var filterStr = 'Active eq 1 and StudentId eq ' + _studentId;
    let list: List = new List();
    list.fields = [
      'StudentFamilyNFriendId',
      'StudentId',
      'SiblingId',
      'Name',
      'ContactNo',
      'RelationshipId',
      'Active',
      'RemarkId'
    ];
    list.PageName = StudentFamilyNFriendListName;
    list.filter = [filterStr];
    //this.StudentFamilyNFriendList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        data.value.forEach(m => {
          if (m.SiblingId > 0)
            this.Siblings.push(m);
        });
      });
  }
  GetStudents() {
    this.loading = true;
    var extrafilter = ''
    let list: List = new List();
    list.fields = [
      'StudentId',
      'FirstName',
      'LastName',
      'FatherName',
      'MotherName',
      'ContactNo',
      'FatherContactNo',
      'MotherContactNo'
    ];
    list.PageName = "Students";

    var standardfilter = 'OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    //login student
    if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
      list.lookupFields = ["StudentFamilyNFriendSiblings($select=StudentId,SiblingId)"]
      //extrafilter = " and UserId eq '" + this.LoginUserDetail[0]['userId'] + "'";

      var _studentId = localStorage.getItem('studentId');
      standardfilter += ' and ( StudentId eq ' + _studentId
      if (this.Siblings.length > 0) {
        //siblings
        this.Siblings.forEach(s => {
          standardfilter += ' or StudentId eq ' + s.SiblingId;
        })
      }
      standardfilter += ')'
    }


    list.filter = [standardfilter];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        debugger;
        //this.Students = [...data.value];
        //  //console.log('data.value', data.value);
        if (data.value.length > 0) {
          if (this.LoginUserDetail[0]["RoleUsers"][0].role.toLowerCase() == 'student') {
            var _students = [];
            data.value.forEach(student => {
              if (student.StudentFamilyNFriendSiblings.length > 0) {
                var indx = student.StudentFamilyNFriendSiblings.findIndex(sibling => sibling.SiblingId == student.StudentId)
                if (indx > -1) {
                  _students.push(student);
                }
              }
              else if (student.StudentId == _studentId) {
                _students.push(student);
              }
            })
          }
          else {
            _students = [...data.value];
          }

          this.Students = _students.map(student => {
            var _RollNo = '';
            var _name = '';
            var _className = '';
            var _section = '';
            var _studentClassId = 0;
            var studentclassobj = this.StudentClasses.filter(f => f.StudentId == student.StudentId);
            if (studentclassobj.length > 0) {
              _studentClassId = studentclassobj[0].StudentClassId;
              var _classNameobj = this.Classes.filter(c => c.ClassId == studentclassobj[0].ClassId);

              if (_classNameobj.length > 0)
                _className = _classNameobj[0].ClassName;
              var _SectionObj = this.Sections.filter(f => f.MasterDataId == studentclassobj[0].SectionId)

              if (_SectionObj.length > 0)
                _section = _SectionObj[0].MasterDataName;
              _RollNo = studentclassobj[0].RollNo == null ? '' : studentclassobj[0].RollNo;
            }
            student.ContactNo = student.ContactNo == null ? '' : student.ContactNo;
            _name = student.FirstName + " " + student.LastName;
            var _fullDescription = _name + "-" + _className + "-" + _section + "-" + _RollNo + "-" + student.ContactNo;
            return {
              StudentClassId: _studentClassId,
              StudentId: student.StudentId,
              Name: _fullDescription,
              FatherName: student.FatherName,
              MotherName: student.MotherName
            }
          })
        }
        this.loading = false; this.PageLoading = false;
      })
  }

}
export interface IStudent {
  StudentId: number;
  Name: string;
  FatherName: string;
  MotherName: string;
  FatherContactNo: string;
  MotherContactNo: string;
  Active: boolean;
  Action: boolean;
}
export interface IStudentDownload {
  StudentId: number;
  Name: string;
  FatherName: string;
  AdmissionDate: Date;
  Class: string;
  RollNo: string;
  Section: string;
}


