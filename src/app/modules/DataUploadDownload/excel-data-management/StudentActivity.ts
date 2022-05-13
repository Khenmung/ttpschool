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
                StudentEvaluationId: 0,
                StudentClassId: row.StudentClassId,
                ClassEvaluationId: +row.ClassEvaluationId,
                RatingId: 4588,
                Detail: row.Detail,
                Active: 1,
                OrgId: this.loginUserDetail[0]["orgId"],
                ActivityDate: new Date(row.ActivityDate),
                CreatedBy: this.loginUserDetail[0]["userId"],
            });
        });
        console.log("toInsert", toInsert)
        this.dataservice.postPatch('StudentEvaluations', toInsert, 0, 'post')
            .subscribe((result: any) => {
                this.loading = false;
                this.contentservice.openSnackBar(globalconstants.AddedMessage, globalconstants.ActionText, globalconstants.BlueBackground);

            }, error => console.log(error))
    }
}