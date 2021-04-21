import { Injectable, OnInit } from '@angular/core';  
import { HttpClient,HttpHeaders } from '@angular/common/http';  
import { PageDetail } from '../content';
import {globalconstants} from './globalconstant';
@Injectable({
  providedIn: 'root'
})
export class ContentService {  

  url :any;  
  constructor(private http: HttpClient) { }  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  AddUpdateContent(pagecontent:any) {  
    //debugger  
    this.url = globalconstants.apiUrl + '/odata/Pages';
    //this.url ="/odata/Pages"; 
    return this.http.post(this.url, pagecontent);  
}  
Getcontent(title:string,query:string) {  
  debugger  
  this.url = globalconstants.apiUrl + '/odata/' +title + '?' + query;  
  //this.url = '/odata/' +title + '?' + query;  
  //console.log(this.url);
  return this.http.get(this.url);//.map(res=>res.json());
  //.pipe(map((res:Response) => res.json()));
  // .pipe(map((res:any)=>{
  //   var data = res.json();
  //   return new (data.PageId, data.PageHeader, data.PageType.PageName,data.Version);
}

GetPageTypes() {  
  //debugger  
  this.url = globalconstants.apiUrl + '/odata/PageTypes?$filter=Active eq true';  
  //this.url = '/odata/PageTypes?$filter=Active eq true';  
  //var filter = ''
  return this.http.get(this.url);  
}  
GetcontentLatest(pageGroupId:number,pageName:string) {  
  debugger  
  let filter = "PageName eq '" + pageName + "' and PageNameId eq " + pageGroupId; 
  this.url = globalconstants.apiUrl + '/odata/Pages?$select=PageId,Version&$orderby=Version desc&$top=1&$filter=' + filter;  
  //this.url = '/odata/Pages?$select=PageId,Version&$orderby=Version desc&$top=1&$filter=' + filter;  
  return this.http.get(this.url);  
}
GetcontentById(Id:number) {  
  debugger    
  this.url = globalconstants.apiUrl + '/odata/Pages?$filter=PageId eq ' + Id;  
  //this.url = '/odata/Pages?$filter=PageId eq ' + Id;  
  return this.http.get(this.url);  
}

UpdatecontentById(body:PageDetail,key:any) {  
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'  
    })
  };
//headers=headers.append('Access-Control-Allow-Origin', '*')  
  this.url = globalconstants.apiUrl + '/odata/Pages/(' + key +')';  
  //this.url = '/odata/Pages/(' + key +')';  
  return this.http.patch(this.url,body,httpOptions )   
  }
}
