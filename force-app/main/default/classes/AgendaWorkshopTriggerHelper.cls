public class AgendaWorkshopTriggerHelper {
	public static void updateRelatedWorkshops(Map<Id, Agenda_Workshop__c> newAWMap, Map<Id, Agenda_Workshop__c> oldAWMap){
        List<Agenda_Workshop__c> newAWList = newAWMap.values();
        List<Agenda_Workshop__c> oldAWList = oldAWMap.values();
        List<Workshop__c> workshopsToUpdate = new List<Workshop__c>{};
        Map<Id,Id> WorkshopsToAWMap = new Map<Id,Id>();
        
        if (newAWMap.isEmpty()) {
            for(Agenda_Workshop__c A : oldAWList) {
            	WorkshopsToAWMap.put(A.Workshop__c,A.Id);
        	}
        } else {
        	for(Agenda_Workshop__c A : newAWList) {
            	WorkshopsToAWMap.put(A.Workshop__c,A.Id);
        	}
    	}
        		
        for (Workshop__c Workshop: [SELECT Id, Reserved_Spots__c, Remaining_Spots__c FROM Workshop__c WHERE Id IN:  WorkshopsToAWMap.keySet()])   {
            Id awId = WorkshopsToAWMap.get(Workshop.Id);
            Agenda_Workshop__c aw = newAWMap.get(awId);
            if(!oldAWMap.isEmpty()) {
            Agenda_Workshop__c oldAw = oldAWMap.get(awId);
            Workshop.Reserved_Spots__c -= oldAw.Number_of_Attendees__c;
            }
            if (newAWMap.isEmpty()) {
                workshopsToUpdate.add(Workshop);
            } else {
                if (Workshop.Remaining_Spots__c >= aw.Number_of_Attendees__c){
                	Workshop.Reserved_Spots__c += aw.Number_of_Attendees__c;
                	workshopsToUpdate.add(Workshop);
            	} else {
                	aw.addError('Number of Attendees can not be greater than number of Remaining Spots');
            	}
            }
         }
        
        if(workshopsToUpdate != null && !workshopsToUpdate.isEmpty()) {
            Database.update(workshopsToUpdate);
        }
    }
}