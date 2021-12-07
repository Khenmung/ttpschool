import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AddMasterDataComponent } from '../../control/add-master-data/add-master-data.component';
import { MenuConfigComponent } from '../menu-config/menu-config.component';
import { ApplicationpriceComponent } from '../applicationprice/applicationprice.component';
import { CustomerPlansComponent } from '../customerplans/customerplans.component';
import { CustomerinvoiceComponent } from '../customerinvoice/customerinvoice.component';
import { CustomerinvoicecomponentsComponent } from '../customerinvoicecomponents/customerinvoicecomponents.component';
import { ReportConfigItemComponent } from '../reportconfigitem/reportconfigitem.component';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { PlansComponent } from '../plans/plans.component';

@Component({
  selector: 'app-globaladminboard',
  templateUrl: './globaladminboard.component.html',
  styleUrls: ['./globaladminboard.component.scss']
})
export class GlobaladminboardComponent implements AfterViewInit {
  
  components = [
    //ApplicationpriceComponent,
    CustomerinvoiceComponent,
    CustomerPlansComponent,
    AddMasterDataComponent,
    CustomerinvoicecomponentsComponent,
    ReportConfigItemComponent,
    MenuConfigComponent,
    PlansComponent
  ];

  tabNames = [
    { 'label': '1Exam Time Table', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Fee Payment Status', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
    { 'label': '1Date Wise Collection', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      PlanPermission: '',
      CustomerInvoicePermission: '',
      CustomerAppsPermission: '',
      MasterDataPermission: '',
      CustomerInvoiceComponentsPermission: '',
      ReportConfigPermission: '',
      MenuConfigPermission: ''
    };

  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
    debugger
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.GLOBALADMIN)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;

    }

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.PLAN)
    var comindx = this.components.indexOf(PlansComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERAPPS)
    var comindx = this.components.indexOf(CustomerPlansComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERINVOICE)
    var comindx = this.components.indexOf(CustomerinvoiceComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.CUSTOMERINVOICECOMPONENT)
    var comindx = this.components.indexOf(CustomerinvoicecomponentsComponent);
    this.GetComponents(perObj,comindx)
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.MASTERDATA)
    var comindx = this.components.indexOf(AddMasterDataComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.REPORTCONIG)
    var comindx = this.components.indexOf(ReportConfigItemComponent);
    this.GetComponents(perObj,comindx)

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.globaladmin.MENUCONFIG)
    var comindx = this.components.indexOf(MenuConfigComponent);
    this.GetComponents(perObj,comindx)

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if(1){ //(this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }
  }
  GetComponents(perObj,comindx)
  {
    
    //if (perObj.length > 0) {
    if(1) 
    {
      if (false)//perObj[0].permission == 'deny') {
      {
        this.components.splice(comindx, 1);
        this.tabNames.splice(comindx, 1);
      }
      else {
        this.tabNames[comindx].faIcon = perObj[0].faIcon;
        this.tabNames[comindx].label = perObj[0].label;
      }
    }
    else {
      this.components.splice(comindx, 1);
      this.tabNames.splice(comindx, 1);
    }
  }
  public tabChange(index: number) {
    //    console.log("index", index)
    setTimeout(() => {
      this.renderComponent(index);
    }, 550);

  }
  selectedIndex = 0;


  private renderComponent(index: number): any {
    const factory = this.componentFactoryResolver.resolveComponentFactory<any>(this.components[index]);
    this.viewContainer.createComponent(factory);
    //ClassprerequisiteComponent this.componentFactoryResolver.resolveComponentFactory
  }
}

