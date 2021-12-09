import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/components/alert/alert.service';
//import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions } from '@fullcalendar/angular';
import { NaomitsuService } from 'src/app/shared/databaseService';
import { List } from 'src/app/shared/interface';
import { TokenStorageService } from 'src/app/_services/token-storage.service';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  loading=false;
  LoginUserDetail=[];
  optionsNoAutoClose = {
    autoClose: false,
    keepAfterRouteChange: true
  };
  optionAutoClose = {
    autoClose: true,
    keepAfterRouteChange: true
  };
  EventList=[];
  EventsListName ='Events';
  calendarOptions: CalendarOptions;
  constructor(private alert:AlertService,
    private dataservice:NaomitsuService,
    private tokenService:TokenStorageService) { }

  ngOnInit(): void {
    this.LoginUserDetail =this.tokenService.getUserDetail();
    this.GetEvents();
    // setTimeout(() => {
          
    // }, 500);
        
      
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
        if (data.value.length > 0) {
          this.EventList = data.value.map(e=>{
            e.start= e.EventStartDate;
            return e;
          })
          this.calendarOptions= {
            plugins:[timeGridPlugin],
            editable: true,
            headerToolbar: {
              left: 'dayGridMonth,timeGridWeek,timeGridDay',
              center: 'title',
              right: 'prevYear,prev,next,nextYear'
            },
            dayMaxEvents: true,
            selectable: true,
            //slotEventOverlap: false,
            //eventMouseEnter: (event) => this.eventMouseOver(event),        
            initialView: 'timeGridWeek',
            dateClick: this.handleDateClick.bind(this), // bind is important!
            events: this.EventList
            
          };
        }        
      });

  }  
  handleDateClick(arg) {
    //console.log("arg",arg)
    //alert('date click! ' + arg)
  }
  eventMouseOver(value){
    debugger;
    //console.log("mouseover",value.detail)
    this.alert.info(value,this.optionsNoAutoClose);
  }
  TimeGridView()
  {
    this.calendarOptions= {
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
