import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/components/mat-confirm-dialog/mat-confirm-dialog.component';
import { ContentService } from 'src/app/shared/content.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { globalconstants } from 'src/app/shared/globalconstant';
import { List } from 'src/app/shared/interface';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-AssignStudentclassdashboard',
  templateUrl: './Assignstudentclassdashboard.component.html',
  styleUrls: ['./Assignstudentclassdashboard.component.scss']
})
export class AssignStudentclassdashboardComponent implements OnInit {
  PageLoading = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild("table") mattable;
  //@ViewChild(ClasssubjectComponent) classSubjectAdd: ClasssubjectComponent;
  RowsToUpdate = -1;
  //RowsT = 0;
  RollNoGenerationSortBy = '';
  SearchSectionId = 0;
  Permission = '';
  PromotePermission = '';
  LoginUserDetail: any[] = [];
  exceptionColumns: boolean;
  CurrentRow: any = {};
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  StandardFilterWithBatchId = '';
  StandardFilterWithPreviousBatchId = '';
  SameClassPreviousBatch = "SameClassPreviousBatch";
  PreviousClassPreviousBatch = "PreviousClassPreviousBatch";
  HeaderTitle = '';
  loading = false;
  RollNoGeneration = [];
  //  ClassPromotion =[];
  Genders = [];
  Classes = [];
  FeeTypes = [];
  Sections = [];
  Remarks = [];
  StudentGrades = [];
  CurrentBatchId = 0;
  SelectedBatchId = 0;
  PreviousBatchId = 0;
  NextBatchId = 0;
  Batches = [];
  StudentClassList: IStudentClass[] = [];
  dataSource: MatTableDataSource<IStudentClass>;
  allMasterData = [];
  searchForm: UntypedFormGroup;
  FeeCategories = [];
  SelectedApplicationId = 0;
  checkBatchIdNSelectedIdEqual = 0;
  StudentClassData = {
    StudentClassId: 0,
    ClassId: 0,
    OrgId: 0,
    BatchId: 0,
    StudentId: 0,
    RollNo: 0,
    SectionId: 0,
    FeeTypeId: 0,
    AdmissionNo: '',
    Remarks: '',
    Active: 1
  };
  displayedColumns = [
    'AdmissionNo',
    'StudentName',
    'GenderName',
    'Remark',
    'ClassName',
    'SectionId',
    'RollNo',
    'FeeTypeId',
    'Remarks',
    'Active',
    'Action'
  ];
  nameFilter = new UntypedFormControl('');
  IdFilter = new UntypedFormControl('');
  filterValues = {
    AdmissionNo: 0,
    StudentId: 0,
    StudentName: ''
  };
  Students: IStudent[] = [];
  filteredOptions: Observable<IStudentClass[]>;
  constructor(private servicework: SwUpdate,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private contentservice: ContentService,
    private fb: UntypedFormBuilder,
    private dataservice: NaomitsuService,
    private tokenstorage: TokenStorageService,

    private route: ActivatedRoute,
    private nav: Router,
    private shareddata: SharedataService,
  ) { }

  ngOnInit(): void {
    this.servicework.activateUpdate().then(() => {
      this.servicework.checkForUpdate().then((value) => {
        if (value) {
          location.reload();
        }
      })
    })
    this.searchForm = this.fb.group({
      searchFeeTypeId: [0],
      searchSectionId: [0],
      searchClassId: [0],
      searchRemarkId: [0],
      searchGenderAscDesc: [''],
      searchNameAscDesc: ['']
    });
    this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filterValues.StudentName = name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.IdFilter.valueChanges
      .subscribe(
        AdmissionNo => {
          this.filterValues.AdmissionNo = AdmissionNo;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.PageLoad();
  }
  private _filter(name: string): IStudent[] {

    const filterValue = name.toLowerCase();
    return this.Students.filter(option => option.Name.toLowerCase().includes(filterValue));

  }
  displayFn(user: IStudent): string {
    return user && user.Name ? user.Name : '';
  }
  PageLoad() {
    debugger;
    this.loading = true;
    this.LoginUserDetail = this.tokenstorage.getUserDetail();

    if (this.LoginUserDetail == null)
      this.nav.navigate(['/auth/login']);
    else {
      this.SelectedApplicationId = +this.tokenstorage.getSelectedAPPId();
      this.contentservice.GetClasses(this.LoginUserDetail[0]["orgId"]).subscribe((data: any) => {
        this.Classes = [...data.value.sort((a, b) => a.Sequence - b.Sequence)];
      })
      this.Batches = this.tokenstorage.getBatches()

      //this.shareddata.CurrentBatchId.subscribe(c => this.CurrentBatchId = c);
      this.SelectedBatchId = +this.tokenstorage.getSelectedBatchId();
      this.NextBatchId = +this.tokenstorage.getNextBatchId();
      this.PreviousBatchId = +this.tokenstorage.getPreviousBatchId();
      this.StandardFilterWithBatchId = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
      this.StandardFilterWithPreviousBatchId = globalconstants.getStandardFilterWithPreviousBatchId(this.tokenstorage);

      var perObj = globalconstants.getPermission(this.tokenstorage, globalconstants.Pages.edu.SUBJECT.CLASSSTUDENT);
      if (perObj.length > 0)
        this.Permission = perObj[0].permission;

      this.checkBatchIdNSelectedIdEqual = +this.tokenstorage.getCheckEqualBatchId();
      ////console.log('selected batchid', this.SelectedBatchId);
      ////console.log('current batchid', this.CurrentBatchId)
      if (this.PromotePermission == 'read')
        this.displayedColumns = [
          'Student',
          'ClassName',
          'RollNo',
          'GenderName',
          'SectionId',
          'FeeTypeId',
          'Action'
        ];
      //this.shareddata.CurrentPreviousBatchIdOfSelecteBatchId.subscribe(p => this.PreviousBatchId = p);
      //this.shareddata.CurrentFeeType.subscribe(b => this.FeeTypes = b);
      this.shareddata.CurrentSection.subscribe(b => this.Sections = b);
      //this.shareddata.CurrentBatch.subscribe(b => this.Batches = b);
      this.Batches = this.tokenstorage.getBatches()

      if (this.Classes.length == 0 || this.FeeTypes.length == 0 || this.Sections.length == 0) {
        this.GetMasterData();
        this.GetFeeTypes();
      }
      else {
        this.loading = false; this.PageLoading = false;
      }
      //this.GetStudents();
    }
  }
  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.StudentName.toLowerCase().indexOf(searchTerms.StudentName) !== -1
        && data.StudentId.toString().toLowerCase().indexOf(searchTerms.StudentId) !== -1
      // && data.colour.toLowerCase().indexOf(searchTerms.colour) !== -1
      // && data.pet.toLowerCase().indexOf(searchTerms.pet) !== -1;
    }
    return filterFunction;
  }
  openDialog() {
    debugger;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Save',
          cancel: 'No'
        }
      }
    });
    const snack = this.snackBar.open('Snack bar open before dialog');

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        //this.GenerateRollNo();
        snack.dismiss();
        const a = document.createElement('a');
        a.click();
        a.remove();
        snack.dismiss();
        this.snackBar.open('Closing snack bar in a few seconds', 'Fechar', {
          duration: 2000,
        });
      }
    });
  }
  GenerateRollNoOnList() {
    debugger;
    var _gendersort = this.searchForm.get("searchGenderAscDesc").value;
    var _namesort = this.searchForm.get("searchNameAscDesc").value;
    if (_gendersort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select gender sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_namesort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select name sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.StudentClassList.length > 0) {

      // this.StudentClassList.sort((a, b) => {
      //   const compareGender = a.GenderName.localeCompare(b.GenderName);
      //   const compareName = a.StudentName.localeCompare(b.StudentName);
      //   return compareGender || compareName;
      // })
      this.StudentClassList = alasql("select * from ? order by GenderName " + _gendersort + ",StudentName " + _namesort, [this.StudentClassList])
      this.StudentClassList.forEach((studcls, indx) => {
        studcls.RollNo = indx + 1 + "";
        studcls.Action = true;
      })
      this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.createFilter();
    }
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("No student to assign roll no.", globalconstants.ActionText, globalconstants.RedBackground);

    }
  }
  GenerateRollNo() {

    let filterStr = ' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    var _gendersort = this.searchForm.get("searchGenderAscDesc").value;
    var _namesort = this.searchForm.get("searchNameAscDesc").value;
    if (_gendersort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select gender sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (_namesort == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select name sort.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    this.loading = true;
    if (this.searchForm.get("searchClassId").value > 0)
      filterStr += " and ClassId eq " + this.searchForm.get("searchClassId").value;
    else {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    if (this.searchForm.get("searchSectionId").value > 0)
      filterStr += " and SectionId eq " + this.searchForm.get("searchSectionId").value;
    // else {
    //   this.loading = false; this.PageLoading=false;
    //   this.contentservice.openSnackBar("Please select section.", globalconstants.ActionText,globalconstants.RedBackground);
    //   return;
    // }
    filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }

    let list: List = new List();
    list.fields = [
      'StudentClassId',
      'StudentId',
      'AdmissionNo',
      'FeeTypeId',
      'ClassId',
      'RollNo',
      'SectionId',
      'Remarks',
      'Active'
    ];

    list.PageName = "StudentClasses";
    list.lookupFields = ["Student($select=*)"];
    list.filter = [filterStr];
    this.StudentClassList = [];
    this.dataservice.get(list)
      .subscribe((StudentClassesdb: any) => {
        var result;
        result = [...StudentClassesdb.value];
        var StudentClassRollNoGenList = [];
        result.forEach(stud => {
          var feetype = this.FeeTypes.filter(t => t.FeeTypeId == stud.FeeTypeId);
          var _feetype = ''
          if (feetype.length > 0)
            _feetype = feetype[0].FeeTypeName;


          StudentClassRollNoGenList.push({
            StudentClassId: stud.StudentClassId,
            //AdmissionNo:stud.AdmissionNo,
            ClassId: stud.ClassId,
            StudentId: stud.StudentId,
            StudentName: stud.Student.FirstName + " " + stud.Student.LastName,
            ClassName: this.Classes.filter(c => c.ClassId == stud.ClassId)[0].ClassName,
            FeeTypeId: stud.FeeTypeId,
            FeeType: _feetype,
            SectionId: stud.SectionId,
            Section: stud.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == stud.SectionId)[0].MasterDataName : '',
            RollNo: stud.RollNo,
            Active: stud.Active,
            FirstName: stud.Student.FirstName,
            LastName: stud.Student.LastName,
            FatherName: stud.Student.FatherName,
            MotherName: stud.Student.MotherName,
            FatherOccupation: stud.Student.FatherOccupation,
            MotherOccupation: stud.Student.MotherOccupation,
            PresentAddress: stud.Student.PresentAddress,
            PermanentAddress: stud.Student.PermanentAddress,
            Gender: stud.Student.Gender,
            DOB: new Date(stud.Student.DOB),//this.formatdate.transform(stud.Student.DOB,'dd/MM/yyyy'),
            Bloodgroup: stud.Student.Bloodgroup,
            Category: stud.Student.Category,
            BankAccountNo: stud.Student.BankAccountNo,
            IFSCCode: stud.Student.IFSCCode,
            MICRNo: stud.Student.MICRNo,
            AadharNo: stud.Student.AadharNo,
            Photo: stud.Student.Photo,
            Religion: stud.Student.Religion,
            ContactNo: stud.Student.ContactNo,
            WhatsAppNumber: stud.Student.WhatsAppNumber,
            FatherContactNo: stud.Student.FatherContactNo,
            MotherContactNo: stud.Student.MotherContactNo,
            PrimaryContactFatherOrMother: stud.Student.PrimaryContactFatherOrMother,
            NameOfContactPerson: stud.Student.NameOfContactPerson,
            RelationWithContactPerson: stud.Student.RelationWithContactPerson,
            ContactPersonContactNo: stud.Student.ContactPersonContactNo,
            AlternateContact: stud.Student.AlternateContact,
            EmailAddress: stud.Student.EmailAddress,
            LastSchoolPercentage: stud.Student.LastSchoolPercentage,
            ClassAdmissionSought: stud.Student.ClassAdmissionSought,
            TransferFromSchool: stud.Student.TransferFromSchool,
            TransferFromSchoolBoard: stud.Student.TransferFromSchoolBoard,
            Promote: 0,
            Action: true
          });

        })
        //var orderbyArr = this.RollNoGenerationSortBy.split(',');
        if (StudentClassRollNoGenList.length == 0)
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        else {

          this.RollNoGenerationSortBy = 'Gender ' + _gendersort + ',StudentName ' + _namesort;
          var orderbystatement = "select StudentClassId,StudentId,StudentName,ClassId,SectionId,RollNo,Gender,FeeTypeId,Promote,Active,[Action] from ? order by " +
            this.RollNoGenerationSortBy;

          this.StudentClassList = alasql(orderbystatement, [StudentClassRollNoGenList]);
          this.StudentClassList.forEach((student, index) => {
            student.RollNo = (index + 1) + "";
          });

          this.contentservice.openSnackBar("New Roll Nos. has been generated. Please confirm and save it all.", globalconstants.ActionText, globalconstants.RedBackground);

          this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = this.createFilter();
          this.loading = false; this.PageLoading = false;
        }
      })
  }
  sortMultiple(a, b) {

  }
  PromoteAll() {
    var _rowstoupdate = this.StudentClassList.filter(f => f.Promote == 1);
    this.RowsToUpdate = _rowstoupdate.length;
    _rowstoupdate.forEach(s => {
      this.RowsToUpdate--;
      s.StudentClassId = 0;
      delete s.SectionId;
      s.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      s.ClassId = this.Classes[this.Classes.findIndex(i => s.ClassId) + 1].MasterDataId;
      this.UpdateOrSave(s);
    })
  }
  PromoteRow(row) {
    if (row.Promote == 1) {
      row.StudentClassId = 0;
      delete row.SectionId;
      row.RollNo = '';
      this.SelectedBatchId = this.CurrentBatchId;
      row.ClassId = this.Classes[this.Classes.findIndex(i => row.ClassId) + 1].MasterDataId;
      this.UpdateOrSave(row);
    }
  }
  CheckPromoteAll(event) {
    //debugger;
    var _promote = 0;
    if (event.checked) {
      _promote = 1;
    }

    this.StudentClassList.forEach(s => {
      s.Promote = _promote;
    })

  }
  EnablePromote(row, control) {
    if (control.checked) {
      row.Promote = 1;
      row.Action = true;
    }
    else {
      row.Promote = 0;
      row.Action = false;
    }

  }
  promotePreviousBatch() {
    //debugger;
    var previousBatchId = +this.tokenstorage.getPreviousBatchId();
    this.SelectedBatchId = previousBatchId;
    this.GetStudentClasses(0);
  }
  onBlur(row) {
    row.Action = true;
  }
  UploadExcel() {

  }
  GetFeeTypes() {
    this.loading = true;
    //var filter = globalconstants.getStandardFilterWithBatchId(this.tokenstorage);
    let list: List = new List();
    list.fields = ["FeeTypeId", "FeeTypeName", "Formula"];
    list.PageName = "SchoolFeeTypes";
    list.filter = ["Active eq 1 and OrgId eq " + this.LoginUserDetail[0]["orgId"]];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        this.FeeTypes = [...data.value];
        this.shareddata.ChangeFeeType(this.FeeTypes);
        this.loading = false; this.PageLoading = false;
      })
  }
  CopyFromSameClassPreviousBatch() {
    if (this.searchForm.get("searchClassId").value == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.PreviousBatchId == -1) {
      this.StudentClassList = [];
      this.dataSource = new MatTableDataSource<IStudentClass>();
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);
    }
    else {
      var SameClassPreviousBatchData = [];
      var ExistingData = [];
      this.StudentClassList = [];
      this.HeaderTitle = 'Same Class From Previous Batch'
      this.GetStudentClasses(this.SameClassPreviousBatch)
        .subscribe((data: any) => {
          //SameClassPreviousBatchData = [...data.value];
          var _classId = this.searchForm.get("searchClassId").value
          var result;
          result = [...data.value];
          var _defaultTypeId = 0;
          var defaultFeeTypeObj = this.FeeTypes.filter(f => f.defaultType == 1);
          if (defaultFeeTypeObj.length > 0)
            _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
          result.forEach(s => {
            var _genderName = '';
            var genderObj = this.Genders.filter(f => f.MasterDataId == s.Student.GenderId);
            if (genderObj.length > 0)
              _genderName = genderObj[0].MasterDataName;
            var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
            var _feetype = ''
            if (feetype.length > 0)
              _feetype = feetype[0].FeeTypeName;
            var _lastname = s.Student.LastName == null ? '' : " " + s.Student.LastName;
            SameClassPreviousBatchData.push({
              StudentClassId: 0,
              ClassId: _classId,
              StudentId: s.StudentId,
              StudentName: s.Student.FirstName + _lastname,
              ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
              FeeTypeId: (s.FeeTypeId == 0 || s.FeeTypeId == null) ? _defaultTypeId : s.FeeTypeId,
              FeeType: _feetype,
              RollNo: s.RollNo,
              SectionId: s.SectionId,
              Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
              Active: 0,
              Promote: 0,
              Remarks: '',
              GenderName: _genderName,
              Action: false
            });
          })
          this.GetStudentClasses('')
            .subscribe((data: any) => {
              ExistingData = [...data.value];
              SameClassPreviousBatchData.forEach(spb => {
                var promoted = ExistingData.filter(f => f.StudentId == spb.StudentId);
                if (promoted.length == 0) {
                  this.StudentClassList.push(spb);
                }
              })
              if (this.StudentClassList.length == 0) {
                this.contentservice.openSnackBar("No data from " + this.HeaderTitle, globalconstants.ActionText, globalconstants.RedBackground);
              }
              this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
              this.dataSource.filterPredicate = this.createFilter();
              this.loading = false; this.PageLoading = false;

            })
        })
    }
  }
  CopyFromPreviousClassAndBatch() {
    debugger;
    if (this.searchForm.get("searchClassId").value == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please select class.", globalconstants.ActionText, globalconstants.RedBackground);
      return;
    }
    if (this.PreviousBatchId == -1) {
      this.StudentClassList = [];
      this.dataSource = new MatTableDataSource<IStudentClass>();
      this.contentservice.openSnackBar("Previous batch not defined.", globalconstants.ActionText, globalconstants.RedBackground);

    } else {
      this.HeaderTitle = 'From Previous Class and Previous Batch'
      var PreviousClassAndPreviousBatchData = [];
      this.StudentClassList = [];
      var ExistingData = [];
      this.GetStudentClasses(this.PreviousClassPreviousBatch)
        .subscribe((data: any) => {

          var result;
          var _classId = this.searchForm.get("searchClassId").value
          result = [...data.value];
          //console.log('result',result)
          var _defaultTypeId = 0;
          var defaultFeeTypeObj = this.FeeTypes.filter(f => f.defaultType == 1);
          if (defaultFeeTypeObj.length > 0)
            _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
          result.forEach(s => {
            var _genderName = '';
            var genderObj = this.Genders.filter(f => f.MasterDataId == s.Student.Gender);
            if (genderObj.length > 0)
              _genderName = genderObj[0].MasterDataName;
            var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
            var _feetype = ''
            if (feetype.length > 0)
              _feetype = feetype[0].FeeTypeName;
            var _lastname = s.Student.LastName == null ? '' : " " + s.Student.LastName;
            PreviousClassAndPreviousBatchData.push({
              StudentClassId: 0,
              ClassId: _classId,
              StudentId: s.StudentId,
              StudentName: s.Student.FirstName + _lastname,
              ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
              FeeTypeId: (s.FeeTypeId == 0 || s.FeeTypeId == null) ? _defaultTypeId : s.FeeTypeId,
              FeeType: _feetype,
              RollNo: s.RollNo,
              SectionId: s.SectionId,
              Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
              Active: 0,
              Promote: 0,
              Remarks: '',
              GenderName: _genderName,
              Action: false
            });
          })
          this.GetStudentClasses('')
            .subscribe((data: any) => {
              ExistingData = [...data.value]
              PreviousClassAndPreviousBatchData.forEach(spb => {
                var promoted = ExistingData.filter(f => f.StudentId == spb.StudentId);
                if (promoted.length == 0) {
                  this.StudentClassList.push(spb);
                }
              })
              if (this.StudentClassList.length == 0) {
                this.contentservice.openSnackBar("No data from " + this.HeaderTitle, globalconstants.ActionText, globalconstants.RedBackground);
              }
              this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
              this.dataSource.filterPredicate = this.createFilter();
              this.loading = false; this.PageLoading = false;
            })
        })
    }
  }
  GetStudentClasses(previousbatch) {

    let filterStr = '';//' OrgId eq ' + this.LoginUserDetail[0]["orgId"];
    this.loading = true;
    var _classId = this.searchForm.get("searchClassId").value;
    var _FeeTypeId = this.searchForm.get("searchFeeTypeId").value;

    //this.HeaderTitle = '';

    if (previousbatch == this.SameClassPreviousBatch) {//SameClassPreviousBatch
      filterStr = this.StandardFilterWithPreviousBatchId;
      filterStr += " and ClassId eq " + _classId;
    }
    else if (previousbatch == this.PreviousClassPreviousBatch) {
      filterStr = this.StandardFilterWithPreviousBatchId;
      var classIdIndex = this.Classes.findIndex(s => s.ClassId == _classId);
      var previousClassId = 0;
      if (classIdIndex > 0)//means not if first element
      {
        previousClassId = this.Classes[classIdIndex - 1]["ClassId"];
        filterStr += " and ClassId eq " + previousClassId;
      }
      else {
        this.loading = false; this.PageLoading = false;
        this.contentservice.openSnackBar("Previous class not defined.", globalconstants.ActionText, globalconstants.RedBackground);
        //return;
      }
    }
    else {
      filterStr = this.StandardFilterWithBatchId;
      if (_classId > 0)
        filterStr += " and ClassId eq " + _classId;
    }

    if (_FeeTypeId > 0)
      filterStr += " and FeeTypeId eq " + _FeeTypeId;

    if (this.searchForm.get("searchSectionId").value > 0)
      filterStr += " and SectionId eq " + this.searchForm.get("searchSectionId").value;
    //filterStr += ' and BatchId eq ' + this.SelectedBatchId;

    if (filterStr.length == 0) {
      this.loading = false; this.PageLoading = false;
      this.contentservice.openSnackBar("Please enter search criteria.", globalconstants.ActionText, globalconstants.RedBackground);
      return null;
    }
    else {
      let list: List = new List();
      list.fields = [
        'StudentClassId',
        'AdmissionNo',
        'StudentId',
        'FeeTypeId',
        'ClassId',
        'RollNo',
        'SectionId',
        'Remarks',
        'Active'
      ];

      list.PageName = "StudentClasses";
      list.lookupFields = ["Student($select=PID,FirstName,LastName,GenderId,RemarkId)"];
      list.filter = ['Active eq 1 and ' + filterStr];
      this.StudentClassList = [];
      return this.dataservice.get(list);
    }
  }
  GetData(previousbatch) {
    this.GetStudentClasses('')
      .subscribe((StudentClassesdb: any) => {
        var result;
        var _RemarkId = this.searchForm.get("searchRemarkId").value;
        if (_RemarkId > 0)
          result = StudentClassesdb.value.filter(f => f.Student.RemarkId == _RemarkId);
        else
          result = [...StudentClassesdb.value];

        var _defaultTypeId = 0;
        var defaultFeeTypeObj = this.FeeTypes.filter(f => f.defaultType == 1);
        if (defaultFeeTypeObj.length > 0)
          _defaultTypeId = defaultFeeTypeObj[0].FeeTypeId;
        result.forEach(s => {
          var obj = this.Remarks.filter(f => f.MasterDataId == s.Student.RemarkId);
          var _remark = '';

          if (obj.length > 0)
            _remark = obj[0].MasterDataName

          var _genderName = '';
          var genderObj = this.Genders.filter(f => f.MasterDataId == s.Student.GenderId);
          if (genderObj.length > 0)
            _genderName = genderObj[0].MasterDataName;
          var feetype = this.FeeTypes.filter(t => t.FeeTypeId == s.FeeTypeId);
          var _feetype = ''
          if (feetype.length > 0)
            _feetype = feetype[0].FeeTypeName;
          var _lastname = s.Student.LastName == null ? '' : " " + s.Student.LastName;
          this.StudentClassList.push({
            PID: s.Student.PID,
            StudentClassId: previousbatch == '' ? s.StudentClassId : 0,
            AdmissionNo: s.AdmissionNo,
            ClassId: s.ClassId,
            StudentId: s.StudentId,
            StudentName: s.Student.FirstName + _lastname,
            ClassName: this.Classes.filter(c => c.ClassId == s.ClassId)[0].ClassName,
            FeeTypeId: (s.FeeTypeId == 0 || s.FeeTypeId == null) ? _defaultTypeId : s.FeeTypeId,
            FeeType: _feetype,
            RollNo: s.RollNo,
            SectionId: s.SectionId,
            Section: s.SectionId > 0 ? this.Sections.filter(sc => sc.MasterDataId == s.SectionId)[0].MasterDataName : '',
            Active: previousbatch == '' ? s.Active : 0,
            Promote: 0,
            Remark: _remark,
            Remarks: s.Remarks,
            GenderName: _genderName,
            Action: false
          });
        })

        if (this.StudentClassList.length == 0) {
          this.HeaderTitle = '';
          this.contentservice.openSnackBar("No record found!", globalconstants.ActionText, globalconstants.RedBackground);
        }

        this.dataSource = new MatTableDataSource<IStudentClass>(this.StudentClassList.sort((a, b) => +a.RollNo - +b.RollNo));
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.createFilter();
        this.loading = false; this.PageLoading = false;

      })
  }
  clear() {
    this.searchForm.patchValue({
      searchClassId: 0,

    });
  }
  SelectALL(event) {
    if (event.checked)
      this.StudentClassList.forEach(f => {
        f.Active = 1;
        f.Action = true;
      })
    else
      this.StudentClassList.forEach(f => {
        f.Active = 0;
        f.Action = true;
      })
  }
  updateActive(row, value) {

    row.Active = value.checked ? 1 : 0;
    row.Action = true;
  }
  delete(element) {
    let toupdate = {
      Active: element.Active == 1 ? 0 : 1
    }
    this.dataservice.postPatch('ClassSubjects', toupdate, element.ClassSubjectId, 'delete')
      .subscribe(
        (data: any) => {
          // this.GetApplicationRoles();
          this.contentservice.openSnackBar(globalconstants.DeletedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

        });
  }
  SaveAll() {
    debugger;
    var _toUpdate = this.StudentClassList.filter(f => f.Action);
    this.RowsToUpdate = _toUpdate.length;
    _toUpdate.forEach(e => {

      this.UpdateOrSave(e);
    })
  }
  SaveRow(row) {
    debugger;
    this.RowsToUpdate = 1;
    this.UpdateOrSave(row);
  }
  UpdateOrSave(row) {

    //debugger;
    this.loading = true;

    let checkFilterString = "ClassId eq " + row.ClassId +
      " and StudentId eq " + row.StudentId + ' and BatchId eq ' + this.SelectedBatchId

    if (row.StudentClassId > 0)
      checkFilterString += " and StudentClassId ne " + row.StudentClassId;

    let list: List = new List();
    list.fields = ["StudentClassId"];
    list.PageName = "StudentClasses";
    list.filter = [checkFilterString];

    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          this.loading = false; this.PageLoading = false;
          this.contentservice.openSnackBar(globalconstants.RecordAlreadyExistMessage, globalconstants.ActionText, globalconstants.RedBackground);
          row.Ative = 0;
          return;
        }
        else {
          this.contentservice.GetStudentClassCount(this.LoginUserDetail[0]['orgId'], 0, 0, this.SelectedBatchId)
            .subscribe((data: any) => {

              var ClassStrength = data.value.length;
              ClassStrength +=1;
              var _batchName = this.tokenstorage.getSelectedBatchName();
              //var _admissionNo = this.searchForm.get("AdmissionNo").value;
              var _year = _batchName.split('-')[0].trim();
              //var _year = new Date().getFullYear();

              //var _section= this.Sections.filter(s=>s.MasterDataId == row.Section)
              this.StudentClassData.Active = row.Active;
              this.StudentClassData.StudentClassId = row.StudentClassId;
              this.StudentClassData.StudentId = row.StudentId;
              this.StudentClassData.ClassId = row.ClassId;
              this.StudentClassData.FeeTypeId = row.FeeTypeId;
              this.StudentClassData.RollNo = row.RollNo;
              this.StudentClassData.SectionId = row.SectionId;
              this.StudentClassData.Remarks = row.Remarks;
              this.StudentClassData.AdmissionNo = !row.AdmissionNo? _year + ClassStrength : row.AdmissionNo;

              this.StudentClassData.OrgId = this.LoginUserDetail[0]["orgId"];
              this.StudentClassData.BatchId = this.SelectedBatchId;
              if (this.StudentClassData.StudentClassId == 0) {
                this.StudentClassData["CreatedDate"] = new Date();
                this.StudentClassData["CreatedBy"] = this.LoginUserDetail[0]["userId"];
                delete this.StudentClassData["UpdatedDate"];
                delete this.StudentClassData["UpdatedBy"];
                //console.log('to insert', this.StudentClassData)
                this.insert(row);
              }
              else {
                delete this.StudentClassData["CreatedDate"];
                delete this.StudentClassData["CreatedBy"];
                this.StudentClassData["UpdatedDate"] = new Date();
                this.StudentClassData["UpdatedBy"] = this.LoginUserDetail[0]["userId"];
                this.update(row);
              }
            });
        }
      });
  }

  insert(row) {

    //debugger;
    this.dataservice.postPatch('StudentClasses', this.StudentClassData, 0, 'post')
      .subscribe(
        (data: any) => {
          this.loading = false; this.PageLoading = false;
          row.ClassName = this.Classes.filter(c => c.ClassId == data.ClassId)[0].ClassName,
            row.StudentClassId = data.StudentClassId;

          row.Action = false;

          this.RowsToUpdate--;
          if (this.RowsToUpdate == 0) {
            this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
            this.RowsToUpdate = -1;
          }

        });
  }
  update(row) {

    this.dataservice.postPatch('StudentClasses', this.StudentClassData, this.StudentClassData.StudentClassId, 'patch')
      .subscribe(
        (data: any) => {
          row.Action = false;
          this.RowsToUpdate--;

          if (this.RowsToUpdate == 0) {

            this.loading = false; this.PageLoading = false;
            this.CreateInvoice(row);
            this.contentservice.openSnackBar(globalconstants.UpdatedMessage, globalconstants.ActionText, globalconstants.BlueBackground);
          }
        });
  }
  CreateInvoice(row) {
    debugger;
    this.loading = true;
    this.contentservice.GetClassFeeWithFeeDefinition(this.LoginUserDetail[0]["orgId"], 0, this.SelectedBatchId)
      .subscribe((datacls: any) => {

        var _clsfeeWithDefinitions = datacls.value.filter(m => m.FeeDefinition.Active == 1);

        this.contentservice.getStudentClassWithFeeType(this.LoginUserDetail[0]["orgId"], this.SelectedBatchId, row.StudentClassId)
          .subscribe((data: any) => {
            var studentfeedetail = [];
            data.value.forEach(studcls => {
              var _feeName = '';
              var objClassFee = _clsfeeWithDefinitions.filter(def => def.ClassId == studcls.ClassId);
              objClassFee.forEach(clsfee => {
                var _category = '';
                var _subCategory = '';

                var objcat = this.FeeCategories.filter(f => f.MasterDataId == clsfee.FeeDefinition.FeeCategoryId);
                if (objcat.length > 0)
                  _category = objcat[0].MasterDataName;

                var objsubcat = this.FeeCategories.filter(f => f.MasterDataId == clsfee.FeeDefinition.FeeSubCategoryId);
                if (objsubcat.length > 0)
                  _subCategory = objsubcat[0].MasterDataName;

                var _formula = studcls.FeeType.Active == 1 ? studcls.FeeType.Formula : '';

                if (_formula.length > 0) {
                  _feeName = clsfee.FeeDefinition.FeeName;
                  studentfeedetail.push({
                    Month: clsfee.Month,
                    Amount: clsfee.Amount,
                    Formula: _formula,
                    FeeName: _feeName,
                    StudentClassId: studcls.StudentClassId,
                    FeeCategory: _category,
                    FeeSubCategory: _subCategory,
                    FeeTypeId: studcls.FeeTypeId,
                    SectionId: studcls.SectionId,
                    RollNo: studcls.RollNo
                  });
                }

              })
            })
            // console.log("studentfeedetailxxxx",studentfeedetail)
            this.contentservice.createInvoice(studentfeedetail, this.SelectedBatchId, this.LoginUserDetail[0]["orgId"])
              .subscribe((data: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Invoice created successfully.", globalconstants.ActionText, globalconstants.BlueBackground);
              },
                error => {
                  this.loading = false;
                  console.log("create invoice error", error);
                  this.contentservice.openSnackBar(globalconstants.TechnicalIssueMessage, globalconstants.ActionText, globalconstants.RedBackground);
                })
          })
      });

  }

  isNumeric(str: number) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  GetStudents() {

    // let list: List = new List();
    // list.fields = [
    //   'PID',
    //   'StudentId',
    //   'FirstName',
    //   'LastName'
    // ];

    // list.PageName = "Students";
    // //list.lookupFields = ["Student"]
    // list.filter = ['OrgId eq ' + this.LoginUserDetail[0]["orgId"]];

    // this.dataservice.get(list)
    //   .subscribe((data: any) => {
    //debugger;
    //  //console.log('data.value', data.value);
    var _students: any = this.tokenstorage.getStudents();
    _students = _students.filter(a => a.Active == 1);
    this.Students = _students.map(student => {
      var _lastname = student.LastName == null ? '' : " " + student.LastName;
      return {
        StudentId: student.StudentId,
        Name: student.PID + '-' + student.FirstName + _lastname
      }
    })
    this.loading = false;
    this.PageLoading = false;
    //  })
  }
  GetMasterData() {

    this.contentservice.GetCommonMasterData(this.LoginUserDetail[0]["orgId"], this.SelectedApplicationId)
      .subscribe((data: any) => {
        debugger;
        this.allMasterData = [...data.value];
        this.RollNoGeneration = this.getDropDownData(globalconstants.MasterDefinitions.school.ROLLNOGENERATION);
        this.Genders = this.getDropDownData(globalconstants.MasterDefinitions.school.SCHOOLGENDER);
        this.Sections = this.getDropDownData(globalconstants.MasterDefinitions.school.SECTION);
        this.StudentGrades = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTGRADE);
        this.Remarks = this.getDropDownData(globalconstants.MasterDefinitions.school.STUDENTREMARKS);
        this.FeeCategories = this.getDropDownData(globalconstants.MasterDefinitions.school.FEECATEGORY);
        this.RollNoGenerationSortBy = "Sort by: " + this.RollNoGeneration.filter(f => f.MasterDataName.toLowerCase() == 'sort by')[0].Logic;
        this.loading = false; this.PageLoading = false;
      });
  }
  getDropDownData(dropdowntype) {
    return this.contentservice.getDropDownData(dropdowntype, this.tokenstorage, this.allMasterData);
    // let Id = 0;
    // let Ids = this.allMasterData.filter((item, indx) => {
    //   return item.MasterDataName.toLowerCase() == dropdowntype.toLowerCase();//globalconstants.GENDER
    // })
    // if (Ids.length > 0) {
    //   Id = Ids[0].MasterDataId;
    //   return this.allMasterData.filter((item, index) => {
    //     return item.ParentId == Id
    //   })
    // }
    // else
    //   return [];

  }

}
export interface IStudentClass {
  PID: number;
  StudentClassId: number;
  AdmissionNo: string;
  ClassId: number;
  ClassName: string;
  StudentId: number;
  StudentName: string;
  RollNo: string;
  SectionId: number;
  Section: string;
  FeeTypeId: number;
  FeeType: string;
  Promote: number;
  GenderName: string;
  Remark: string;
  Remarks: string;
  Active: number;
  Action: boolean
}
export interface IStudent {
  StudentClassId: number;
  StudentId: number;
  Name: string;
}