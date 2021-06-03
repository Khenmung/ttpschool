import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  SuccessMessage='';
  title: string;
  Id: number = 0;
  ContactForm = new FormGroup({
    Name: new FormControl("", [Validators.required, Validators.maxLength(25)]),
    Email: new FormControl("", [Validators.required,Validators.email, Validators.maxLength(25)]),
    Subject: new FormControl("", [Validators.required, Validators.maxLength(25)]),
    MessageBody: new FormControl("", [Validators.required, Validators.maxLength(250)]),
    CreatedDate: new FormControl(new Date()),
    Active: new FormControl(0),
    MessageId: new FormControl(0)
  });

  constructor(private naomitsuService: NaomitsuService,
    private alert: AlertService,
    private route: Router,
    private activeUrl: ActivatedRoute) {
    this.activeUrl.paramMap.subscribe(params => {
      this.Id = +params.get("id");
      //console.log("id",this.Id);
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
          //this.alert.success("Message updated!", this.options);
        })
  }
  insert() {
    debugger;
    this.naomitsuService.postPatch('Messages', this.ContactForm.value, 0, 'post')
      .subscribe(
        (data: any) => {
          //this.alert.success("Data saved Successfully", this.options);
          this.SuccessMessage ="We have received your message! Thank you for contacting us.";
          //this.route.navigate(["/home"]);
        },
        (error) => {
          console.log('messages page', error);
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
