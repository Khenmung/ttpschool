import { Component, OnInit, ViewChild } from '@angular/core';
import { CertificatesComponent } from '../certificates/certificates.component';
import { ExamtimetableComponent } from '../examtimetable/examtimetable.component';
import { FeecollectionreportComponent } from '../feecollectionreport/feecollectionreport.component';
import { ResultsComponent } from '../results/results.component';
import { TodayCollectionComponent } from '../today-collection/today-collection.component';

@Component({
  selector: 'app-resultboard',
  templateUrl: './resultboard.component.html',
  styleUrls: ['./resultboard.component.scss']
})
export class ResultboardComponent implements OnInit {

  @ViewChild(FeecollectionreportComponent) feecollection: FeecollectionreportComponent;
  @ViewChild(TodayCollectionComponent) TodayCollection: TodayCollectionComponent;
  @ViewChild(ResultsComponent) results: ResultsComponent;
  @ViewChild(ExamtimetableComponent) examtimetable: ExamtimetableComponent;
  @ViewChild(CertificatesComponent) certificate: CertificatesComponent;


  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.results.PageLoad();
    }, 20);

  }
  tabChanged(tabChangeEvent: number) {
    this.selectedIndex = tabChangeEvent;
    this.navigateTab(this.selectedIndex);
    //   console.log('tab selected: ' + tabChangeEvent);
  }
  public nextStep() {
    this.selectedIndex += 1;
    this.navigateTab(this.selectedIndex);
  }

  public previousStep() {
    this.selectedIndex -= 1;
    this.navigateTab(this.selectedIndex);
  }
  navigateTab(indx) {
    switch (indx) {
      case 0:
        this.examtimetable.PageLoad();
        break;
      case 1:
        this.results.PageLoad();
        break;
      case 2:
        this.TodayCollection.PageLoad();
        break;
      case 3:
        this.feecollection.PageLoad();
        break;
      case 4:
        this.certificate.PageLoad();
        break;
      // case 4:
      //   this.activity.PageLoad();
      //   brea                                                                                                                                                        k;
      default:
        this.results.PageLoad();
        break;
    }
  }
}
