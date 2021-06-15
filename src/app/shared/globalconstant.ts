import { TokenStorageService } from "../_services/token-storage.service";
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
                "SUBJECT": "subject",
                "SUBJECTTYPE": "subject type",
                "RANDOMIMAGE": "random image"
            }]
        }
    ];
    public static PERMISSIONTYPES = [
        { 'type': 'full', 'val': 1 },
        { 'type': 'rw', 'val': 2 },
        { 'type': 'read', 'val': 3 }
    ];
    public static getCurrentBatch() {
        let currentyear = new Date().getFullYear();
        return currentyear.toString() + "-" + (currentyear + 1).toString();
    }
    constructor(
        private dataservice: NaomitsuService
    ) {

    }
    // ngOnInit(): void {
    //     //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //     //Add 'implements OnInit' to the class.

    // }
    public static getStandardFilter(token) {

        var filterstr = ' and OrgId eq ' + token[0]["orgId"];
        return filterstr;

    }
    
}