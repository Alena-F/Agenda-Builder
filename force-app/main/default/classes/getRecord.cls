public with sharing class getRecord {
    
   @AuraEnabled
    public static List<Agenda__c> getRecords(Id recordid){
        List<Agenda__c> record = [SELECT Name, Organizer__c FROM Agenda__c WHERE Id = :recordid];
        return record;
    }

    @AuraEnabled
    public static List<String> getCategoryList(){
        List<String> categoryList = new List<String>();
        Schema.DescribeFieldResult fieldResult = Workshop__c.Category__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for( Schema.PicklistEntry pickListVal : ple){
            categoryList.add(pickListVal.getLabel());
        }  
        return categoryList;
    } 

     @AuraEnabled  
   public static Integer getWorkshopsCount(Id recordid, String filterValue) {  
        Date today = date.today();
        List<Id> idWorkshopsList = new List<Id>();
        for (Agenda_Workshop__c aw : [SELECT Workshop__r.ID FROM Agenda_Workshop__c 
                                      WHERE Agenda__r.Id = :recordid and Workshop__r.Remaining_Spots__c = 0 and day_only(Workshop__r.Start_Date_Time__c) >= :today]) {
			idWorkshopsList.add(aw.Workshop__r.ID);
		}
        
        Integer countWorkshops;
        if(filterValue != '') {        
            countWorkshops = [SELECT count()  FROM Workshop__c 
                         WHERE (Remaining_Spots__c >0 and day_only(Start_Date_Time__c) >= :today and Category__c = :filterValue) or
                         ( Remaining_Spots__c = 0 and ID IN :idWorkshopsList and Category__c = :filterValue)];
        } else {
           countWorkshops = [SELECT count() FROM Workshop__c 
                        WHERE (Remaining_Spots__c >0 and day_only(Start_Date_Time__c) >= :today) or ( Remaining_Spots__c = 0 and ID IN :idWorkshopsList)];  
        }

        system.debug(countWorkshops);
        
        return countWorkshops;
   }  

    @AuraEnabled
    public static List<SObject> getWorkshops(Id recordid, String filterValue){
        Date today = date.today();
        List<Id> idWorkshopsList = new List<Id>();
        for (Agenda_Workshop__c aw : [SELECT Workshop__r.ID FROM Agenda_Workshop__c 
                                      WHERE Agenda__r.Id = :recordid and Workshop__r.Remaining_Spots__c = 0 and day_only(Workshop__r.Start_Date_Time__c) >= :today]) {
			idWorkshopsList.add(aw.Workshop__r.ID);
		}
        
        List<Workshop__c> workshops = new List<Workshop__c>();
        if(filterValue != '') {        
            workshops = [SELECT Name, Start_Date_Time__c, Remaining_Spots__c,Category__c, 
                         (SELECT Number_of_Attendees__c FROM Agenda_Workshops__r 
                          WHERE Agenda__r.Id = :recordid) FROM Workshop__c 
                         WHERE (Remaining_Spots__c >0 and day_only(Start_Date_Time__c) >= :today and Category__c = :filterValue) or
                         ( Remaining_Spots__c = 0 and ID IN :idWorkshopsList and Category__c = :filterValue) 
                         ORDER BY Start_Date_Time__c];
        } else {
           workshops = [SELECT Name, Start_Date_Time__c, Remaining_Spots__c,Category__c, 
                        (SELECT Number_of_Attendees__c FROM Agenda_Workshops__r 
                         WHERE Agenda__r.Id = :recordid) FROM Workshop__c 
                        WHERE (Remaining_Spots__c >0 and day_only(Start_Date_Time__c) >= :today) or ( Remaining_Spots__c = 0 and ID IN :idWorkshopsList) 
                        ORDER BY Start_Date_Time__c];  
        }

        //system.debug(workshops);
        //countAttendees(workshops, recordid);
        return workshops;
    }
    
    @AuraEnabled
    public static map<date,decimal> countAttendees (List<Workshop__c> workshops, Id recordid){
    	map<date,decimal> dateAttendees =new map<date,decimal>();
        List<Id> idWorkshops = new List<Id>();
        for (Workshop__c w : workshops) {
            idWorkshops.add(w.ID);
        }
        
        //system.debug(idWorkshops);
        
        //List<AggregateResult> AggregateResultList = [SELECT day_only(Start_Date_Time__c) StartDate,
                                                     //COUNT(Start_Date_Time__c), SUM(Reserved_Spots__c) Attendees
                                                     //FROM Workshop__c WHERE ID IN :idWorkshops
                                                     //GROUP BY day_only(Start_Date_Time__c) 
                                                     //ORDER by day_only(Start_Date_Time__c)];
        
        List<AggregateResult> AggregateResultList = [SELECT day_only(Workshop__r.Start_Date_Time__c) StartDate, 
                                                     COUNT(Workshop__r.Start_Date_Time__c), SUM(Number_of_Attendees__c) Attendees 
                                                     FROM Agenda_Workshop__c WHERE Workshop__r.ID IN :idWorkshops AND Agenda__r.Id = :recordid
                                                     GROUP BY day_only(Workshop__r.Start_Date_Time__c) ORDER by day_only(Workshop__r.Start_Date_Time__c)];
		//system.debug(AggregateResultList);
		if(AggregateResultList != null && AggregateResultList.size() > 0){ 
        	for(AggregateResult agg : AggregateResultList){ 
            	dateAttendees.put((date)agg.get('StartDate'), (decimal)agg.get('Attendees')); 
        	} 
    	}
		//system.debug(dateAttendees);        
        return dateAttendees;
    }
    
}