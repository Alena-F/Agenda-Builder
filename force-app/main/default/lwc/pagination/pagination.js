import { LightningElement, api, wire } from 'lwc'; 
import{CurrentPageReference} from 'lightning/navigation';
import { fireEvent } from 'c/pubsub'; 

 export default class PaginatorBottom extends LightningElement {  
   
   @api totalrecords;  
   @api currentpage;  
  // @api pagesize;
    pagesize = 5;
   @api totalpages;  
   lastpage = false;  
   firstpage = false;  
   
   get showFirstButton() {  
     if (this.currentpage === 1) {  
       return true;  
     }  
     return false;  
   }  
   get showLastButton() {  
     if (Math.ceil(this.totalrecords / this.pagesize) === this.currentpage || this.totalrecords ===0) {  
       return true;  
     }  
     return false;  
   }  

   @wire(CurrentPageReference) pageRef;
     
   handlePrevious() {  
     //this.dispatchEvent(new CustomEvent('previous'));
     fireEvent(this.pageRef, 'previousUpdate');  
   }  
   handleNext() {  
     //this.dispatchEvent(new CustomEvent('next')); 
     fireEvent(this.pageRef, 'nextUpdate'); 
   }  
   handleFirst() {  
     //this.dispatchEvent(new CustomEvent('first'));
     fireEvent(this.pageRef, 'firstUpdate');  
   }  
   handleLast() {  
     //this.dispatchEvent(new CustomEvent('last'));  
     fireEvent(this.pageRef, 'lastUpdate');
   }  
 }