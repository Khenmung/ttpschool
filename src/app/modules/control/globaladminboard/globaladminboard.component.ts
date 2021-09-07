import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplicationfeatureComponent } from '../applicationfeature/applicationfeature.component';
import { ApplicationpriceComponent } from '../applicationprice/applicationprice.component';
import { CustomerappsComponent } from '../customerapps/customerapps.component';
import { CustomerinvoiceComponent } from '../customerinvoice/customerinvoice.component';

@Component({
  selector: 'app-globaladminboard',
  templateUrl: './globaladminboard.component.html',
  styleUrls: ['./globaladminboard.component.scss']
})
export class GlobaladminboardComponent implements OnInit {

  @ViewChild(ApplicationfeatureComponent) features: ApplicationfeatureComponent;
  @ViewChild(ApplicationpriceComponent) prices: ApplicationpriceComponent;
  @ViewChild(CustomerinvoiceComponent) customerinvoice: CustomerinvoiceComponent;
  @ViewChild(CustomerappsComponent) Customerapps: CustomerappsComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.features.PageLoad();
    }, 100);

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    //this.masterSettingData.PageLoad();
  }
  tabChanged(event) {
 debugger;
    //console.log(event);
    switch (event) {
      case 0:
        this.features.PageLoad();
        break;
      case 1:
        this.prices.PageLoad();
        break;
      case 2:
        this.Customerapps.PageLoad();
        break;
      case 3:
        this.customerinvoice.PageLoad();
        break;
      //      default:
      //   this.masterSettingData.PageLoad();
      //   break;
    }
  }
}

