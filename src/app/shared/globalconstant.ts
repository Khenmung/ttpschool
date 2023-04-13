//import { ListItemComponent } from "ng-material-multilevel-menu/lib/list-item/list-item.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "src/environments/environment";
import { TokenStorageService } from "../_services/token-storage.service";
import { NaomitsuService } from "./databaseService";
import { List } from "./interface";

export class globalconstants {
    //////"https://api.ttpsolutions.in";"https://ettest.ttpsolutions.in"; environment.apiU+++.*-=-0983`9556'nb656RL
    public static apiUrl: string = "https://api.ttpsolutions.in"; //"https://api.ttpsolutions.in";//"http://localhost:5000";
    public static fileUrl: string = '';
    public static CompanyParentId = 31850;//31850;// 27762; //536870912; 
    public static PremiumPlusId = 5;//5;//2 
    public static globalAdminBillingSubOrgId = 30880;//5;//2 
    
    //public static BloodGroupParentId = 27762; //536870912;
    public static RequestLimit = 20971520; //536870912;
    public static CommonPanelID = 329; //536870912;    
    public static RowUploadLimit = 1000; //536870912;
    public static TrialPeriod = 3;
    public static BlueBackground = { duration: 3000, panelClass: 'blue-snackbar' };
    public static RedBackground = { duration: 10000, panelClass: 'red-snackbar' };
    public static GreenBackground = { duration: 10000, panelClass: 'green-snackbar' };
    public static AddedMessage = 'Data saved sucessfully.';
    public static UpdatedMessage = 'Data updated sucessfully.';
    public static DeletedMessage = 'Data deleted sucessfully.';
    public static RecordAlreadyExistMessage = 'Record already exists!';
    public static NoRecordFoundMessage = 'No record found!';
    public static NoEvaluationRecordFoundMessage = 'No evaluation record found!';
    public static UserLoginCreated = 'User login created! Please check your email for email verification.';
    public static TechnicalIssueMessage = 'There is a technical issue! Please contact your administrator.';
    public static PermissionDeniedMessage = 'Permission Denied!';
    public static ActionText = 'X';
    public static ExamGrading = 'Grading';
    public static ExamMarkingNGrading = 'MarkingNGrading';
    public static BuildCommand = "ng build --configuration production --aot=true --build-optimizer=true --output-Hashing=all";
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
                'studentdetail': {
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
                "notice": 'notice',
                "album": 'folder',
                "carousel": 'carousel',
                "UploadImage": 'upload image',
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
                "ORGANIZATIONPAYMENT": 'organization payment',
                "CUSTOMERPLANFEATURE": 'customer plan feature'
            },
            "common": {
                'AUTH': {
                    'CHANGEPASSWORD': 'change password',
                    'LOGIN': 'login',
                    'REGISTER': 'register'

                },
                "CONTROL": {
                    'INITIALSETTING': 'initial setting',
                    "BATCHDASHBOARD": 'batch',
                    'APPLICATIONFEATUREPERMISSION': 'Role Feature Permission',
                    'ROLEUSER': 'role user',
                    'USERS': 'user',
                    'MASTERS': 'Essential Data',
                    'ORGANIZATION': 'organization',
                    'MYPLAN': 'my plan',
                    'CUSTOMFEATUREPERMISSION': 'custom feature permission',
                    'INVOICENRECEIPT': 'invoice n receipt'
                },
                "misc": {
                    "FRONTOFFICE": "front office",
                    "CALENDAR": "calendar",
                    "NEWS": "news",
                    "EVENT": "event",
                    "HOLIDAY": "holiday",
                    "NOOFSTUDENT": "no of students",
                    "CREATEHTMLPAGE": "create page",
                    "RULESORPOLICYREPORT": "rules or policies"
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
                },
                "employeeactivity": {
                    "EMPLOYEEACTIVITY": "employee activity",
                    "ACTIVITY": "activity"
                },
                "employeeattendance": {
                    "EMPLOYEEATTENDANCE": "employee attendance",
                    "ATTENDANCEREPORT": "attendance report"
                }
            },
            "edu": {
                'Admission': {
                    'ADMISSION': 'Admission',
                    'PROMOTESTUDENT': 'Promote Student',
                    'AssignClass': 'Assign Class'
                },
                'STUDENT': {
                    'STUDENT': 'student',
                    'SEARCHSTUDENT': 'search student',
                    'STUDENTDETAIL': 'student detail',
                    'STUDENTCLASS': 'student class',
                    'ATTENDANCEREPORT': 'student attendance record',
                    'PROGRESSREPORT': 'progress report',
                    'FEEPAYMENT': 'fee payment',
                    'FEERECEIPT': 'fee receipt',
                    'STUDENTAPROFILE': 'student profile',
                    'STUDENTVIEW': 'student view',
                },
                "SPECIALFEATURE": {
                    'GENERATECERTIFICATE': 'generate certificate',
                    'DOCUMENT': 'documents',
                    'STUDENTGROUP': 'group activity',
                    'SIBLINGSNFRIENDS': 'siblings n friends',
                    'ACTIVITY': 'student activity',
                    'GROUPPARTICIPANT': 'group participant',
                    'ACHIEVEMENTNPOINT': 'achievement and point',
                    'GROUPPOINT': 'group point',
                    'CERTIFICATECONFIG': 'certificate config'
                },
                "CLASSCOURSE": {
                    'CLASSCOURSE': 'class-course',
                    'CLASSDETAIL': 'classdetail',
                    'CLASSFEE': 'class fee',
                    'FEEDEFINITION': 'fee definition',
                    'FEETYPE': 'fee type',
                    'CLASSGROUP': 'class group',
                    'CLASSTEACHER': 'class teacher',
                    'CLASSEVALUATION': 'class evaluation',
                    'CLASSGROUPING': 'class grouping'
                },
                "COLLECTION": {
                    'ALBUM': 'album',
                    'PHOTO': 'photo',
                    'CAROUSEL': 'carousel',
                    'UPLOADIMAGE': 'upload image',
                    'PHOTOBROWSER': 'photo browser'
                },
                'EXAM': {
                    'EXAM': 'Exam',
                    'EXAMSLOT': 'exam slot',
                    'ExamMarkEntry': 'Exam Mark Entry',
                    'SLOTNCLASSSUBJECT': 'slot n class subject',
                    'VERIFYRESULT': 'verify result',
                    'STUDENTGRADE': 'student grade',
                    'VERIFYRESULTSTATUS': 'verify result status',
                    'EXAMNCALCULATE': 'exam n calculate',
                    'EXAMMARKCONFIG': 'exam mark config',
                    'EXAMCLASSGROUPMAP': 'exam class group'
                },
                'SUBJECT': {
                    'SUBJECT': 'class subject',
                    'CLASSSUBJECTDETAIL': 'class subject detail',
                    'STUDENTSUBJECT': 'student subject',
                    'STUDENTSUBJECTREPORT': 'student subject report',
                    'SUBJECTMARKCOMPONENT': 'subject mark component',
                    'CLASSSTUDENT': 'class student',
                    'SUBJECTTYPE': 'subject type',
                    'TEACHERSUBJECT': 'teacher subject',

                },
                'TIMETABLE': {
                    'TIMETABLE': 'time table',
                    'CLASSPERIOD': 'class period',
                    'CLASSTIMETABLE': 'class time table',
                    'TEACHERSUBJECT': 'teacher subject',
                    'TEACHERPERIOD': 'teacher period',
                    'TEACHEROFFPERIOD': 'teacher off period',
                    'DAILYTIMETABLEREPORT': 'daily time table'
                },
                'ATTENDANCE': {
                    'ATTENDANCE': 'attendance',
                    'STUDENTATTENDANCE': 'student attendance',
                    'STUDENTATTENDANCERECORD': 'student attendance record',
                    'STUDENTTOTALATTENDANCE': 'student total attendance',
                    'ATTENANCECOUNT': 'attendance count',
                    'ATTENANCELIST': 'Absent list',
                    'ATTENANCEPERCENT': 'attendance percent',
                    'DEFAULTER': 'defaulter',
                    'ATTENDANCEREPORT': 'attendance report'
                },
                'EVALUATION': {
                    'EVALUATION': 'evaluation',
                    'EvaluationExamMap': 'evaluation exam',
                    'EVALUATIONQUESTIONNAIRE': 'evaluation questionnaire',
                    'EXECUTEEVALUATION': 'execute evaluation',
                    'EVALUATIONTYPE': 'evaluation type',
                    'EVALUATIONRESULT': 'evaluation result',
                    'EVALUATIONRESULTLIST': 'evaluation result list',
                    'CLASSEVALUATIONOPTION': 'answer option',
                    'EVALUATIONANDEXAM': 'evaluation and exam',
                    'EVALUATIONCONTROL': 'evaluation control'
                },
                'QUESTIONBANK': {
                    'QUESTIONBANK': 'question bank',
                    'QUESTION': 'question',
                    'SYLLABUS': 'syllabus',
                    'QUESTIONANDEXAM': 'question n exam',
                    'QUESTIONANDEXAMREPORT': 'question n exam report'
                },
                'REPORT': {
                    'REPORT': 'report',
                    'EXAMTIMETABLE': 'exam time table',
                    'RESULT': 'exam result',
                    'FEEPAYMENTSTATUS': 'Fee Payment Status',
                    'DATEWISECOLLECTION': 'date wise collection',
                    'CHARTREPORT': 'Chart Report',
                    'STUDENTPROFILEREPORT': 'student profile report',
                    'PRINTPROGRESSREPORT': 'print progress report'
                },
                'DATA': {
                    'DATA': 'data',
                    'DOWNLOAD': 'download data',
                    'UPLOAD': 'upload data',
                },
                'REPORTCONFIGURATION': {
                    'REPORTCONFIGURATION': 'field configuration',
                    'REPORTNAME': 'Module name',
                    'REPORTCOLUMN': 'Module column',
                    'VARIABLECONFIG': 'variable config',
                }
            },
            "accounting": {
                "ACCOUNTING": "accounting",
                "JOURNALENTRY": "journal entry",
                "TRIALBALANCE": "trial balance",
                "ACCOUNTS": "accounts",
                "LEDGERBALANCE": "ledger balance",
                "ACCOUNTNATURE": "account nature",
                "INCOMESTATEMENT": "income statement",
                "BALANCESHEET": "balance sheet"
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
                "ROLE": "role",
                "CONFIGTYPE": "Variable config type",
                "ACTIVITYNAME": "activity name",
                "ACTIVITYCATEGORY": "activity category",
                "ACTIVITYSESSION": "activity session",
                "PAGECATEGORY": "page category",
                "RULEORPOLICYCATEGORYDISPLAYTYPE": "rules or policy display type",
                "COMMONPRINTHEADING": "common print heading",
                "COMPANY": "company",
                "TABLENAMES": "table names"
            },
            "ttpapps": {
                "REPORTNAMES": "ttp report name",
                "ORGANIZATION": "organization",
                "LOCATION": "location",
                "DEPARTMENT": "department",
                "TTPAPP": "application",
                "bang": "application",
                "USERTYPE": "user type",
                "INVOICECOMPONENT": "invoice component",
                "PAYMENTSTATUS": "payment status"
            },
            "school": {
                "ADMISSIONSTATUS": "admission status",
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
                "STUDENTGROUP": "student group",
                "RECEIPTHEADING": "receipt heading",
                "SCHOOLGENDER": "school gender",
                "PRIMARYCONTACT": "primary contact",
                "CLUBS": "student club",
                "BATCH": "batch",
                "SECTION": "section",
                "HOUSE": "house",
                "CLASSGROUP": "class group",
                "CLASSGROUPTYPE": "class group type",
                "ATTENDANCEMODE": "attendance mode",
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
                "ATTENDANCESMODE": "attendance mode",
                "ROLLNOGENERATION": "Roll No Generation",
                "CLASSPROMOTION": "class promotion",
                "FEEPAYMENTTYPE": "fee payment type",
                "FEETYPE": "fee type",
                "QUESTIONNAIRETYPE": "questionnaire type",
                "FEECATEGORY": "fee category",
                "RATINGOPTION": "rating option",
                "EVALUATIONTYPE": "evaluation type",
                "SIBLINGSNFRIENDSRELATIONSHIP": "siblings n friends relationship",
                "SUBJECTCATEGORY": "subject category",
                "BOOKCONTENTUNIT": "book content unit",
                "ASSESSMENTPRINTHEADING": "Evaluation Print Heading",
                "STUDENTREMARKS": "student remark",
                "EXAMRESULTPROPERTY": "exam result property",
                "DIFFICULTYLEVEL": "question difficulty level",
                "POINTSCATEGORY": "points category"
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
                "EMPLOYEEGRADE": "employee grade",
                "GENDER": "employee gender",
                "COMPONENTTYPE": "salary component type",
                "DOCUMENTTYPE": "employee document type",
                "FAMILYRELATIONSHIP": "family relationship",
                "EMPLOYEESKILL": "employee skill",
                "EMPLOYEEPROFILECATEGORY": "employee profile category",
                "EMPLOYEEPROFILESUBCATEGORY": "employee profile sub category",
                "EMPLOYEEUPLOADTYPE": "employee upload type",
                "EMPLOYEEACTIVITYSESSION": "employee activity session",
                "EMPLOYEEACTIVITYCATEGORY": "employee activity category",
                "EMPLOYEEACTIVITY": "employee activity"
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
                "AccountHolderName",
                "BankAccountNo",
                "IFSCCode",
                "MICRNo",
                "AadharNo",
                "Religion",
                "PersonalNo",
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
                "ReasonForLeaving",
                "Attendance",
                "FeePaidTill",
                "Organization",
                "Address",
                "RegistrationNo",
                "StudentGroup",
                "Activity",
                "ActivityCategory",
                "ActivitySubCategory",
                "WebSite",
                "Batch",
                "House"
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
        private snackbar: MatSnackBar
    ) {

    }
    public static getOrgSubOrgBatchIdFilter(tokenService) {

        var _selectedBathId = 0;
        var loginUserdetail = tokenService.getUserDetail();
        _selectedBathId = +tokenService.getSelectedBatchId();
        var _subOrgId = +tokenService.getSubOrgId();
        var filterstr = 'OrgId eq ' + loginUserdetail[0]["orgId"] + " and SubOrgId eq " + _subOrgId + " and BatchId eq " + _selectedBathId;
        return filterstr;

    }
    public static getOrgSubOrgFilterWithPreviousBatchId(tokenService) {
        debugger;
        var _previousBathId = 0;
        var loginUserdetail = tokenService.getUserDetail();
        _previousBathId = +tokenService.getPreviousBatchId();
        var _subOrgId = +tokenService.getSubOrgId();
        var filterstr = ''
        if (_previousBathId > -1)
            filterstr = "OrgId eq " + loginUserdetail[0]["orgId"] + " and SubOrgId eq " + _subOrgId + " and BatchId eq " + _previousBathId;
        else
            filterstr = 'OrgId eq ' + loginUserdetail[0]["orgId"] + " and SubOrgId eq " + _subOrgId;
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
    public static getOrgSubOrgFilter(tokenService: TokenStorageService) {
        var loginUserdetail = tokenService.getUserDetail();
        var _subOrgId = +tokenService.getSubOrgId();
        var filterstr = 'OrgId eq ' + loginUserdetail[0]["orgId"] + " and SubOrgId eq " + _subOrgId;
        return filterstr;

    }
    public static formatError(err) {
        var errorMessage = '';
        var modelState;
        if (err != undefined) {
            if (err.error != undefined) {
                if (err.error.ModelState)
                    modelState = JSON.parse(JSON.stringify(err.error.ModelState));
                else
                    modelState = JSON.parse(JSON.stringify(err.error));
            }
            else if (err.Errors != undefined)
                modelState = JSON.parse(JSON.stringify(err.Errors));

            else
                modelState = JSON.parse(JSON.stringify(err));

        }
        //THE CODE BLOCK below IS IMPORTANT WHEN EXTRACTING MODEL STATE IN JQUERY/JAVASCRIPT
        for (var key in modelState) {
            if (modelState.hasOwnProperty(key) && (key.toLowerCase() == 'errors' || key.toLowerCase() == 'error')) {
                for (var key1 in modelState[key])
                    errorMessage += (errorMessage == "" ? "" : errorMessage + "<br/>") + modelState[key][key1];
            }
            else
                errorMessage += modelState[key];
        }
        return errorMessage;
    }
    public static getPermission(tokenservice: TokenStorageService, feature: any) {
        var IsInCurrentBatch = 0;
        var LoginUserDetail = tokenservice.getUserDetail();
        IsInCurrentBatch = +tokenservice.getInCurrentBatch();
        var selectedAppId = tokenservice.getSelectedAPPId();
        //return ['readonly'];
        // else {
        var _permission = LoginUserDetail[0]["applicationRolePermission"]
        .filter(r => r.applicationFeature.toLowerCase().trim() == feature.toLowerCase().trim());
        if (_permission.length > 0) {
            if (IsInCurrentBatch == 0)//not in current batch, 1 means user is in current batch.
            {
                _permission[0].permission = 'read';
            }
            return [_permission[0]];
        }
        else
            return [];
        //}
    }
    public static encodeSpecialChars(val) {
        var specialchars = globalconstants.SpecialCharEncodeCharacters()
        if (val != null && val.length > 0) {
            specialchars.forEach(f => {
                val = val.replaceAll(f.Text, f.UTF);
            });
        }
        return val;
    }
    public static decodeSpecialChars(val) {
        var specialchars = globalconstants.SpecialCharEncodeCharacters()
        if (val != null && val.length > 0) {
            specialchars.forEach(f => {
                val = val.replaceAll(f.UTF, f.Text);
            });
        }
        return val;
    }
    public static SpecialCharEncodeCharacters(): any[] {
        var textArray = [
            { Text: '!', Windows: '21%', UTF: '21%' },
            { Text: '"', Windows: '22%', UTF: '22%' },
            { Text: '#', Windows: '23%', UTF: '23%' },
            { Text: '$', Windows: '24%', UTF: '24%' },
            { Text: '%', Windows: '25%', UTF: '25%' },
            { Text: '&', Windows: '26%', UTF: '26%' },
            { Text: "'", Windows: '27%', UTF: '27%' },
            { Text: '(', Windows: '28%', UTF: '28%' },
            { Text: ')', Windows: '29%', UTF: '29%' },
            { Text: '*', Windows: '%2A', UTF: '%2A' },
            { Text: '+', Windows: '%2B', UTF: '%2B' },
            { Text: ',', Windows: '%2C', UTF: '%2C' },
            { Text: '-', Windows: '%2D', UTF: '%2D' },
            { Text: '.', Windows: '%2E', UTF: '%2E' },
            { Text: '/', Windows: '%2F', UTF: '%2F' },
            { Text: ':', Windows: '%3A', UTF: '%3A' },
            { Text: ';', Windows: '%3B', UTF: '%3B' },
            { Text: '<', Windows: '%3C', UTF: '%3C' },
            { Text: '=', Windows: '%3D', UTF: '%3D' },
            { Text: '>', Windows: '%3E', UTF: '%3E' },
            { Text: '?', Windows: '%3F', UTF: '%3F' }
        ]
        return textArray;
    }
    EscapeSpecialCharacter(str) {

        if ((str === null) || (str === ''))
            return false;
        else
            str = str.toString();

        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        var format = /[!@#$&%^&*_+\=\[\]{};:'"\\|<>]+/;
        return str.replace(format, function (m) { return map[m]; });
        //return str.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    public static MonthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
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