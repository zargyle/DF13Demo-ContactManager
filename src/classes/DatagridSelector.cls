global with sharing class DatagridSelector extends ra_SObjectSelector{
	global DatagridSelector() {  }
	global List<sObject> records;
	global Integer totalRecords;
	global Integer currentPage;
	global Integer pageSize;
	global Integer currentResultSet;
	global Integer currentResult;
	global Boolean hasNext;
	global Boolean hasPrevious;
	global Integer inClauseCount; //determines the where Id in subquery. need parsing to solve without this 

	global override void setPagination(Integer page, Integer pageSize) {
		this.limitAmount = pageSize;
		this.offset = (page - 1) * pageSize;
		this.currentPage = page;
		this.pageSize = pageSize;
	}

	global DatagridSelector runQuery(String query, Integer page, Integer pageSizeIn) {
		this.pageSize = pageSizeIn;
		this.currentPage = page;
		ApexPages.StandardSetController c = new ApexPages.StandardSetController(Database.getQueryLocator(query));

		if(c.getResultSize() > 0) {
		
			c.setPageNumber(this.currentPage);
			c.setPageSize(this.pageSize);
			
			this.totalRecords = c.getResultSize();
			if(this.currentPage == 1) {
				this.currentResult = 1;
				this.currentResultSet = this.pageSize;
				if(this.currentResultSet > this.totalRecords)
					this.currentResultSet = this.totalRecords;
			} else {
				this.currentResult = ((this.currentPage -1) * this.pageSize) + 1;
				this.currentResultSet = this.currentPage * this.pageSize;
				if(this.currentResultSet > this.totalRecords)
					this.currentResultSet = this.totalRecords;
			}
			//This area is inefficient and needs rework, but if I dont call twice the pagination wont set in? 
			this.records = c.getRecords();
			system.debug(this.records);

			c.setPageNumber(this.currentPage);
			this.records = c.getRecords();
			system.debug(this.records[0]);

		}
		this.hasNext = c.getHasNext();
		this.hasPrevious = c.getHasPrevious();
		return this;
	}
		//this takes an extra query and more calcs, however it saves on the slow StandardSetController on Large data sets
	//assumes you already set pagination if you want it.
	global DatagridSelector runQueryFast(String query) {
		//lets create our count query from the query we recieved. 
		system.debug('***Before: '+query);
		String tmpQueryPart;
		//example select Id, Name from Account Where Name like '%Bob%' order by Name 
		//this is everything to the left of the order by, the last one
		String tmpQuery = query;
		String totalQuery;
		List<String> tmpQueryParts = tmpQuery.split('order by');
		
		if(tmpQueryParts.size() > 1) {
			tmpQuery = tmpQuery.left( (tmpQuery.length() - tmpQueryParts[(tmpQueryParts.size() - 1)].length() ) - 8 );//8 for size of 'order by'
		} 

		system.debug('**mid: ' + tmpQuery);
		tmpQueryParts = tmpQuery.split('from ');
		if(this.inClauseCount == null)
			this.inClauseCount = 0;
		tmpQuery = tmpQueryParts[(tmpQueryParts.size() - (1 + inClauseCount))];
		if(inClauseCount > 0)
			tmpQuery += ' from ' + tmpQueryParts[(tmpQueryParts.size() - (1 + inClauseCount)) + 1];//todo loop me to support multiple. Or change parsing.
		
		system.debug('**mid2: ' + tmpQuery);

		totalQuery = 'select count() from ' + tmpQuery;
		system.debug('BUILT QUERY COUNT [' + totalQuery + ']');
		//totalQuery = -----'Account Where Name like \'%Bob%\''-----
		//we now have our object / where clause. and we prepended the 'select count() from '

		this.totalRecords = (Integer)database.countQuery(totalQuery);
		if(this.totalRecords > 0) {
			//we have records, so lets get the pagination now if we got it
			if(this.currentPage != null && this.pageSize != null) {
				query += ' limit ' + String.valueOf(this.pageSize) + ' offset ' + String.valueOf((this.currentpage -1)*this.pageSize);
			}
			system.debug('***QUERY[' + query + ']');
			this.records = database.query(query);

			//set page numbers
			if(this.currentPage == 1) {
				this.hasPrevious = false;
				this.currentResult = 1;
				this.currentResultSet = this.pageSize;
				if(this.currentResultSet >= this.totalRecords) {
					this.currentResultSet = this.totalRecords;
					this.hasNext = false;
				} else
					this.hasNext = true;
			} else {
				this.hasPrevious = true; //we are past the first page, therefore we have a previous
				this.currentResult = ((this.currentPage -1) * this.pageSize) + 1;
				this.currentResultSet = this.currentPage * this.pageSize;
				if(this.currentResultSet >= this.totalRecords) {
					this.currentResultSet = this.totalRecords;
					this.hasNext = false;
				} else
					this.hasNext = true; //we are not over our set, therefore we have more 
			}
		}
		
		return this;
	}

	/*
	//sometimes we need to have where Id in :ids, this create an issue with variable context if we were to pass down the string. 
	global DatagridSelector handleResult(ApexPages.StandardSetController c, Integer page, Integer pageSizeIn) {
		this.pageSize = pageSizeIn;
		this.currentPage = page;
		if(c.getResultSize() > 0) {
		
			c.setPageNumber(this.currentPage);
			c.setPageSize(this.pageSize);
			
			this.totalRecords = c.getResultSize();
			if(this.currentPage == 1) {
				this.currentResult = 1;
				this.currentResultSet = this.pageSize;
				if(this.currentResultSet > this.totalRecords)
					this.currentResultSet = this.totalRecords;
			} else {
				this.currentResult = ((this.currentPage -1) * this.pageSize) + 1;
				this.currentResultSet = this.currentPage * this.pageSize;
				if(this.currentResultSet > this.totalRecords)
					this.currentResultSet = this.totalRecords;
			}
			//This area is inefficient and needs rework, but if I dont call twice the pagination wont set in? 
			this.records = c.getRecords();
			system.debug(this.records);

			c.setPageNumber(this.currentPage);
			this.records = c.getRecords();
			system.debug(this.records[0]);

		}
		this.hasNext = c.getHasNext();
		this.hasPrevious = c.getHasPrevious();
		return this;
	}

	//this takes an extra query and more calcs, however it saves on the slow StandardSetController on Large data sets
	//Pass me your already done queries and we are all set.
	global DatagridSelector handleResultFast(List<SObject> records, Integer totalRecordsIn) {
		this.totalRecords = totalRecordsIn;
		this.records = records;
		if(this.totalRecords > 0) {
			//set page numbers
			if(this.currentPage == 1) {
				this.currentResult = 1;
				this.currentResultSet = this.pageSize;
				if(this.currentResultSet > this.totalRecords)
					this.currentResultSet = this.totalRecords;
				else
					this.hasNext = true; //we are not over our set, therefore we have more 
			} else {
				this.hasPrevious = true; //we are past the first page, therefore we have a previous
				this.currentResult = ((this.currentPage -1) * this.pageSize) + 1;
				this.currentResultSet = this.currentPage * this.pageSize;
				if(this.currentResultSet >= this.totalRecords)
					this.currentResultSet = this.totalRecords;
				else
					this.hasNext = true; //we are not over our set, therefore we have more 
			}
		} else {
			this.currentResult = 0;
			this.currentResultSet = 0;
		}
		
		return this;
	}*/

	@isTest
	static global void testSetPagination() {
		DatagridSelector datagridSelector = new DatagridSelector();
		system.assertEquals(null, datagridSelector.limitAmount);
		system.assertEquals(null, datagridSelector.offset);
		system.assertEquals(null, datagridSelector.currentPage);
		system.assertEquals(null, datagridSelector.pageSize);

		datagridSelector.setPagination(1, 10);
		system.assertEquals(10, datagridSelector.limitAmount);
		system.assertEquals(0, datagridSelector.offset);
		system.assertEquals(1, datagridSelector.currentPage);
		system.assertEquals(10, datagridSelector.pageSize);

		datagridSelector.setPagination(2, 25);
		system.assertEquals(25, datagridSelector.limitAmount);
		system.assertEquals(25, datagridSelector.offset);
		system.assertEquals(2, datagridSelector.currentPage);
		system.assertEquals(25, datagridSelector.pageSize);

	}

	@isTest
	static global void testRunQuery() {
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < 200; i++) {
			if(i < 47) {
				accounts.add(
					new Account(
						Name = 'base-Account' + i
					)
				);
			} else {
				accounts.add(
					new Account(
						Name = 'other-Account' + i
					)
				);
			}
		}
		insert accounts;
		DatagridSelector datagridSelector = new DatagridSelector();
		DatagridSelector.runQuery('Select Name from Account', 1, 25);
		system.assertEquals(200, datagridSelector.totalRecords);
		system.assertEquals(25, datagridSelector.records.size());

		datagridSelector = new DatagridSelector();
		DatagridSelector.runQuery('Select Name from Account where Name like \'base-Account%\'', 1, 10);
		system.assertEquals(47, datagridSelector.totalRecords);
		system.assertEquals(10, datagridSelector.records.size());
		DatagridSelector.runQuery('Select Name from Account where Name like \'base-Account%\'', 5, 10);
		system.assertEquals(47, datagridSelector.totalRecords);
		system.assertEquals(7, datagridSelector.records.size());

	}

	@isTest
	static global void testRunQueryFast() {
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < 200; i++) {
			if(i < 47) {
				accounts.add(
					new Account(
						Name = 'base-Account' + i
					)
				);
			} else {
				accounts.add(
					new Account(
						Name = 'other-Account' + i
					)
				);
			}
		}
		insert accounts;
		DatagridSelector datagridSelector = new DatagridSelector();
		datagridSelector.setPagination(1, 25);
		DatagridSelector.runQueryFast('Select Name from Account');
		system.assertEquals(200, datagridSelector.totalRecords);
		system.assertEquals(25, datagridSelector.records.size());

		datagridSelector = new DatagridSelector();
		datagridSelector.setPagination(1, 10);
		DatagridSelector.runQueryFast('Select Name from Account where Name like \'base-Account%\'');
		system.assertEquals(47, datagridSelector.totalRecords);
		system.assertEquals(10, datagridSelector.records.size());
		datagridSelector.setPagination(5, 10);
		DatagridSelector.runQueryFast('Select Name from Account where Name like \'base-Account%\'');
		system.assertEquals(47, datagridSelector.totalRecords);
		system.assertEquals(7, datagridSelector.records.size());

	}

	@isTest
	static global void testHandleResultFast() {
		List<Account> accounts = new List<Account>();
		for(Integer i = 0; i < 200; i++) {
			if(i < 47) {
				accounts.add(
					new Account(
						Name = 'base-Account' + i
					)
				);
			} else {
				accounts.add(
					new Account(
						Name = 'other-Account' + i
					)
				);
			}
		}
		insert accounts;
		accounts = database.query('Select Name from Account where Name like \'base-Account%\'');

		
	}
}