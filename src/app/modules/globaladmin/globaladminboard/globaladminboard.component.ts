import { Component, OnInit, ViewChild } from '@angular/core';
import { AddMasterDataComponent } from '../../control/add-master-data/add-master-data.component';
import { MenuConfigComponent } from '../menu-config/menu-config.component';
import { ApplicationpriceComponent } from '../applicationprice/applicationprice.component';
import { CustomerappsComponent } from '../customerapps/customerapps.component';
import { CustomerinvoiceComponent } from '../customerinvoice/customerinvoice.component';
import { CustomerinvoicecomponentsComponent } from '../customerinvoicecomponents/customerinvoicecomponents.component';
import { ReportConfigItemComponent } from '../reportconfigitem/reportconfigitem.component';

@Component({
  selector: 'app-globaladminboard',
  templateUrl: './globaladminboard.component.html',
  styleUrls: ['./globaladminboard.component.scss']
})
export class GlobaladminboardComponent implements OnInit {
  @ViewChild(ApplicationpriceComponent) prices: ApplicationpriceComponent;
  @ViewChild(CustomerinvoiceComponent) customerinvoice: CustomerinvoiceComponent;
  @ViewChild(CustomerappsComponent) Customerapps: CustomerappsComponent;
  @ViewChild(AddMasterDataComponent) masters: AddMasterDataComponent;
  @ViewChild(CustomerinvoicecomponentsComponent) customerinvoicecomponents: CustomerinvoicecomponentsComponent;
  @ViewChild(ReportConfigItemComponent) reportconfigdata: ReportConfigItemComponent;
  @ViewChild(MenuConfigComponent) menuconfig: MenuConfigComponent;
  selectedIndex = 0;
  constructor() { }

  ngOnInit(): void {
    debugger;
    setTimeout(() => {
      this.menuconfig.PageLoad();
    }, 100);

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    //this.masterSettingData.PageLoad();
  }
  tabChanged(event) {
    //debugger;
    //console.log(event);
    switch (event) {
      case 0:
        this.menuconfig.PageLoad();
        break;
      case 1:
        this.prices.PageLoad();
        break;
      case 2:
        this.Customerapps.PageLoad();
        break;
      case 3:
        this.customerinvoicecomponents.PageLoad();
        break;
      case 4:
        this.customerinvoice.PageLoad();
        break;
      case 5:
        this.masters.PageLoad();
        break;
      case 6:
        this.reportconfigdata.PageLoad();
        break;

      //      default:
      //   this.masterSettingData.PageLoad();
      //   break;
    }
  }
}

