import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedataService {
  items = [];
  BatchId = 0;
  StudentId = 0;
  StudentClassId = 0;
  private MasterDataSource = new BehaviorSubject(this.items);
  private BatchIdSource = new BehaviorSubject(this.BatchId);
  private BatchSource = new BehaviorSubject(this.items);
  private StudentIdSource = new BehaviorSubject(this.StudentId);
  private StudentClassIdSource = new BehaviorSubject(this.StudentClassId);
  private CountrySource = new BehaviorSubject(this.items);
  private GendersSource = new BehaviorSubject(this.items);
  private BloodgroupSource = new BehaviorSubject(this.items);
  private CategorySource = new BehaviorSubject(this.items);
  private ReligionSource = new BehaviorSubject(this.items);
  private StatesSource = new BehaviorSubject(this.items);
  private LocationSource = new BehaviorSubject(this.items);
  private ClassesSource = new BehaviorSubject(this.items);
  private PrimaryContactSource = new BehaviorSubject(this.items);
  private SectionSource = new BehaviorSubject(this.items);
  private FeeTypeSource = new BehaviorSubject(this.items);
  private LanguageSubjectUpperSource = new BehaviorSubject(this.items);
  private LanguageSubjectLowerSource = new BehaviorSubject(this.items);
  private FeeNamesSource = new BehaviorSubject(this.items);
  
  currentFeeNames = this.FeeNamesSource.asObservable();  
  currentLanguageSubjectLower = this.LanguageSubjectLowerSource.asObservable();
  currentLanguageSubjectUpper = this.LanguageSubjectUpperSource.asObservable();
  currentFeeType = this.FeeTypeSource.asObservable();
  currentSection = this.SectionSource.asObservable();
  currentPrimaryContact = this.PrimaryContactSource.asObservable();
  currentMasterData = this.MasterDataSource.asObservable();
  CurrentBatchId = this.BatchIdSource.asObservable();
  CurrentBatch = this.BatchSource.asObservable();
  CurrentStudentId = this.StudentIdSource.asObservable();
  CurrentStudentClassId = this.StudentClassIdSource.asObservable();
  CurrentCountry = this.CountrySource.asObservable();
  CurrentGenders = this.GendersSource.asObservable();
  CurrentBloodgroup = this.BloodgroupSource.asObservable();
  CurrentCategory = this.CategorySource.asObservable();
  CurrentReligion = this.ReligionSource.asObservable();
  CurrentStates = this.StatesSource.asObservable();
  CurrentLocation = this.LocationSource.asObservable();
  CurrentClasses = this.ClassesSource.asObservable();

  constructor() {
  }
  ngOnInit() {

  }
  ChangeFeeNames(item)
  {
    this.FeeNamesSource.next(item);
  }
  ChangeLanguageSubjectLower(item){

   this.LanguageSubjectLowerSource.next(item);
  }
  ChangeLanguageSubjectUpper(item){

   this.LanguageSubjectUpperSource.next(item);
  }
  ChangeFeeType(item){

   this.FeeTypeSource.next(item);
  }
  ChangeSection(item){

   this.SectionSource.next(item);
  }
  ChangePrimaryContact(item){
    this.PrimaryContactSource.next(item);
  }
  ChangeMasterData(item) {

    this.MasterDataSource.next(item);
  }
  ChangeBatchId(item) {

    this.BatchIdSource.next(item);
  }
  ChangeBatch(item) {

    this.BatchSource.next(item);
  }
  ChangeStudentId(item) {
    this.StudentIdSource.next(item);
  }
  ChangeStudentClassId(item) {
    this.StudentClassIdSource
  }
  ChangeCountry(item) {
    this.CountrySource.next(item);
  }
  ChangeGenders(item) {
    this.GendersSource.next(item);
  }
  ChangeBloodgroup(item) {
    this.BloodgroupSource.next(item);
  }
  ChangeCategory(item) {
    this.CategorySource.next(item);
  }
  ChangeReligion(item) {
    this.ReligionSource.next(item);
  }
  ChangeStates(item) {
    this.StatesSource.next(item);
  }
  ChangeLocation(item) {
    this.LocationSource.next(item);
  }
  ChangeClasses(item) {
    this.ClassesSource.next(item);
  }

  clearData() {
    this.items = [];
    return this.items;
  }
}