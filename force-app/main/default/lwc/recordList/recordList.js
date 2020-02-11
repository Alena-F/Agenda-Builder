/* eslint-disable no-console */
import { LightningElement, track, api, wire } from 'lwc'; 
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
import getWorkshopsCount from '@salesforce/apex/ManageRecordsController.getWorkshopsCount';
import getWorkshops from '@salesforce/apex/ManageRecordsController.getWorkshops';  
import getCategoryList from '@salesforce/apex/ManageRecordsController.getCategoryList';
import countAttendees from '@salesforce/apex/ManageRecordsController.countAttendees';
import updateAgendaWorkshops from '@salesforce/apex/ManageRecordsController.updateAgendaWorkshops'
import{CurrentPageReference} from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';


const COLS = [
  { label: 'Number of Attendees', fieldName: 'Number_of_Attendees__c', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
  { label: 'Workshop Name', fieldName: 'WorkshopNameURL', type: 'url', typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}, cellAttributes: { alignment: 'left' } },
  { label: 'Start Date Time', fieldName: 'Start_Date_Time__c',  type: "date",
  typeAttributes:{
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
  }, cellAttributes: { alignment: 'left' } },
  { label: 'Remaining Spots', fieldName: 'Remaining_Spots__c', type: 'number', cellAttributes: { alignment: 'left' } },
  { label: 'Category', fieldName: 'Category__c', type: 'text', cellAttributes: { alignment: 'left' } }
];

export default class RecordList extends LightningElement {  
  @api agendaId;
  @api organizer;
  columns = COLS;
  @track rows;
  allRows = [];
  row;
  @track draftValues = [];
  @track data = [];
  @track noRecordsFound = true;
  @track filterValue = '';
  @track disableFilter = false;
  @track categories = [{ label: '--Any category--', value: '' }];
  @track options;
  @track chartData;
  @track workshopsData;
  blankAttendees;
   ///////pagination variables
  @api currentpage;  
  @api pagesize; 
  totalpages;
  error;  
     
  @wire(CurrentPageReference) pageRef;

  getWorkshopsItems() {
    getWorkshopsCount({
      recordid : this.agendaId,
      filterValue : this.filterValue
    })  
    .then(recordsCount => {  
      if (recordsCount !== 0 && !isNaN(recordsCount)) { 
        this.noRecordsFound = false; 
        this.totalpages = Math.ceil(recordsCount / this.pagesize);  
        getWorkshops ({
          recordid : this.agendaId,
          filterValue : this.filterValue,
          pagenumber: this.currentpage, 
          numberOfRecords: recordsCount, 
          pageSize: this.pagesize
        })  
        .then(result => {  
          this.rows = result; 
          this.rows.forEach(element => {
            if(element.Agenda_Workshops__r) {
              element.Number_of_Attendees__c = element.Agenda_Workshops__r[0].Number_of_Attendees__c;
            } else {
              element.Number_of_Attendees__c = 0;
            }
            element.WorkshopNameURL = '/lightning/r/Workshop__c/' + element.Id + '/view';
            this.allRows.push(element);
          });
          this.data = this.rows;
          
          countAttendees({
            recordid : this.agendaId,
            filterValue : this.filterValue
            /*workshops : this.rows,
            recordid : this.agendaId */               
          })
          .then(result1 => {
            this.chartData = result1;
            fireEvent(this.pageRef, 'chartDataUpdate', JSON.stringify(this.chartData));
          })
          .catch(error => {
            console.log(error);
          });
        })  
        .catch(error => {  
          console.log(error); 
        }); 
      } else {  
        this.noRecordsFound = true;
        this.rows = []; 
        this.data = this.rows;
        this.chartData = [];
        fireEvent(this.pageRef, 'chartDataUpdate', JSON.stringify(this.chartData)); 
        this.totalpages = 1;  
      } 
      const event = new CustomEvent('recordsload', {  
        detail: recordsCount  
      });  
      this.dispatchEvent(event); 
    })  
    .catch(error => {  
      console.log(error);
    });  
  }

  connectedCallback() {
    registerListener('previousUpdate' ,this.handlePagination, this);
    registerListener('nextUpdate' ,this.handlePagination, this);
    registerListener('firstUpdate' ,this.handlePagination, this);
    registerListener('lastUpdate' ,this.handlePagination, this);
    registerListener('agendaUpdate' ,this.handleAgendaUpdate, this);
    getCategoryList()
      .then(result => {
        result.forEach(element => this.categories.push({value: element , label: element}));
        this.options=this.categories;
      })
      .catch(error => {
        console.log(error);
      });
    this.getWorkshopsItems();
  }

  disconnectedCallback() {
    unregisterAllListeners(this);
  }

  handlePagination() {
    this.getWorkshopsItems();
  }

  handleAgendaUpdate(agendaId) {
    this.agendaId = agendaId;
    this.template.querySelector('lightning-datatable').save();
  }

  handleChange(event) {
    this.filterValue = event.detail.value;
    this.getWorkshopsItems();
  }

  handleSave(event) {
    this.workshopsData = event.detail.draftValues;
    this.blankAttendees = this.workshopsData.filter( workshop => workshop.Number_of_Attendees__c === "" );
    if (this.blankAttendees.length !== 0) {
      this.disableFilter = true;
      const evt = new ShowToastEvent({
        title: "Error!",
        message: "You must enter a Number of Ateendees",
        variant: "error",
    });
      this.dispatchEvent(evt);
      this.error = "Number of Ateendees is blank"
      console.log(this.error);
    } else {
      fireEvent(this.pageRef, 'agendaCreateUpdate'); 
      this.workshopsData.forEach( workshop => {
        workshop.Workshop__c = workshop.Id;
        workshop.Primary_Attendee__c = this.organizer;
        this.row = this.allRows.find(row => row.Id === workshop.Id);
        if(this.row.Agenda_Workshops__r) {
          workshop.Id = this.row.Agenda_Workshops__r[0].Id;
        } else {
          delete workshop.Id;
        }
      })
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        updateAgendaWorkshops({
          agendaId : this.agendaId,
          agendaWorkshops : this.workshopsData
        }) 
        .then(result => {
          console.log(result);
          //this.getWorkshopsItems()
          this.allRows = [];
          // eslint-disable-next-line @lwc/lwc/no-async-operation
          /*setTimeout(() => {
            this.draftValues = [];
          }, 2000);*/
          this.draftValues = [];
        })
        .catch(error => {
          console.log(error);
        });
      }, 2000);
    }
  }

  handleCancel() {
    this.disableFilter = false;
  }


}