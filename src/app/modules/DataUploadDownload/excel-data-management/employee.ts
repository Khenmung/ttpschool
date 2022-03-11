import { Injectable } from "@angular/core";
import { ContentService } from "src/app/shared/content.service";
import { NaomitsuService } from "src/app/shared/databaseService";
import { globalconstants } from "src/app/shared/globalconstant";
import { TokenStorageService } from "src/app/_services/token-storage.service";
@Injectable({
    providedIn: 'root'
})
export class employee {
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
    constructor(
        private token: TokenStorageService,
        private dataservice: NaomitsuService,
        private contentservice: ContentService,

    ) {
        this.loginUserDetail = this.token.getUserDetail();
    }
    save(ELEMENT_DATA) {
        var toInsert = [];
        debugger;
        ELEMENT_DATA.forEach(row => {
            toInsert.push({
                EmpEmployeeId: row.EmpEmployeeId,
                ShortName: row.ShortName,
                FirstName: row.FirstName,
                LastName: row.LastName,
                FatherName: row.FatherName,
                MotherName: row.MotherName,
                GenderId: row.GenderId,
                DOB: row.DOB,
                DOJ: row.DOJ,
                BloodgroupId: row.BloodgroupId,
                CategoryId: row.CategoryId,
                BankAccountNo: row.BankAccountNo,
                IFSCcode: row.IFSCcode,
                MICRNo: row.MICRNo,
                AdhaarNo: row.AdhaarNo,
                PhotoPath: row.PhotoPath,
                ReligionId: row.ReligionId,
                ContactNo: row.ContactNo,
                WhatsappNo: row.WhatsappNo,
                AlternateContactNo: row.AlternateContactNo,
                EmailAddress: row.EmailAddress,
                EmergencyContactNo: row.EmergencyContactNo,
                EmploymentStatusId: row.EmploymentStatusId,
                EmploymentTypeId: row.EmploymentTypeId,
                ConfirmationDate: row.ConfirmationDate,
                NoticePeriodDays: row.NoticePeriodDays,
                ProbationPeriodDays: row.ProbationPeriodDays,
                PAN: row.PAN,
                PassportNo: row.PassportNo,
                AadharNo: row.AadharNo,
                MaritalStatusId: row.MaritalStatusId,
                MarriedDate: row.MarriedDate,
                PFAccountNo: row.PFAccountNo,
                NatureId: row.NatureId,
                EmployeeCode: row.EmployeeCode,
                Active: row.Active,
                Remarks: row.Remarks,
                PresentAddress: row.PresentAddress,
                PresentAddressCityId: row.PresentAddressCityId,
                PresentAddressStateId: row.PresentAddressStateId,
                PresentAddressCountryId: row.PresentAddressCountryId,
                PermanentAddressCityId: row.PermanentAddressCityId,
                PresentAddressPincode: row.PresentAddressPincode,
                PermanentAddressPincode: row.PermanentAddressPincode,
                PermanentAddressStateId: row.PermanentAddressStateId,
                PermanentAddressCountryId: row.PermanentAddressCountryId,
                PermanentAddress: row.PermanentAddress,
                OrgId: this.loginUserDetail[0]["orgId"],
                CreatedDate: new Date(),
                CreatedBy: this.loginUserDetail[0]['userId'],
                DepartmentId: +row.DepartmentId,
                DesignationId: +row.DesignationId,
                EmpGradeId: +row.EmpGradeId,
                WorkAccountId: +row.WorkAccountId
            });
        });
        ////console.log("toInsert", toInsert)
        this.dataservice.postPatch('EmpEmployees', toInsert, 0, 'post')
            .subscribe((result: any) => {
                this.loading = false;
                this.contentservice.openSnackBar("Data uploaded successfully.", globalconstants.ActionText,globalconstants.RedBackground);
            }, error => {
                this.contentservice.openSnackBar("Error occured. Please contact your administrator.",globalconstants.ActionText,globalconstants.RedBackground);
                console.log(error)
            })
    }
}