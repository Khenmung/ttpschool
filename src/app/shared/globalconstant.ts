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
            "school":[{
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
                "LANGUAGESUBJECTLOWERCLS": "language subject lower",
                "LANGUAGESUBJECTUPPERCLS": "language subject upper",
                "FEENAME": "fee name",
                "UPLOADTYPE": "upload type",
                "DOWNLOADTYPE": "download type",
                "DOCUMENTTYPE": "document type",
                "CURRENTBATCH": "current batch",
                "REASONFORLEAVING": "reason for leaving",
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
}