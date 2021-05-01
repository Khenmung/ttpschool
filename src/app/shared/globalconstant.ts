export class globalconstants {
    public static apiUrl: string = "http://localhost:8070";//"https://ettest.ttpsolutions.in";//
    public static fileUrl: string = '';
    public static MasterDefinitions=
        {
        "DOCUMENTTYPE":"document type",
        "ORGANIZATION":"organization",
        "LOCATION":"location",
        "DEPARTMENT":"department",
        "GENDER":"gender",
        "RELIGION":"religion",
        "CITY":"city",
        "STATE":"state",
        "COUNTRY":"country",
        "CATEGORY":"category",
        "BLOODGROUP":"blood group",
        "PRIMARYCONTACT":"primary contact",
        "CLASSES":"classes",
        "BATCH":"batch",
        "FEETYPE":"fee type",
        "SECTION":"section",
        "LANGUAGESUBJECTLOWERCLS":"language subject lower",
        "LANGUAGESUBJECTUPPERCLS":"language subject upper",
        "FEENAMES":"fee names",
        "UPLOADTYPE":"upload type",
        "DOWNLOADTYPE":"download type",
        "CURRENTBATCH":"current batch",
        "REASONFORLEAVING":"reason for leaving"
        };
    // public static DOCUMENTTYPE: string = 'document type';
    // public static ORGANIZATION: string = 'organization';
    // public static LOCATION: string = 'location';
    // public static DEPARTMENT: string = 'department';
    // public static GENDER: string = 'gender';
    // public static RELIGION: string = 'religion';
    // public static CITY: string = 'city';
    // public static STATE: string = 'state';
    // public static COUNTRY: string = 'country';
    // public static CATEGORY: string = 'category';
    // public static BLOODGROUP: string = 'bloodgroup';
    // public static PRIMARYCONTACT: string = 'primarycontact';
    // public static CLASSES: string = 'classes';
    // public static BATCH: string = 'batch';
    // public static FEETYPE: string = 'feetype';
    // public static SECTION: string = 'section';
    // public static LANGUAGESUBJECTLOWERCLS: string = 'languagesubjectlower';
    // public static LANGUAGESUBJECTUPPERCLS: string = 'languagesubjectupper';
    // public static FEENAMES: string = 'feenames';
    // public static UPLOADTYPE: string = 'uploadtype';
    // public static DOWNLOADTYPE: string = 'downloadtype';
    public static getCurrentBatch() {
        let currentyear = new Date().getFullYear();
        return currentyear.toString() + "-" + (currentyear + 1).toString();
    }

}