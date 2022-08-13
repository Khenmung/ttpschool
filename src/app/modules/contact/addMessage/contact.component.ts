import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NaomitsuService } from '../../../shared/databaseService';
import { List } from '../../../shared/interface';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit { PageLoading=true;
  loading=false;
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SuccessMessage='';
  title: string;
  Id: number = 0;
  ContactForm = new UntypedFormGroup({
    Name: new UntypedFormControl("", [Validators.required, Validators.maxLength(25)]),
    Email: new UntypedFormControl("", [Validators.required,Validators.email, Validators.maxLength(25)]),
    Subject: new UntypedFormControl("", [Validators.required, Validators.maxLength(25)]),
    MessageBody: new UntypedFormControl("", [Validators.required, Validators.maxLength(250)]),
    CreatedDate: new UntypedFormControl(new Date()),
    Active: new UntypedFormControl(1),
    MessageId: new UntypedFormControl(0)
  });

  constructor(private naomitsuService: NaomitsuService,
    
    private route: Router,
    private activeUrl: ActivatedRoute) {
    this.activeUrl.paramMap.subscribe(params => {
      this.Id = +params.get("id");
      ////console.log("id",this.Id);
    })
  }

  ngOnInit(): void {
    if (this.Id > 0) {
      this.title = "Message";
      this.GetContactEntry();
    }
    else
      this.title = "Contact Us";

  }
  get f() { return this.ContactForm.controls; }

  onSubmit() {
    this.insert();
  }

  updateAsRead() {

    let messageDetail ={
      Active: 1,
      CreatedDate: new Date()
    } 
    this.naomitsuService.postPatch('Messages', messageDetail, this.Id, 'patch')
      .subscribe(
        (data: any) => {
          //this.contentservice.openSnackBar("Message updated!", this.options);
        })
  }
  insert() {
    //debugger;
    this.naomitsuService.postPatch('Messages', this.ContactForm.value, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.contentservice.openSnackBar(globalconstants.AddedMessage,globalconstants.ActionText,globalconstants.BlueBackground);
          this.SuccessMessage ="We have received your message! Thank you for contacting us.";
          //this.route.navigate(["/home"]);
        },
        (error) => {
          //console.log('messages page', error);
        });
  }
  GetContactEntry() {
    let list: List = new List();
    list.fields = ["MessageId", "Name", "Email", "Subject", "MessageBody", "Active", "CreatedDate"];
    list.PageName = "Messages";
    list.filter = ["MessageId eq " + this.Id];
    //list.orderBy = "MessageId desc";
    this.naomitsuService.get(list)
      .subscribe((data: any) => {
        this.ContactForm.setValue(data.value[0]);
        this.updateAsRead();
        });

  }
  back(){
    this.route.navigate(['/home/messages']);
  }

}
