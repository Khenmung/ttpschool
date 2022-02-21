//import { ListItemComponent } from "ng-material-multilevel-menu/lib/list-item/list-item.component";
import { TokenStorageService } from "../_services/token-storage.service";
import { NaomitsuService } from "./databaseService";
import { List } from "./interface";
import { SharedataService } from "./sharedata.service";

export class globalconstants {
    ////"https://api.ttpsolutions.in";
    public static apiUrl: string = "http://localhost:8020";//"https://ettest.ttpsolutions.in";//"http://localhost:44394";//
    public static fileUrl: string = '';
    public static RequestLimit = 20971520; //536870912;
    public static TrialPeriod = 30;
    public static AppAndMenuAndFeatures =
        {
            'edu': {
                'control': {},
                'classcourse': { 'detail': 'detail', 'fee': 'fee', 'prerequisite': 'prerequisite', 'master': 'master' },
                'subject': {
                    'subjecttype': 'subjecttype',
                    'subjectdetail': 'subjectdetail',
                    'subjectcomponent': 'subjectcomponent',
                    'classstudent': 'classstudent',
                    'subjectstudent': 'subjectstudent'
                },
                'examination': {
                    'exam': 'exam',
                    'examslot': 'examslot',
                    'subjectinslot': 'subjectinslot',
                    'examsubjectmark': 'examsubjectmark',
                    'studentactivity': 'studentactivity'
                },
                'timetable': {
                    'classperiod': 'classperiod',
                    'timetable': 'timetable',
                },
                'attendance': {
                    'studentattendance': 'studentattendance'
                },
                'student': {
                    'detail': 'detail',
                    'feepayment': 'feepayment'
                },
                'reportconfiguration': {},
                'exceldataupload': {
                    'uploadstudent': 'uploadstudent',
                    'uploadteacher': 'uploadteacher',
                },
                'report': {
                    'studentreport': 'studentreport',
                    'teacherreport': 'teacherreport',
                }
            },
            'employee': {

            }
        };
    public static Pages =
        {
            "website": {
                "website": "web site",
                "view": 'view',
                "editor": 'editor',
                "pagelist": 'page list',
                "newsdashboard": 'news dashboard',
                "album": 'album',
                "carousel": 'carousel',
                "filedragAndDrop": 'Image drag and drop',
                "photo": 'photo',
                "photobrowser": 'photo browser'
            },
            "globaladmin": {
                "GLOBALADMIN": "globaladmin",
                "ADMINROLEFEATURE": 'Admin Role Permission',
                "PLAN": 'plan',
                "PLANFEATURE": 'plan feature',
                "CUSTOMERINVOICE": 'customer invoice',
                "CUSTOMERPLAN": 'customer plan',
                "MASTERDATA": 'master data',
                "CUSTOMERINVOICECOMPONENT": 'invoice components',
                "REPORTCONIG": 'report config',
                "MENUCONFIG": 'menu config',
                "PLANANDMASTERDATA": 'Plan n Master Item',
                "ORGANIZATIONPAYMENT": 'organization payment'
            },
            "common": {
                'AUTH': {
                    'CHANGEPASSWORD': 'change password',
                    'LOGIN': 'login',
                    'REGISTER': 'register'

                },
                "CONTROL": {
                    'CONTROL': 'control',
                    "BATCHDASHBOARD": 'batch',
                    'APPLICATIONFEATUREPERMISSION': 'Role Feature Permission',
                    'ROLEUSER': 'role user',
                    'USERS': 'user',
                    'MASTERS': 'Essential Data',
                    'ORGANIZATION': 'organization'
                },
                "misc": {
                    "MISC": "misc",
                    "CALENDAR": "calendar",
                    "NEWS": "news",
                    "EVENT": "event",
                    "HOLIDAY": "holiday"
                }
            },
            "emp": {
                "employee": {
                    "EMPLOYEE": "employee",
                    "EMPLOYEEDETAIL": "employee detail",
                    "SALARY": "salary",
                    "DOCUMENT": "employee document",
                    "EDUCATIONHISTORY": "education history",
                    "WORKHISTORY": "work history",
                    "EMPLOYEESKILL": "employee skill",
                    "FAMILY": "family",
                    "ATTENDANCE": "attendance",
                    "EMPLOYMENTHISTORY": "employment history",
                    "EMPLOYEEPROFILE": "employee profile"
                }
            },
            "edu": {
                'STUDENT': {
                    'STUDENT': 'student',
                    'SEARCHSTUDENT': 'search student',
                    'STUDENTDETAIL': 'student detail',
                    'STUDENTCLASS': 'student class',
                    'GENERATECERTIFICATE': 'generate certificate',
                    'DOCUMENT': 'documents',
                    'ATTENDANCEREPORT': 'student attendance',
                    'PROGRESSREPORT': 'progress report',
                    'FEEPAYMENT': 'fee payment',
                    'FEERECEIPT': 'fee receipt',
                    'STUDENTAPROFILE': 'student profile'
                },
                "CLASSCOURSE": {
                    'CLASSCOURSE': 'class-course',
                    'CLASSDETAIL': 'classdetail',
                    'CLASSFEE': 'class fee',
                    'FEEDEFINITION': 'fee definition',
                    'FEETYPE': 'fee type',
                    'PREREQUISITE': 'pre-requisite',
                    'CLASSMASTER': 'class master'
                },
                'EXAM': {
                    'EXAM': 'Exam',
                    'EXAMSLOT': 'exam slot',
                    'EXAMSTUDENTSUBJECTRESULT': 'Exam Result Entry',
                    'SLOTNCLASSSUBJECT': 'slot n class subject',
                    'VERIFYRESULT': 'verify result',

                },
                'SUBJECT': {
                    'SUBJECT': 'class subject',
                    'CLASSSUBJECTDETAIL': 'class subject detail',
                    'STUDENTSUBJECT': 'student subject',
                    'SUBJECTMARKCOMPONENT': 'subject mark component',
                    'CLASSSTUDENT': 'class student',
                    'SUBJECTTYPE': 'subject type',
                    'PROMOTESTUDENT': 'promote student'
                },
                'TIMETABLE': {
                    'TIMETABLE': 'time table',
                    'CLASSPERIOD': 'class period',
                    'CLASSTIMETABLE': 'class time table'
                },
                'ATTENDANCE': {
                    'ATTENDANCE': 'attendance',
                    'STUDENTATTENDANCE': 'student attendance',
                    'TEACHERATTENDANCE': 'employee attendance'
                },
                'REPORT': {
                    'REPORT': 'report',
                    'EXAMTIMETABLE': 'exam time table',
                    'RESULT': 'result',
                    'FEEPAYMENTSTATUS': 'Fee Payment Status',
                    'DATEWISECOLLECTION': 'date wise collection',
                    'CHARTREPORT': 'Chart Report'
                },
                'DATA': {
                    'DATA': 'data',
                    'DOWNLOAD': 'download data',
                    'UPLOAD': 'upload data',
                },
                'REPORTCONFIGURATION': {
                    'REPORTCONFIGURATION': 'report configuration',
                    'REPORTNAME': 'report name',
                    'REPORTCOLUMN': 'report column',
                    'VARIABLECONFIG': 'variable config',
                }
            },
            "accounting": {
                "ACCOUNTING": "accounting",
                "VOUCHER": "voucher",
                "TRIALBALANCE": "trial balance",
                "LEDGERACCOUNT": "ledger account"
            }
        }

    public static MasterDefinitions =
        {

            "common": {
                "CURRENCY": "currency",
                "RELIGION": "religion",
                "CITY": "city",
                "STATE": "state",
                "COUNTRY": "country",
                "CATEGORY": "category",
                "BLOODGROUP": "blood group",
                "HOLIDAYLIST": "holiday type",
            },
            "ttpapps": {
                "REPORTNAMES": "ttp report name",
                "ORGANIZATION": "organization",
                "LOCATION": "location",
                "DEPARTMENT": "department",
                "TTPAPP": "application",
                "bang": "application",
                //"ROLE": "role",
                "INVOICECOMPONENT": "invoice component",
                "PAYMENTSTATUS": "payment status"
            },
            "school": {
                "RESTRICTION": "information restriction",
                "REPORTNAMES": "edu report name",
                "DURATION": "duration",
                "STUDYAREA": "study area",
                "STUDYMODE": "study mode",
                "PERIODTYPE": "period type",
                "WEEKDAYS": "week days",
                "PERIOD": "school period",
                "COMMONFOOTER": "common footer",
                "COMMONHEADER": "common header",
                "COMMONSTYLE": "common style",
                "CERTIFICATETYPE": "certificate type",
                "STUDENTGRADE": "student grade",
                "RECEIPTHEADING": "receipt heading",
                "SCHOOLGENDER": "school gender",
                "PRIMARYCONTACT": "primary contact",
                "BATCH": "batch",
                "SECTION": "section",
                "HOUSE": "house",
                "CLASSGROUP": "class group",
                "SUBJECTMARKCOMPONENT": "subject mark component",
                "LANGUAGESUBJECTLOWERCLS": "language subject lower",
                "LANGUAGESUBJECTUPPERCLS": "language subject upper",
                "FEENAME": "fee name",
                "UPLOADTYPE": "student upload type",
                "DOWNLOADTYPE": "download type",
                "STUDENTDOCUMENTTYPE": "student document type",
                "CURRENTBATCH": "current batch",
                "REASONFORLEAVING": "reason for leaving",
                "EXAMNAME": "exam name",
                "EXAMSLOTNAME": "exam slot name",
                "EXAMSTATUS": "exam status",
                "SUBJECT": "subject",
                "SUBJECTTYPE": "subject type",
                "ATTENDANCESTATUS": "attendance status",
                "ROLLNOGENERATION": "Roll No Generation",
                "CLASSPROMOTION": "class promotion",
                "FEEPAYMENTTYPE": "fee payment type",
                "FEETYPE": "fee type",
                "ACTIVITYCATEGORY": "profile category",
                "ACTIVITYSUBCATEGORY": "profile sub category",
                "ROLE": "role",
                "FEECATEGORY": "fee category"

            },
            "leave": {
                "REPORTNAMES": "leave report name",
                "OPENADJUSTCLOSE": "open adjust close",
                "LEAVE": "employee leave",
                "LEAVESTATUS": "leave status"
            },
            "employee": {
                "REPORTNAMES": "employee report name",
                "EMPLOYEEGENDER": "employee gender",
                "EMPLOYMENTTYPE": "employment type",
                "NATURE": "work nature",
                "MARITALSTATUS": "marital status",
                "EMPLOYMENTSTATUS": "employment status",
                "WORKACCOUNT": "work account",
                "JOBTITLE": "job title",
                "DESIGNATION": "designation",
                "DEPARTMENT": "department",
                "SALARYCOMPONENT": "salary component",
                "GRADE": "grade",
                "GENDER": "employee gender",
                "CONFIGTYPE": "Variable config type",
                "COMPONENTTYPE": "salary component type",
                "DOCUMENTTYPE": "employee document type",
                "FAMILYRELATIONSHIP": "family relationship",
                "EMPLOYEESKILL": "employee skill",
                "EMPLOYEEACTIVITYCATEGORY": "employee activity category",
                "EMPLOYEEACTIVITYSUBCATEGORY": "employee activity sub category"
            },
            "StudentVariableName": [
                "Today",
                "StudentClass",
                "Section",
                "RollNo",
                "AdmissionDate",
                "StudentName",
                "FatherName",
                "MotherName",
                "Gender",
                "PermanentAddress",
                "PresentAddress",
                "WhatsAppNumber",
                "City",
                "State",
                "Country",
                "PinCode",
                "DOB",
                "BloodGroup",
                "Category",
                "BankAccountNo",
                "IFSCCode",
                "MICRNo",
                "AadharNo",
                "Religion",
                "ContactNo",
                "AlternateContact",
                "EmailAddress",
                "LastSchoolPercentage",
                "TransferFromSchool",
                "TransferFromSchoolBoard",
                "FatherOccupation",
                "FatherContactNo",
                "MotherContactNo",
                "MotherOccupation",
                "NameOfContactPerson",
                "RelationWithContactPerson",
                "ContactPersonContactNo",
                "Location",
                "ReasonForLeaving"
            ],
            "EmployeeVariableName": [
                "Grade",
                "Department",
                "CTC",
                "GradeFromDate",
                "GradeToDate",
                "ApprovedBy",
                "WorkAccount",
                "JobTitle",
                "Designation",
                "EmployeeId",
                "FirstName",
                "LastName",
                "FatherName",
                "MotherName",
                "Gender",
                "Address",
                "DOB",
                "DOJ",
                "City",
                "Pincode",
                "State",
                "Country",
                "Bloodgroup",
                "Category",
                "BankAccountNo",
                "IFSCcode",
                "MICRNo",
                "AdhaarNo",
                "Religion",
                "ContactNo",
                "AlternateContactNo",
                "EmailAddress",
                "Location",
                "EmploymentStatus",
                "EmploymentType",
                "Nature",
                "ConfirmationDate",
                "NoticePeriodDays",
                "ProbationPeriodDays",
                "PAN",
                "PassportNo",
                "MaritalStatus",
                "MarriedDate",
                "PFAccountNo",
                "Active",
                "EmployeeCode"
            ],
            "accounting": {
                "ACCOUNTNATURE": "account nature",
                "ACCOUNTGROUP": "account group"
            }
        }


    public static PERMISSIONTYPES = [
        { 'type': 'rwd', 'val': 1 },
        { 'type': 'rw', 'val': 2 },
        { 'type': 'read', 'val': 3 },
        { 'type': 'deny', 'val': 4 }
    ];
    //public static 
    constructor(
        private dataservice: NaomitsuService,
        private shareddata: SharedataService
    ) {

    }
    public static getStandardFilterWithBatchId(tokenService) {

        var _selectedBathId = 0;
        var loginUserdetail = tokenService.getUserDetail();
        _selectedBathId = +tokenService.getSelectedBatchId();
        var filterstr = 'BatchId eq ' + _selectedBathId + ' and OrgId eq ' + loginUserdetail[0]["orgId"];
        return filterstr;

    }
    public static getStandardFilterWithPreviousBatchId(tokenService) {
        debugger;
        var _previousBathId = 0;
        var loginUserdetail = tokenService.getUserDetail();
        _previousBathId = +tokenService.getPreviousBatchId();
        var filterstr = ''
        if (_previousBathId > -1)
            filterstr = 'BatchId eq ' + _previousBathId + ' and OrgId eq ' + loginUserdetail[0]["orgId"];
        else
            filterstr = 'OrgId eq ' + loginUserdetail[0]["orgId"];
        return filterstr;

    }
    public static getYears() {
        var currentYear = new Date().getFullYear();
        return [currentYear - 1, currentYear, currentYear + 1];
    }
    public static getMonths() {

        return [
            { month: 'Jan', val: 1 },
            { month: 'Feb', val: 2 },
            { month: 'Mar', val: 3 },
            { month: 'Apr', val: 4 },
            { month: 'May', val: 5 },
            { month: 'Jun', val: 6 },
            { month: 'Jul', val: 7 },
            { month: 'Aug', val: 8 },
            { month: 'Sep', val: 9 },
            { month: 'Oct', val: 10 },
            { month: 'Nov', val: 11 },
            { month: 'Dec', val: 12 },
        ];
    }
    public static getStandardFilter(userDetail) {

        var filterstr = 'OrgId eq ' + userDetail[0]["orgId"];
        return filterstr;

    }

    public static getPermission(tokenservice: TokenStorageService, feature: any) {
        var checkBatchIdNSelectedId = 0;
        var loginUserDetail = tokenservice.getUserDetail();
        checkBatchIdNSelectedId = +tokenservice.getCheckEqualBatchId();

        //shareddata.CurrentSelectedNCurrentBatchIdEqual.subscribe(t => checkBatchIdNSelectedId = t);
        //user is viewing old data
        if (checkBatchIdNSelectedId == 0 && feature.toLowerCase().indexOf('promote') == -1)
            return ['read'];
        else {
            var _permission = loginUserDetail[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == feature.toLowerCase().trim());
            if (_permission.length > 0)
                return [_permission[0]];
            else
                return [];
        }
    }
    GetApplicationRolesPermission(tokenservice: TokenStorageService, Applications: any[]) {

        let list: List = new List();
        list.fields = [
            'PlanFeatureId',
            'RoleId',
            'PermissionId'
        ];
        var _UserDetail = [];
        var _RoleFilter = tokenservice.getRoleFilter();
        list.PageName = "ApplicationFeatureRolesPerms";
        list.lookupFields = ["PlanFeature($filter=Active eq 1;$select=PageId;$expand=Page($select=PageTitle,label,link,faIcon,ApplicationId,ParentId))"]
        list.filter = ["Active eq 1 " + _RoleFilter];

        this.dataservice.get(list)
            .subscribe((data: any) => {
                //debugger;
                if (data.value.length > 0) {
                    var _applicationName = '';
                    var _appShortName = '';
                    _UserDetail["applicationRolePermission"] = [];
                    data.value.forEach(item => {
                        _applicationName = '';
                        _appShortName = '';
                        _applicationName = Applications.filter(f => f.MasterDataId == item.PlanFeature.Page.ApplicationId)[0].Description;
                        _appShortName = Applications.filter(f => f.MasterDataId == item.PlanFeature.Page.ApplicationId)[0].MasterDataName

                        var _permission = '';
                        if (item.PermissionId != null)
                            _permission = globalconstants.PERMISSIONTYPES.filter(a => a.val == item.PermissionId)[0].type
                        debugger;

                        _UserDetail[0]["applicationRolePermission"].push({
                            'planFeatureId': item.planFeatureId,
                            'applicationFeature': item.PlanFeature.Page.PageTitle,//_applicationFeature,
                            'roleId': item.RoleId,
                            'permissionId': item.PermissionId,
                            'permission': _permission,
                            'applicationName': _applicationName,
                            'applicationId': item.PlanFeature.Page.ApplicationId,
                            'appShortName': _appShortName,
                            'faIcon': item.PlanFeature.Page.faIcon,
                            'label': item.PlanFeature.Page.label,
                            'link': item.PlanFeature.Page.link
                        });

                    });
                    //tokenservice.saveUserdetail(this.UserDetail);
                }
            })
    }

}