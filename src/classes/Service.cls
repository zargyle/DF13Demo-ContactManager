global with sharing class Service {
	//lets create out static result
	static Result result = new Result();

	/*
	*	Base Services 
	*/

	@remoteAction
	static global Result query(String query) {
		try {
			if(query.contains('{USERID}'))
				query = query.replace('{USERID}', UserInfo.getUserId());
			result.message = query;
			return result.setRecords( database.query(query) );
		} catch(Exception ex) {
			return result.setException(ex);
		}
	}

	@remoteAction
	static global ResultWithAccessRecords queryWithAccess(String query) {
		ResultWithAccessRecords result2 = new ResultWithAccessRecords();
		try {
			if(query.contains('{USERID}'))
				query = query.replace('{USERID}', UserInfo.getUserId());
			List<SObject> sObjects =  database.query(query);
			Map<Id, SObject> map_objectMap = new Map<Id, sObject>();
			List<Id> recordIds = new List<Id>();
			for(SObject record : sObjects) {
				recordIds.add(record.Id);
				map_objectMap.put(record.Id, record);
			}
			Result accessResult = Service.getRecordsAccess(recordIds);
			List<AccessRecord> accessRecords = new List<AccessRecord>();
			for(SObject record : accessResult.records) {
				AccessRecord accessRecord = new AccessRecord();
				accessRecord.access = (UserRecordAccess)record;
				accessRecord.record = map_objectMap.get(((UserRecordAccess)record).RecordId);
				accessRecords.add(accessRecord);
			}
			result2.accessRecords = accessRecords;
			result2.success = true;
			return result2;
		} catch(Exception ex) {
			result2.setException(ex);
			return result2;
		}
	}

	//Todo: Phase out the objectType here. This needs to be casted prior anyways and keeps dynamics
	@remoteAction
	static global Result save(String objectType, List<sObject> sObjects) {
		try {
			system.debug('***: save attempt.');
			List<Schema.SObjectType> SERVICE_SOBJECTS = new List<Schema.SObjectType>{
				sObjects[0].getSObjectType()
			};
			fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(SERVICE_SOBJECTS);

			uow.registerMixed(sObjects);

			uow.commitWork();

			return result.setRecords(sObjects);
		}catch(Exception ex) {
			system.debug('***: save failed: ' + ex.getMessage());
			return result.setException(ex);
		}
	}

	/*
		There may be some manual work here if you want to get more kinds of custom settings 
	*/
	@remoteAction
	static global Result getCustomSettings(String customSettings) {
		try {
			try {
				result.setRecords(database.query('select Variable_Name__c, Variable_Value__c from ' + customSettings));
			} catch(Exception ex) {
				//continue settings
			}
			if(result.records.size() > 0)
				return result;
			/*
				Get Custom Options in a different way. 
			if(customSettings == 'MySettings__c') {
				result.setRecords(MySettings__c.getAll().values());
			} else {
				result.message = 'No Custom Settings found for: ' + customSettings;
			}*/
			result.message = 'No Custom Settings found for: ' + customSettings;
			return result;
		} catch(Exception except) {
			return result.setException(except);
		}
	}

	@remoteAction
	static global Result deleteObjects(String objectType, List<sObject> sObjects) {
		try {
			List<Schema.SObjectType> SERVICE_SOBJECTS = new List<Schema.SObjectType>{
				sObjects[0].getSObjectType()
			};
			fflib_SObjectUnitOfWork uow = new fflib_SObjectUnitOfWork(SERVICE_SOBJECTS);
			uow.registerDeleted(sObjects);
			uow.commitWork();
			return result.setRecords(sObjects);
		} catch(Exception except) {
			return result.setException(except);
		}
	}

	@remoteAction
	static global ResultWithDatagridSelector datagrid(DatagridSelector datagridSelector) {
		ResultWithDatagridSelector resultWithDatagridSelector = new ResultWithDatagridSelector();
		try {
			system.debug(datagridSelector);
			if(datagridSelector.currentPage == null)
				datagridSelector.currentPage = 1;
			if(datagridSelector.pageSize == null )
				datagridSelector.pageSize = 10;
			datagridSelector.runQueryFast(datagridSelector.queryString);
			resultWithDatagridSelector.success = true;
			resultWithDatagridSelector.datagridSelector = datagridSelector;
			return resultWithDatagridSelector;
		}catch(Exception ex) {
			resultWithDatagridSelector.setException(ex);
			return resultWithDatagridSelector;
		}
	}

	@remoteAction
	static global ResultWithOptions getPicklistOptions(String objectName, List<String> fields) {
		ResultWithOptions result2 = new ResultWithOptions();
		try {
			Map<String, List<PicklistOption>> optionsMap = new Map<String, List<PicklistOption>>();
			for(String field : fields) {
				List<PicklistOption> options = new List<PicklistOption>();
				List <Schema.PicklistEntry> picklistEntries = RA_Schema.getField(objectName, field).getDescribe().getPicklistValues();
				for(Schema.PicklistEntry picklistEntry : picklistEntries) {
					if(picklistEntry.isActive()) {
						PicklistOption option = new PicklistOption();
						option.label = picklistEntry.getLabel();
						option.value = picklistEntry.getValue();
						option.defaultValue = picklistEntry.isDefaultValue();
						options.add(option);
					}
					optionsMap.put(field,options);
				}
			}
			result2.optionsMap = optionsMap;
			result2.success = true;
			return result2;
		} catch(Exception except) {
			result2.setException(except);
			return result2;
		}
	}

	@remoteAction
	static global Result getRecordsAccess(List<Id> recordIds) {
		try {
			return result.setRecords([SELECT RecordId, MaxAccessLevel FROM UserRecordAccess WHERE UserId = :UserInfo.getUserId() AND RecordId in :recordIds]);
		} catch(Exception except) {
			return result.setException(except);
		}
	}



	global class ResultWithAccessRecords extends Result {
		global List<AccessRecord> accessRecords;
	}

	global class AccessRecord { 
		global SObject record;
		global UserRecordAccess access;
	}

	global class ResultWithDatagridSelector extends Result {
		global DatagridSelector datagridSelector;
	}

	global class ResultWithOptions extends Result{
		global Map<String, List<PicklistOption>> optionsMap;
	}
	global class PicklistOption {
		global String label;
		global String value;
		global Boolean defaultValue;
	}


}