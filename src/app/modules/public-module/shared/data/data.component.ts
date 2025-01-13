import { Component, Input } from '@angular/core';
import { DataService } from '../../../../services/data/data.service';

@Component({
    selector: 'app-data',
    imports: [],
    templateUrl: './data.component.html',
    styleUrl: './data.component.scss'
})
export class DataComponent {

  @Input() socket_status:boolean = false;
  data: any = {};


  constructor(){

  }


  
}
