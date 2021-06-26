import { ListItemComponent } from "ng-material-multilevel-menu/lib/list-item/list-item.component";
import { NaomitsuService } from "./databaseService";
import { List } from "./interface";

export class globalconstants {
    public static apiUrl: string = "http://localhost:8090";//"https://ettest.ttpsolutions.in";//
    public static fileUrl: string = '';
    public static RequestLimit = 20971520; //536870912;
    public static TrialPeriod = 30;
    public static MasterDefinitions = [
        {
            "application": [{
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
                "CLASSGROUP":"class group",
                "SUBJECTMARKCOMPONENT":"subject mark component",
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
        private dataservice: NaomitsuService
    ) {

    }
    public static getStandardFilter(token) {

        var filterstr = ' and OrgId eq ' + token[0]["orgId"];
        return filterstr;

    }
    
}