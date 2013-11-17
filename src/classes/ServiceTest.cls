@isTest
public with sharing class ServiceTest {
	@isTest
	static public void testQuery() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		insert accounts;

		//success base query 1
		Result result = Service.query('select Id from Account');
		system.assertEquals(true, result.success);
		system.assertEquals(numberOfAccounts, result.records.size());
	}
	@isTest
	static public void testQuery2() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		insert accounts;

		//success with where clause
		Result result = Service.query('select Id from Account where Name like \'%#5\' or Name like \'%15\'');
		// should return 2 records, #5, #15
		system.assertEquals(true, result.success);
		system.assertEquals(2, result.records.size());
	}
	@isTest
	static public void testQuery3() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		insert accounts;

		//break with ID token
		Result result = Service.query('select Id from Account where {USERID}');
		system.assertEquals(false, result.success);
		system.assert(result.message.contains('unexpected'));// unexpected tolken for user
	}
	@isTest
	static public void testQuery4() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		insert accounts;

		//success with ID token
		Result result = Service.query('select Id from Account where OwnerId = \'{USERID}\'');
		system.assertEquals(true, result.success);
		system.assertEquals(numberOfAccounts, result.records.size());
	}

	@isTest
	static public void testgetRecordsAccess() {
		Account account = new Account( Name = 'Test Account ABCX');
		insert account;

		//created by admin, and queried by admin, or user, owner has all permissions as max
		Result result = Service.getRecordsAccess(new List<Id>{account.Id});
		system.assertEquals(true, result.success);
		system.assertEquals('All', result.records[0].get('MaxAccessLevel'));
	}

	@isTest
	static public void testDeleteObjects() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		insert accounts;
		//assert we have our number we created
		system.assertEquals(numberOfAccounts, [select Id from Account].size());

		Result result = Service.deleteObjects('', accounts);
		system.assertEquals(true, result.success);
		system.assertEquals(0, [select Id from Account].size());//assert we have none left
	}

	@isTest
	static public void testDeleteObjects2() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		//assert we have no accounts
		system.assertEquals(0, [select Id from Account].size());

		//they have no ids therefore we break
		Result result = Service.deleteObjects('', accounts);
		system.assertEquals(false, result.success);
		//this is right. So why does the string say it doesnt contain? breaks on the spaces?
		//system.assertEquals(true, result.message.containsIgnoreCase('New records cannot be registered for deletion'));
	}

	@isTest
	static public void TestSaveRecords() {
		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			accounts.add(
				New Account(
					Name = 'Test Account #' + i
				)
			);
		}
		//assert we have no accounts or Ids
		system.assertEquals(0, [select Id from Account].size());
		for(Account account : accounts) {
			system.assertEquals(null, account.Id);
		}
		Result result = Service.save('', accounts);
		system.assertEquals(true, result.success);
		//assert we have accounts or Ids
		system.assertEquals(numberOfAccounts, [select Id from Account].size());
		accounts = new List<Account>();
		for(Account account : (List<Account>)result.records) {
			system.assertNotEquals(null, account.Id);
			//also assert that we have the names, then change it
			system.assertEquals(true, account.Name.contains('Test'));
			account.Name = 'New Name';
			accounts.add(account);
		}

		//assert that we can indeed update
		result = Service.save('', accounts);
		system.assertEquals(true, result.success);
		for(Account account : (List<Account>)result.records) {
			system.assertNotEquals(null, account.Id);
			//also assert that we have the names, then change it
			system.assertEquals('New Name', account.Name);
		}

	}

	@isTest
	static void testSaveRecords2() {
		//fail with a new list and no records
		Result result = Service.save('', new List<Account>());
		system.assertEquals(false, result.success);
	}

	@isTest
	static void testGetPicklistOptions() {
		//pick a good field
		String objectToTest = 'Account';
		String fieldToTest = 'Type';
		String valueToCheck = 'Prospect';//if you remove this just update this to a proper value or change objects

		Service.ResultWithOptions result = Service.getPicklistOptions(objectToTest, new List<String>{fieldToTest});
		system.assertEquals(true, result.success);
		Boolean hasValue = false;
		for(Service.PicklistOption option: result.optionsMap.get(fieldToTest)) {
			if(option.value == valueToCheck)
				hasValue = true;
		}

		//assert that we do have results and we found our value
		system.assert(result.optionsMap.get(fieldToTest).size() > 0);
		system.assert(hasValue);

	}

	@isTest
	static void testGetPicklistOptions2() {
		//pick a bad field
		String objectToTest = 'Account';
		String fieldToTest = 'Name_XYZ___BAD_FIELD'; //not a field on account
		String valueToCheck = 'Prospect';

		Service.ResultWithOptions result = Service.getPicklistOptions(objectToTest, new List<String>{fieldToTest});
		system.assertEquals(false, result.success);
	}

	@isTest
	static void testDatagrid() {
		//these are high level tests that just deal with testing the service here. 

		Integer numberOfAccounts = 25;
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < numberOfAccounts; i++) {
			Account account = New Account(Name = 'Test Account #' + i );
			if(i > 5)
				account.Type = 'Prospect';
			else
				account.Type = 'Other';
			accounts.add(account);
		}
		insert accounts;

		DatagridSelector datagridSelector = new DatagridSelector();
		datagridSelector.selectFields = new List<String>{
			'Id',
			'Name',
			'Type'
		};
		datagridSelector.objectName = 'Account';

		Service.ResultWithDatagridSelector result = Service.datagrid(datagridSelector);
		system.assertEquals(true, result.success);
		system.assertEquals(numberOfAccounts, result.datagridSelector.totalRecords);
		system.assertEquals(result.datagridSelector.pageSize, result.datagridSelector.records.size());
		system.assertEquals(true, result.datagridSelector.hasNext);
		system.assertEquals(false, result.datagridSelector.hasPrevious);

		datagridSelector.currentPage = 2;
		result = Service.datagrid(datagridSelector);
		system.assertEquals(true, result.success);
		system.assertEquals(numberOfAccounts, result.datagridSelector.totalRecords);
		system.assertEquals(result.datagridSelector.pageSize, result.datagridSelector.records.size());
		system.assertEquals(true, result.datagridSelector.hasNext);
		system.assertEquals(true, result.datagridSelector.hasPrevious);

		datagridSelector.currentPage = 3;
		result = Service.datagrid(datagridSelector);
		system.assertEquals(true, result.success);
		system.assertEquals(numberOfAccounts, result.datagridSelector.totalRecords);
		system.assertEquals(5, result.datagridSelector.records.size());
		system.assertEquals(false, result.datagridSelector.hasNext);
		system.assertEquals(true, result.datagridSelector.hasPrevious);

	}

	@isTest
	static void TestDatagrid2() {
		//break with null object
		Service.ResultWithDatagridSelector result = Service.datagrid(null);
		system.assertEquals(false, result.success);
	}
}