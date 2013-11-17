public with sharing class RA_Schema {

	private static Map<String, String> namePrefixMapCache {
		get {
			if(namePrefixMapCache == null) namePrefixMapCache = new Map<String, String>();
			return namePrefixMapCache;
		}
		set;
	}
	
	private static Map<String, String> prefixNameMapCache { 
		get {
			if(prefixNameMapCache == null) prefixNameMapCache = new Map<String, String>();
			return prefixNameMapCache;
		}
		set;
	}
	
	private static Map<String, Map<String, Schema.sObjectField>> sObjectTypeFieldsCache { 
		get {
			if(sObjectTypeFieldsCache == null) sObjectTypeFieldsCache = new Map<String, Map<String, Schema.sObjectField>>();
			return sObjectTypeFieldsCache;
		}
		set;
	}

	private static Map<String, Schema.SObjectType> globalDescribe {
		get {
			if(globalDescribe == null) globalDescribe = Schema.getGlobalDescribe();
			return globalDescribe;
		}
		set;
	}
	
	public static String getPrefix(String SObjectTypeName) {
		if(namePrefixMapCache.containsKey(SObjectTypeName)) return namePrefixMapCache.get(SObjectTypeName);
		String prefix = globalDescribe.get(SObjectTypeName).getDescribe().getKeyPrefix();
		namePrefixMapCache.put(SObjectTypeName, prefix);
		prefixNameMapCache.put(prefix, SObjectTypeName);
		return prefix;
	}
	
	public static String getNameByPrefix(String prefix) {
		
		if(prefixNameMapCache.containsKey(prefix)) return prefixNameMapCache.get(prefix);
		
		for(Schema.sObjectType sot : globalDescribe.values()) {
			Schema.DescribeSObjectResult D = sot.getDescribe();
			String keyPrefix = sot.getDescribe().getKeyPrefix();
			String name = sot.getDescribe().getName();
			
			// build as we go
			if(!prefixNameMapCache.containsKey(keyPrefix)) prefixNameMapCache.put(keyPrefix, name);
			if(!namePrefixMapCache.containsKey(name)) namePrefixMapCache.put(name, keyPrefix);
			
			if(keyPrefix == prefix) return name;
			
		}
		
		return null;
		
	}
	
	public static Schema.SObjectType getSObjectTypeByName(String name) {
		return globalDescribe.get(name);
	}
	
	public static Schema.SObjectType getSObjectTypeByPrefix(String prefix) {
		String name = getNameByPrefix(prefix);
		if(name == null) return null;
		return globalDescribe.get(name);
	}
	
	public static Map<String, Schema.sObjectField> getFields(String sObjectTypeName) {
		if(sObjectTypeFieldsCache.containsKey(sObjectTypeName)) return sObjectTypeFieldsCache.get(sObjectTypeName);
		Map<String, Schema.sObjectField> fieldsMap = getSObjectTypeByName(sObjectTypeName).getDescribe().fields.getMap();
		sObjectTypeFieldsCache.put(sObjectTypeName, fieldsMap);
		return fieldsMap;
	}

	public static Schema.sObjectField getField(String sObjectTypeName, String fieldNameOrPath) {

		if(fieldNameOrPath.indexOf('.') == -1) {
			// easy case, just find the field
			return getFields(sObjectTypeName).get(fieldNameOrPath);
		}
		else {
			// trickier, need to traverse path
			String firstPathStep = RA_String.before(fieldNameOrPath, '.');
			system.debug(firstPathStep);
			// need to test for the relationship name in the context of the object  
			
			// TODO: create a cache map for this...
			for(Schema.sObjectField sof : getFields(sObjectTypeName).values()) {
				Schema.DescribeFieldResult d = sof.getDescribe();
				system.debug(d.getType().name().toLowerCase());
				system.debug(d.getRelationshipName()); 
				if(d.getType().name().toLowerCase() == 'reference' && d.getRelationshipName() != null && d.getRelationshipName().toLowerCase() == firstPathStep.toLowerCase()) {
					sObjectTypeName = d.getReferenceTo()[0].getDescribe().getName();
					break;
				}
			}
			
			return RA_Schema.getField(sObjectTypeName, RA_String.after(fieldNameOrPath, '.'));
		}
		  
	}
	
	public static testmethod void test() {
		
		String accountPrefix = RA_Schema.getPrefix('Account');
		Schema.SObjectType accountType = RA_Schema.getSObjectTypeByPrefix(accountPrefix);
		
		Account a = new Account(Name = 'Test');
		insert a;
		Contact c = new Contact(FirstName = 'Test', LastName = 'Test', AccountId = a.Id);
		insert c;  
		
		String contactPrefix = RA_String.keyPrefix(c);  
		Schema.SObjectType contactType = RA_Schema.getSObjectTypeByPrefix(contactPrefix);
		
		system.assertEquals(null, RA_Schema.getSObjectTypeByPrefix('ZZZ'));
		
	}
	
}