/* eslint-disable no-console */
import { LightningElement,  api, wire } from 'lwc'; 
import{CurrentPageReference} from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub'; 
  
export default class PaginationParent extends LightningElement {  
  @api agendaId;
  @api organizer;
  @api page = 1;  
  @api totalrecords;
  @api totalPages;  
  @api pagesize = 5;  
 
  @wire(CurrentPageReference) pageRef;

  connectedCallback() {
    registerListener('previousUpdate' ,this.handlePrevious, this);
    registerListener('nextUpdate' ,this.handleNext, this);
    registerListener('firstUpdate' ,this.handleFirst, this);
    registerListener('lastUpdate' ,this.handleLast, this);
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handlePrevious() {  
    if (this.page > 1) {  
      this.page = this.page - 1;  
    }  
  }  
  handleNext() {  
    if (this.page < this.totalPages)  
      this.page = this.page + 1;  
  }  
  handleFirst() {  
    this.page = 1;  
  }  
  handleLast() {  
    this.page = this.totalPages;  
  }  
  handleRecordsLoad(event) {  
    this.totalrecords = event.detail;  
    this.totalPages = Math.ceil(this.totalrecords / this.pagesize);  
    console.log(this.totalPages);
  }  
  handlePageChange(event) {  
    this.page = event.detail;  
  }  
}