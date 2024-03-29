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
  private StudentNameSource = new BehaviorSubject('');
  private UploadTypeSource = new BehaviorSubject(this.items);
  private PagesDataSource = new BehaviorSubject(this.items);
  private NewsNEventIdSource = new BehaviorSubject(-1);
  private ReasonForLeavingSource = new BehaviorSubject(this.items);
  private SelectedBatchIdSource = new BehaviorSubject(0);
  private RandomImagesSource = new BehaviorSubject(this.items);

  CurrentRandomImages = this.RandomImagesSource.asObservable();
  CurrentSelectedBatchId = this.SelectedBatchIdSource.asObservable();
  CurrentReasonForLeaving = this.ReasonForLeavingSource.asObservable();

  CurrentNewsNEventId = this.NewsNEventIdSource.asObservable();
  CurrentPagesData = this.PagesDataSource.asObservable();
  CurrentUploadType = this.UploadTypeSource.asObservable();  
  CurrentFeeNames = this.FeeNamesSource.asObservable();  
  CurrentLanguageSubjectLower = this.LanguageSubjectLowerSource.asObservable();
  CurrentLanguageSubjectUpper = this.LanguageSubjectUpperSource.asObservable();
  CurrentFeeType = this.FeeTypeSource.asObservable();
  CurrentSection = this.SectionSource.asObservable();
  CurrentPrimaryContact = this.PrimaryContactSource.asObservable();
  CurrentMasterData = this.MasterDataSource.asObservable();
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
  CurrentStudentName = this.StudentNameSource.asObservable();

  constructor() {
  }
  ngOnInit() {

  }
  ChangeRandomImages(item){
    this.RandomImagesSource.next(item);
  }
  ChangeSelectedBatchId(item){
    this.SelectedBatchIdSource.next(item);
  }
  ChangeReasonForLeaving(item){
    this.ReasonForLeavingSource.next(item);
  }
  ChangeNewsNEventId(item)
  {
    this.NewsNEventIdSource.next(item);
  }
  ChangePageData(item)
  {
    this.PagesDataSource.next(item);
  }
  ChangeUploadType(item)
  {
    this.UploadTypeSource.next(item);
  }
  ChangeStudentName(item)
  {
    this.StudentNameSource.next(item);
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
    this.StudentClassIdSource.next(item);
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