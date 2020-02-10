/* eslint-disable no-console */
import { LightningElement, track, api, wire } from 'lwc';
import chartjs from '@salesforce/resourceUrl/chartjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {CurrentPageReference} from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

export default class Agendachart extends LightningElement {
    @track isChartJsInitialized = true;
    @api chartInfo;
    @api itemId;
    @track showLoadingSpinner = true;
    chart;
    d;
    day;
    month;
    year;
    monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July'];
    days;
    attendees =  [];
    newChartInfo = [];
    config;
        
    @wire(CurrentPageReference) pageRef;

    chartJsInitialization () {
    
        if(this.newChartInfo.length > 0 ) {
            this.isChartJsInitialized = true;
    
            this.config = {
                type: 'bar',
                data: {
                    labels: this.days,
                    datasets: [{
                        label: 'Attendees',
                        data: this.attendees,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            };
 
            Promise.all([
                loadScript(this, chartjs)
                ]).then(() => {
                    const ctx = this.template.querySelector('canvas.linechart').getContext('2d');
                    this.chart = new window.Chart(ctx, this.config);
                }).catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error loading Chart',
                            message: error.message,
                            variant: 'error',
                        }),
                    );
                });
        } else {
            this.isChartJsInitialized = false;
        }
    }
   
    connectedCallback() {
        registerListener('chartDataUpdate' ,this.handlechart, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handlechart (chartInfo) {
        if(this.isChartJsInitialized) {
            this.isChartJsInitialized = false;
        } else {
            this.isChartJsInitialized = true;
        }
        this.chartInfo = JSON.parse(chartInfo);
        this.newChartInfo = Object.entries(this.chartInfo);
        this.showLoadingSpinner = false;
        this.d = new Date(this.newChartInfo[0][0]);
        this.day = this.d.getDate();
        this.month = this.d.getMonth();
        this.year = this.d.getFullYear();
        this.days = [];
        let chartDays = [];
               
        for(let i=0; i < 7; i++){
            const curdate = new Date(this.year, this.month, this.day+i);
            this.days[i] = curdate.getDate() + ' ' + this.monthes[curdate.getMonth()] ;
        }
        
        for(let j = 0; j<this.newChartInfo.length; j++ ) {
            let x = new Date(this.newChartInfo[j][0]);
            chartDays[j] = x.getDate() + ' ' + this.monthes[x.getMonth()] ;
        }
       
        this.attendees.length = 0;

        for(let j=0; j<chartDays.length; j++) {
            let y = this.days.indexOf(chartDays[j]); 
            if (y !== -1) {
                this.attendees[y] = this.newChartInfo[j][1];
            } 
        }
    }

    renderedCallback () {
        if (this.itemId) {
            this.chartJsInitialization ();
        } 
    }
     
}