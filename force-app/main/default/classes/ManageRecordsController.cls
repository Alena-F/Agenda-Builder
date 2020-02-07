public with sharing class ManageRecordsController {  

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
      //system.debug(countWorkshops);
      return countWorkshops;
   } 

   @AuraEnabled
    public static List<SObject> getWorkshops(Id recordid, String filterValue, Integer pagenumber, Integer numberOfRecords, Integer pageSize){
      Date today = date.today();
      List<Id> idWorkshopsList = new List<Id>();
      for (Agenda_Workshop__c aw : [SELECT Workshop__r.ID FROM Agenda_Workshop__c 
                                      WHERE Agenda__r.Id = :recordid and Workshop__r.Remaining_Spots__c = 0 and day_only(Workshop__r.Start_Date_Time__c) >= :today]) {
			idWorkshopsList.add(aw.Workshop__r.ID);
		  }
        system.debug(pagenumber);
        system.debug(numberOfRecords);
        system.debug(pageSize);
      Integer offset = (pageSize * (pagenumber - 1));
        system.debug(offset);
      List<Workshop__c> workshops = new List<Workshop__c>();
      if(filterValue != '') {        
        workshops = [SELECT Name, Start_Date_Time__c, Remaining_Spots__c,Category__c, 
                      (SELECT Number_of_Attendees__c FROM Agenda_Workshops__r 
                      WHERE Agenda__r.Id = :recordid) FROM Workshop__c 
                      WHERE (Remaining_Spots__c >0 and day_only(Start_Date_Time__c) >= :today and Category__c = :filterValue) or
                      ( Remaining_Spots__c = 0 and ID IN :idWorkshopsList and Category__c = :filterValue) 
                      ORDER BY Start_Date_Time__c LIMIT :pageSize OFFSET :offset];
      } else {
        workshops = [SELECT Name, Start_Date_Time__c, Remaining_Spots__c,Category__c, 
                    (SELECT Number_of_Attendees__c FROM Agenda_Workshops__r 
                    WHERE Agenda__r.Id = :recordid) FROM Workshop__c 
                    WHERE (Remaining_Spots__c >0 and day_only(Start_Date_Time__c) >= :today) or ( Remaining_Spots__c = 0 and ID IN :idWorkshopsList) 
                    ORDER BY Start_Date_Time__c LIMIT :pageSize OFFSET :offset];  
      }
      system.debug(workshops);
      //countAttendees(workshops, recordid);
      return workshops;
    }
    
    @AuraEnabled
    public static List<SObject> getAllWorkshops(Id recordid, String filterValue){
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
      system.debug(workshops);
      //countAttendees(workshops, recordid);
      return workshops;
    }
    
    @AuraEnabled
    public static map<date,decimal> countAttendees (Id recordid, String filterValue)/*(List<Workshop__c> workshops, Id recordid)*/{
        List<Workshop__c> workshops = getAllWorkshops(recordid, filterValue);
    	map<date,decimal> dateAttendees =new map<date,decimal>();
      List<Id> idWorkshops = new List<Id>();
      for (Workshop__c w : workshops) {
        idWorkshops.add(w.ID);
      }
    //system.debug(idWorkshops);
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
		system.debug(dateAttendees);        
    	return dateAttendees;
    }
    
    @AuraEnabled
    public static List<Agenda_Workshop__c> updateAgendaWorkshops(ID agendaId, List<Agenda_Workshop__c> agendaWorkshops){
        List<Agenda_Workshop__c> newAgendaWorkshops = new List<Agenda_Workshop__c>();
        List<Agenda_Workshop__c> delAgendaWorkshops = new List<Agenda_Workshop__c>();
                
        for (Agenda_Workshop__c aw : agendaWorkshops){
           
            if(aw.Number_of_Attendees__c == 0) {
                Agenda_Workshop__c newAW = new Agenda_Workshop__c(Id= aw.Id, Agenda__c=agendaId, Workshop__c = aw.Workshop__c, Primary_Attendee__c = aw.Primary_Attendee__c);
              	delAgendaWorkshops.add(newAW);  
            } else {
                Agenda_Workshop__c newAW = new Agenda_Workshop__c(Id= aw.Id, Agenda__c=agendaId, Number_of_Attendees__c= aw.Number_of_Attendees__c, Workshop__c = aw.Workshop__c, Primary_Attendee__c = aw.Primary_Attendee__c);
            	newAgendaWorkshops.add(newAW);
            }
        }
        
        if (delAgendaWorkshops.size() > 0) {
            delete delAgendaWorkshops;
        }
        
        upsert NewAgendaWorkshops;
        return newAgendaWorkshops;
    }
 }