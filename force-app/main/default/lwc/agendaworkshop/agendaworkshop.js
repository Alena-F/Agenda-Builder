/* eslint-disable no-console */
import { LightningElement, track, api, wire } from 'lwc';
import getWorkshops from '@salesforce/apex/ManageRecordsController.getWorkshops';
import getCategoryList from '@salesforce/apex/ManageRecordsController.getCategoryList';
import countAttendees from '@salesforce/apex/ManageRecordsController.countAttendees';
import{CurrentPageReference} from 'lightning/navigation';
import { fireEvent } from 'c/pubsub';


const COLS = [
    { label: 'Number of Attendees', fieldName: 'NumberOfAttendees', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
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

export default class Agendaworkshop extends LightningElement {
    @api agendaId;
    @api organizer;
    columns = COLS;
    @track rows;
    @track draftValues = [];
    @track data = [];
    @track noRecordsFound = true;
    @track filterValue = '';
    @track categories = [{ label: '--Any category--', value: '' }];
    @track options;
    @track chartData;
    @track workshopsData;

    @wire(CurrentPageReference) pageRef;

    getWorkshopsItems() {
        getWorkshops({
            recordid : this.agendaId,
            filterValue : this.filterValue
        })
        .then(result => {
            console.log(result);
            if(result.length >0 ) {
                this.noRecordsFound = false;
            } else {
                this.noRecordsFound = true;
            }
            this.rows = result;
            console.log(this.rows.length);
            this.rows.forEach(element => {
                if(element.Agenda_Workshops__r) {
                    element.NumberOfAttendees = element.Agenda_Workshops__r[0].Number_of_Attendees__c;
                } else {
                    element.NumberOfAttendees = 0;
                }
                element.WorkshopNameURL = '/lightning/r/Workshop__c/' + element.Id + '/view';
            });
            console.log(this.rows);
            this.data = this.rows;
            countAttendees({
                workshops : this.rows,
                recordid : this.agendaId                
            })
            .then(result1 => {
                this.chartData = result1;
                console.log(JSON.stringify(this.chartData));
                fireEvent(this.pageRef, 'chartDataUpdate', JSON.stringify(this.chartData));
            })
            .catch(error => {
                //this.error = error;
                console.log(error);
            });
        })
        .catch(error => {
            //this.error = error;
            console.log(error);
        });
    }

    connectedCallback() {
        getCategoryList()
        .then(result => {
            result.forEach(element => this.categories.push({value: element , label: element}));
            this.options=this.categories;
            console.log(result);
            console.log(this.categories);
        })
        .catch(error => {
            //this.error = error;
            console.log(error);
        });

        this.getWorkshopsItems();
    }
    
    handleChange(event) {
        this.filterValue = event.detail.value;
        console.log(this.filterValue);
        this.getWorkshopsItems();
    }
       
    handleSave(event) {
        //event.stopPropagation();
        console.log('data => ', JSON.stringify(event.detail.draftValues));
        this.workshopsData = event.detail.draftValues;
        console.log(this.workshopsData);
        //console.log(this.workshopsData[0].NumberOfAttendees);
        if (this.workshopsData[0].NumberOfAttendees === "" || this.workshopsData[0].NumberOfAttendees === null) {
        console.log('error');
        }
    }
    
}