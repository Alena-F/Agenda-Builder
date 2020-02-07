/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecords from '@salesforce/apex/getRecord.getRecords';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';

export default class AgendaForm extends NavigationMixin(LightningElement) {
    @api recordId;
    @track name;
    @track organizer;
    @api updatedRecord;
    @track chartData;
               
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
        if (this.recordId) {
            getRecords({
                recordid : this.recordId
            })
            .then(result => {
                //this.error = undefined;
                //console.log('result ' + result);
                this.name = result[0].Name;
                this.organizer = result[0].Organizer__c;
                console.log(this.organizer);
            })
            .catch(error => {
                //this.error = error;
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
        //event.preventDefault();       // stop the form from submitting
       // this.reloadForm=true;
        //const fields = event.detail.fields;
        //this.template.querySelector('lightning-record-edit-form').submit(fields);
 
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

        this.updatedRecord = event.detail.id;
        console.log('onsuccess: ', this.updatedRecord);
        fireEvent(this.pageRef, 'agendaUpdate', this.updatedRecord); 
        
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
}