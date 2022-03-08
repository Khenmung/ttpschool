import { Component, OnInit } from '@angular/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/angular';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { ContentService } from 'src/app/shared/content.service';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  loading = false;
  LoginUserDetail = [];
  EventList = [];
  EventsListName = 'Events';
  HolidayListName = 'Holidays';
  CalendarList = [];

  calendarOptions: CalendarOptions;
  constructor(
    private contentservice: ContentService,
    private dataservice: NaomitsuService,
    private tokenService: TokenStorageService) { }

  ngOnInit(): void {
    this.LoginUserDetail = this.tokenService.getUserDetail();
    this.GetHoliday();
  }
  GetHoliday() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["HolidayId,Title,StartDate,EndDate"];

    list.PageName = this.HolidayListName;
    list.filter = [filterStr];
    this.CalendarList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        if (data.value.length > 0) {
          data.value.forEach(m => {
            this.CalendarList.push(
              {
                Id: m.HolidayId,
                title: m.Title,
                start: m.StartDate
              }
            )
          });
        }
        this.GetEvents();
        this.loading = false;
      });

  }
  GetEvents() {
    debugger;

    this.loading = true;
    let filterStr = 'Active eq 1 and OrgId eq ' + this.LoginUserDetail[0]["orgId"];

    let list: List = new List();
    list.fields = ["*"];

    list.PageName = this.EventsListName;
    list.filter = [filterStr];
    this.EventList = [];
    this.dataservice.get(list)
      .subscribe((data: any) => {
        //debugger;
        //console.log("events", data.value);
        if (data.value.length > 0) {
          data.value.forEach(e => {
            this.CalendarList.push(
              {
                Id: e.EventId,
                title: e.Title,
                start: e.StartDate
              }
            );
          })
          this.calendarOptions = {
            
            contentHeight:450,
            plugins: [timeGridPlugin],
            editable: true,
            headerToolbar: {
              left: 'dayGridMonth,timeGridWeek,timeGridDay',
              center: 'title',
              right: 'prevYear,prev,next,nextYear'
            },

            //displayEventTime:false,
            dayMaxEvents: true,
            selectable: true,
            //slotEventOverlap: false,
            //eventMouseEnter: (event) => this.eventMouseOver(event),        
            initialView: 'timeGridWeek',
            dateClick: this.handleDateClick.bind(this), // bind is important!
            events: this.CalendarList

          };
        }
      });

  }
  handleDateClick(arg) {
    //console.log("arg",arg)
    //alert('date click! ' + arg)
  }
  eventMouseOver(value) {
    debugger;
    //console.log("mouseover",value.detail)
    this.contentservice.openSnackBar(value, globalconstants.ActionText, globalconstants.BlueBackground);
  }
  TimeGridView() {
    this.calendarOptions = {
      editable: true,
      // headerToolbar: {
      //     left: 'prev,next today',
      //     center: 'title',
      //     //right: 'month,agendaWeek,agendaDay,listMonth'
      // },
      dayMaxEvents: true,
      selectable: true,
      //slotEventOverlap: false,
      //eventMouseEnter: (event) => this.eventMouseOver(event),        
      initialView: 'timeGridWeek',
      dateClick: this.handleDateClick.bind(this), // bind is important!
      events: [
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1event 1', date: '2021-11-27' },
        { title: 'event zz', date: '2021-11-27' },
        { title: 'event 2', date: '2021-11-30' }
      ]
    };

  }
}
