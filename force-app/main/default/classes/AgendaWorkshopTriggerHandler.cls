public class AgendaWorkshopTriggerHandler implements ITriggerHandler {
    
	public Boolean IsDisabled(){
      return false;
    }
 
    public void BeforeInsert(List<SObject> newItems) {}
 
    public void BeforeUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems) {}
 
    public void BeforeDelete(Map<Id, SObject> oldItems) {}
 
    public void AfterInsert(Map<Id, SObject> newItems) {
        Map<Id, Agenda_Workshop__c> newAWMap = (Map<Id, Agenda_Workshop__c>)newItems;
        Map<Id, Agenda_Workshop__c> oldAWMap = new Map<Id, Agenda_Workshop__c>();
        AgendaWorkshopTriggerHelper.updateRelatedWorkshops(newAWMap,oldAWMap);
        AgendaWorkshopTriggerHelper.updateRelatedContacts();
    }
 
    public void AfterUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems) {
        Map<Id, Agenda_Workshop__c> newAWMap = (Map<Id, Agenda_Workshop__c>)newItems;
        Map<Id, Agenda_Workshop__c> oldAWMap = (Map<Id, Agenda_Workshop__c>)oldItems;
        AgendaWorkshopTriggerHelper.updateRelatedWorkshops(newAWMap,oldAWMap);
        AgendaWorkshopTriggerHelper.updateRelatedContacts();
    }
 
    public void AfterDelete(Map<Id, SObject> oldItems) {
        Map<Id, Agenda_Workshop__c> oldAWMap = (Map<Id, Agenda_Workshop__c>)oldItems;
        Map<Id, Agenda_Workshop__c> newAWMap = new Map<Id, Agenda_Workshop__c>();
        AgendaWorkshopTriggerHelper.updateRelatedWorkshops(newAWMap,oldAWMap);
        AgendaWorkshopTriggerHelper.updateRelatedContacts();
     }
 
    public void AfterUndelete(Map<Id, SObject> oldItems) {}
}