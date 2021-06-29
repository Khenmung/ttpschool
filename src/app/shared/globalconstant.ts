import { ListItemComponent } from "ng-material-multilevel-menu/lib/list-item/list-item.component";
import { NaomitsuService } from "./databaseService";
import { List } from "./interface";
import { SharedataService } from "./sharedata.service";

export class globalconstants {
    public static apiUrl: string = "http://localhost:8090";//"https://ettest.ttpsolutions.in";//
    public static fileUrl: string = '';
    public static RequestLimit = 20971520; //536870912;
    public static TrialPeriod = 30;
    public static Pages =[
        {
            'AUTH':{
                'CHANGEPASSWORD':'change password',
                'LOGIN':'login',
                'REGISTER':'register'

            },
            "CONTROL":{
                "BATCHDASHBOARD":'batch dashboard',
                'APPLICATIONFEATUREPERMISSION':'application feature permission',
                'ROLEUSER':'role user',
                'USERS':'users',
                'MASTERS':'masters'
            },
            'EXAMS':{
                'EXAMS':'exams',
                'EXAMSLOT': 'exam slot',
                'EXAMSTUDENTSUBJECTRESULT':'exam student subject result',
                'SLOTNCLASSSUBJECT':'slot n class subject',
                
            },
            'SUBJECT':{
                    'CLASSSUBJECTMAPPING':'class subject mapping',
                    'SUBJECTMARKCOMPONENT':'subject mark component',
                    'STUDENTCLASS':'student class',
                    'STUDENTSUBJECT':'student subject',
                    'SUBJECTTYPES':'subject types',

            },
            'FEES':{
                'CLASSFEE':'class fee',
                'EXCELDATAUPLOAD':'excel data upload',
                'SINGLEFEERECEIPT':'single fee receipt',
                'FEECOLLECTIONREPORT':'fee collection report',
                'TODAYCOLLECTIONREPORT':'today collection report',
                'SINGLESTUDENT':'single student',
                'SINGLESTUDENTCLASS':'single student class',
                'SINGLESTUDENTDOCUMENT':'single student document',
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
                "APPLICATION": "application",
                "ROLE": "role"
            }]
        },
        {
            "school": [{
                "GENDER": "gender",
                "RELIGION": "religion",
                "CITY": "city",
                "STATE": "state",
                "COUNTRY": "country",
                "CATEGORY": "category",
                "BLOODGROUP": "blood group",
                "PRIMARYCONTACT": "primary contact",
                "CLASS": "class",
                "BATCH": "batch",
                "FEETYPE": "fee type",
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
    public static getStandardFilterWithBatchId(token,shareddata) {

        var _selectedBathId =0;
        shareddata.CurrentSelectedBatchId.subscribe(c=>_selectedBathId =c);
        var filterstr = 'BatchId eq ' + _selectedBathId + ' and OrgId eq ' + token[0]["orgId"];
        return filterstr;

    }
    public static getStandardFilter(token) {

        var filterstr = 'OrgId eq ' + token[0]["orgId"];
        return filterstr;

    }
    public static getPermission(token,shareddata, feature) {
        var checkBatchIdNSelectedId = 0;
        
        shareddata.CurrentSelectedNCurrentBatchIdEqual.subscribe(t => checkBatchIdNSelectedId = t);
        //user is viewing old data
        if (checkBatchIdNSelectedId == 1)
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