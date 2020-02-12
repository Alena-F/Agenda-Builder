/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAgendaName from '@salesforce/apex/ManageRecordsController.getAgendaName';
import {registerListener, unregisterAllListeners } from 'c/pubsub';

export default class AgendaForm extends NavigationMixin(LightningElement) {
    @api recordId;
    @track name;
    @track organizer;
    @track chartData;
    @api page = 1;  
    @api totalrecords;
    @api totalPages;  
    @api pagesize = 5;  
               
    @wire(CurrentPageReference) pageRef;

    navigateToRecord(itemId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: itemId,
                objectApiName: 'Agenda__c',
                actionName: 'view',
            },
        });
    }
   
    connectedCallback(){
        registerListener('agendaCreateUpdate' ,this.handleSave, this);
        registerListener('previousUpdate' ,this.handlePrevious, this);
        registerListener('nextUpdate' ,this.handleNext, this);
        registerListener('firstUpdate' ,this.handleFirst, this);
        registerListener('lastUpdate' ,this.handleLast, this);
        if (this.recordId) {
            getAgendaName({
                recordid : this.recordId
            })
            .then(result => {
                this.name = result[0].Name;
                this.organizer = result[0].Organizer__c;
            })
            .catch(error => {
                console.log(error);
            });
        } else {
            this.name = 'New Agenda';
        }
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
      }
                
    handleSubmit(event) {
        console.log('onsubmit: '+ event.detail.fields);
    }

    handleSave() {
        this.template.querySelector('lightning-record-edit-form').submit();
    }

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: "Success!",
            message: "The record has been successfully saved.",
            variant: "success",
        });
        this.dispatchEvent(evt);
        this.navigateToRecord(event.detail.id);
        this.recordId = event.detail.id;
        getAgendaName({
            recordid : this.recordId
        })
        .then(result => {
            this.organizer = result[0].Organizer__c;
        })
        .catch(error => {
            console.log(error);
        });
        
    }

    handleError() {
        const evt = new ShowToastEvent({
            title: "Error!",
            message: "An error occurred while attempting to save the record.",
            variant: "error",
        });
        this.dispatchEvent(evt);
    }

    handleCancel() {
        window.history.back();
    }

    handlePrevious() {  
        if (this.page > 1) {  
          this.page = this.page - 1;  
        }  
    }

    handleNext() {  
        if (this.page < this.totalPages) {
          this.page = this.page + 1;  
        }
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