import { Injectable } from "@angular/core";
import { ContentService } from "src/app/shared/content.service";
import { NaomitsuService } from "src/app/shared/databaseService";
import { globalconstants } from "src/app/shared/globalconstant";
import { TokenStorageService } from "src/app/_services/token-storage.service";
@Injectable({
    providedIn: 'root'
})
export class StudentActivity {
    ELEMENT_DATA = [];
    loading = false;
    optionsNoAutoClose = {
        autoClose: false,
        keepAfterRouteChange: true
    };
    optionAutoClose = {
        autoClose: true,
        keepAfterRouteChange: true
    };
    loginUserDetail = [];
    SelectedBatchId = 0;
    constructor(
        private token: TokenStorageService,
        private dataservice: NaomitsuService,
        private contentservice: ContentService,

    ) {
        this.loginUserDetail = this.token.getUserDetail();
        this.SelectedBatchId = +this.token.getSelectedBatchId();
    }
    save(ELEMENT_DATA) {
        var toInsert = [];
        debugger;
        ELEMENT_DATA.forEach(row => {
            toInsert.push({
                //StudentActivityId: row.StudentActivityId,
                StudentClassId: row.StudentClassId,
                StudentId: row.StudentId,
                Activity: row.Activity,
                ActivityDate: row.ActivityDate,
                Active: 1,
                CategoryId: row.CategoryId,
                SubCategoryId: row.SubCategoryId,
                Remarks: row.Remarks,
                OrgId: this.loginUserDetail[0]['orgId'],
                BatchId: this.SelectedBatchId,
                CreatedDate: new Date()
            });
        });
        ////console.log("toInsert", toInsert)
        this.dataservice.postPatch('StudentActivities', toInsert, 0, 'post')
            .subscribe((result: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Data uploaded successfully.", globalconstants.ActionText, globalconstants.RedBackground);

            }, error => console.log(error))
    }
}