import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { globalconstants } from './globalconstant';
//import { FileToUpload } from '../../../interface';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
   API_URL = globalconstants.apiUrl + "/api/uploadimage";
   API_URLs = globalconstants.apiUrl + "/api/uploadimages";
  //API_URL = "/api/uploadimage";
  //API_URLs = "/api/uploadimages";
  constructor(private http: HttpClient) { }

  postFile(formData) : Observable<any> {
    //console.log(theFile);
    // const formData:FormData= new FormData();
    // formData.append("album",album);
    // formData.append("Image",fileToUpload,fileToUpload.name);

    return this.http.post(this.API_URL, formData);
  }
  postFiles(formdata:FormData) : Observable<any> {
        return this.http.post(this.API_URLs, formdata);
  }  
}