/* eslint-disable no-alert */
import { LightningElement, track } from 'lwc';

export default class Helloworld extends LightningElement {
    @track greeting = 'World';
    @track name = 'New'    
    @track openmodel = true;
    
    closeModal() {
        this.openmodel = false;
        //redirect
    } 
    saveMethod() {
        alert('save method invoked');
        //redirect
        this.closeModal();
    }
    changeHandler(event) {
        this.greeting = event.target.value;
        this.name = event.target.value;
    }
}