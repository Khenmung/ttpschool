import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContentService } from 'src/app/shared/content.service';
import { globalconstants } from 'src/app/shared/globalconstant';
import { SharedataService } from 'src/app/shared/sharedata.service';
import { TokenStorageService } from 'src/app/_services/token-storage.service';
import { ClassEvaluationComponent } from '../classevaluation/classevaluation.component';
import { EvaluationClassSubjectMapComponent } from '../evaluationclasssubjectmap/EvaluationClassSubjectMap.component';
import { EvaluationMasterComponent } from '../evaluationmaster/evaluationmaster.component';
import { EvaluationresultComponent } from '../evaluationresult/evaluationresult.component';
import { StudentEvaluationComponent } from '../studentevaluation/studentevaluation.component';

@Component({
  selector: 'app-evaluationboard',
  templateUrl: './evaluationboard.component.html',
  styleUrls: ['./evaluationboard.component.scss']
})
export class EvaluationboardComponent implements AfterViewInit {

  components = [    
    EvaluationMasterComponent,
    ClassEvaluationComponent,    
    EvaluationClassSubjectMapComponent,
    StudentEvaluationComponent,
    EvaluationresultComponent
  ];

  tabNames = [
    { 'label': '1Exam Time Table', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
    { 'label': '1Exam Result', 'faIcon': '' },
  ];

  Permissions =
    {
      ParentPermission: '',
      ClassEvaluationPermission: '',
      // EvaluationOptionPermission: '',
      // EvaluationExamPermission: '',
    };
  LoginUserDetail = [];
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public viewContainer: ViewContainerRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private tokenStorage: TokenStorageService,
    private shareddata: SharedataService,
    private contentservice: ContentService,
    private componentFactoryResolver: ComponentFactoryResolver) {
  }

  public ngAfterViewInit(): void {
debugger;
    this.LoginUserDetail = this.tokenStorage.getUserDetail();
    this.contentservice.GetApplicationRoleUser(this.LoginUserDetail);
    
    var perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATION)
    if (perObj.length > 0) {
      this.Permissions.ParentPermission = perObj[0].permission;
    }
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EXECUTEEVALUATION);
    var comindx = this.components.indexOf(StudentEvaluationComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONMASTER);
    var comindx = this.components.indexOf(EvaluationMasterComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONQUESTIONNAIRE)
    var comindx = this.components.indexOf(ClassEvaluationComponent);
    this.AddRemoveComponent(perObj, comindx);

    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONCLASSSUBJECTMAP)
    var comindx = this.components.indexOf(EvaluationClassSubjectMapComponent);
    this.AddRemoveComponent(perObj, comindx);
    
    perObj = globalconstants.getPermission(this.tokenStorage, globalconstants.Pages.edu.EVALUATION.EVALUATIONRESULT)
    var comindx = this.components.indexOf(EvaluationresultComponent);
    this.AddRemoveComponent(perObj, comindx);

    this.shareddata.ChangePermissionAtParent(this.Permissions.ParentPermission);
    if (this.Permissions.ParentPermission != 'deny') {
      this.renderComponent(0);
      this.cdr.detectChanges();
    }
  }

  public tabChange(index: number) {
    //    //console.log("index", index)
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
  AddRemoveComponent(perObj, comindx) {
    if (perObj.length > 0) {
      if (perObj[0].permission == 'deny') {
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
}
