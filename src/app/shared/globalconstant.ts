import { ListItemComponent } from "ng-material-multilevel-menu/lib/list-item/list-item.component";
import { TokenStorageService } from "../_services/token-storage.service";
import { NaomitsuService } from "./databaseService";
import { List } from "./interface";
import { SharedataService } from "./sharedata.service";

export class globalconstants {
    public static apiUrl: string = "http://localhost:8090";//"https://ettest.ttpsolutions.in";//"http://localhost:44394";//
    public static fileUrl: string = '';
    public static RequestLimit = 20971520; //536870912;
    public static TrialPeriod = 30;
    public static Pages = [
        {
            'AUTH': {
                'CHANGEPASSWORD': 'change password',
                'LOGIN': 'login',
                'REGISTER': 'register'

            },
            "CONTROL": {
                "BATCHDASHBOARD": 'batch dashboard',
                'APPLICATIONFEATUREPERMISSION': 'application feature permission',
                'ROLEUSER': 'role user',
                'USERS': 'users',
                'MASTERS': 'masters'
            },
            'EXAMS': {
                'EXAMS': 'exams',
                'EXAMSLOT': 'exam slot',
                'EXAMSTUDENTSUBJECTRESULT': 'exam student subject result',
                'SLOTNCLASSSUBJECT': 'slot n class subject',

            },
            'SUBJECT': {
                'CLASSSUBJECTMAPPING': 'class subject mapping',
                'SUBJECTMARKCOMPONENT': 'subject mark component',
                'ASSIGNSTUDENTCLASS': 'assign student class',
                'STUDENTSUBJECT': 'student subject',
                'SUBJECTTYPES': 'subject types',
                'STUDENTPROMOTE': 'promote student'

            },
            'FEES': {
                'CLASSFEE': 'class fee',
                'EXCELDATAUPLOAD': 'excel data upload',
                'SINGLEFEERECEIPT': 'single fee receipt',
                'FEECOLLECTIONREPORT': 'fee collection report',
                'TODAYCOLLECTIONREPORT': 'today collection report',
                'SINGLESTUDENT': 'single student',
                'SINGLESTUDENTCLASS': 'single student class',
                'SINGLESTUDENTDOCUMENT': 'single student document',
                'SINGLEFEEPAYMENT': 'single student fee payment'
            }
        }
    ]
    public static MasterDefinitions = [
        {
            "applications": [{
                "ORGANIZATION": "organization",
                "LOCATION": "location",
                "DEPARTMENT": "department",
                "APP": "application",
                "ROLE": "role"
            }]
        },

        {
            "school": [{
                "SCHOOLGENDER": "school gender",
                "RELIGION": "religion",
                "CITY": "city",
                "STATE": "state",
                "COUNTRY": "country",
                "CATEGORY": "category",
                "BLOODGROUP": "blood group",
                "PRIMARYCONTACT": "primary contact",
                "CLASS": "class",
                "BATCH": "batch",
                "SECTION": "section",
                "CLASSGROUP": "class group",
                "SUBJECTMARKCOMPONENT": "subject mark component",
                "LANGUAGESUBJECTLOWERCLS": "language subject lower",
                "LANGUAGESUBJECTUPPERCLS": "language subject upper",
                "FEENAME": "fee name",
                "UPLOADTYPE": "upload type",
                "DOWNLOADTYPE": "download type",
                "DOCUMENTTYPE": "document type",
                "CURRENTBATCH": "current batch",
                "REASONFORLEAVING": "reason for leaving",
                "EXAMNAME": "exam name",
                "EXAMSLOTNAME": "exam slot name",
                "EXAMSTATUS": "exam status",
                "SUBJECT": "subject",
                "SUBJECTTYPE": "subject type",
                "ATTENDANCESTATUS": "attendance status"
            }]
        },
        {
            "employee": [{
                "EMPLOYEEGENDER": "employee gender",
                "EMPLOYMENTTYPE": "employment type",
                "NATURE": "nature",
                "MARITALSTATUS": "marital status",
                "EMPLOYMENTSTATUS": "employment status",
                "WORKACCOUNT": "work account",
                "JOBTITLE": "job title",
                "DESIGNATION": "designation",
                "SALARYCOMPONENT": "salary component",
                "GRADE": "grade",
                "LEAVE": "leave",
                "LEAVESTATUS": "leave status",
                "CONFIGTYPE": "Variable config type",
                "COMPONENTTYPE": "salary component type",
            }]
        },
        {
            "VariableName": [
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
            ]
        }
    ];
    public static PERMISSIONTYPES = [
        { 'type': 'rwd', 'val': 1 },
        { 'type': 'rw', 'val': 2 },
        { 'type': 'read', 'val': 3 },
        { 'type': 'denied', 'val': 4 }
    ];

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
    public static getYears(){
        var currentYear =  new Date().getFullYear();
        return [currentYear-1,currentYear,currentYear+1];
    }
    public static getMonths(){

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
    public static getPermission(token, tokenservice: TokenStorageService, feature: any) {
        var checkBatchIdNSelectedId = 0;
        checkBatchIdNSelectedId = +tokenservice.getCheckEqualBatchId();
        //shareddata.CurrentSelectedNCurrentBatchIdEqual.subscribe(t => checkBatchIdNSelectedId = t);
        //user is viewing old data
        if (checkBatchIdNSelectedId == 1 && feature.toLowerCase().indexOf('promote') == -1)
            return 'read';
        else {
            var _permission = token[0]["applicationRolePermission"].filter(r => r.applicationFeature.toLowerCase().trim() == feature.toLowerCase().trim());
            if (_permission.length > 0)
                return _permission[0].permission;
            else
                return 'deny';
        }
    }
}