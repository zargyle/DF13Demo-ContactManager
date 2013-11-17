global virtual class Result {

	/*
		Holds the success value of the requested result
	*/
	public Boolean success { 
		get {
			if(success == null)
				success = false;
			return success;
		} set;
	}
	
	/*
		Holds the list of records for the requested result
	*/
	public List<sObject> records {
		get {
			if(records == null)
				records = new List<Sobject>();
			return records;
		} set;
	}
	
	public String message { get; set; }//this can be null

	public exceptionClass except { get; set; }

	/*
		setException
		@param Exception ex
		@return Result

		This function will set the proper values for the exception,
		as well as the message and success to false. This then returns 
		itself allowing for a chained set and return.

		ie:
		catch(Exception ex) {
			return result.setException(ex);
		}
	*/
	public virtual Result setException(Exception ex) {
		//lets make sure success is false
		this.success = false;
		this.message = 'Error, line [' + ex.getLineNumber() + ']: ' + ex.getMessage();

		//set detailed exeption
		this.except = new exceptionClass(ex);

		//return this to chain or return
		return this;
	}

	/*
		Function setRecords
		@params List<sObject> rs
		@return Result

		This function will set a successful batch of records to be 
		returned in the result. This will set the success to true and return
		itself for chaining

		ie:
		try {
			List<Account> accounts = selector.getRecords(ids);
			return result.setRecords(accounts);
		}
	*/
	public virtual Result setRecords(List<sObject> rs) {
		//set the records
		this.records = rs;

		//lets set success to true
		this.success = true;

		//return this to chain or return
		return this;
	}
	public virtual Result setRecord(sObject r) {
		//set the records
		List<sObject> rs = new List<sObject>{ r };
		this.records = rs;

		//lets set success to true
		this.success = true;

		//return this to chain or return
		return this;
	}

	/*
		standard exception class to hold useful information for errors
	*/
	public class exceptionClass {
		public Integer lineNumber { get; set; }
		public String message { get; set; }
		public String stackTraceString { get; set; }
		public String typeName { get; set; }

		/*
			Constructor
			@params Exception ex

			Sets this classes values to the exception values 
		*/
		public exceptionClass(Exception ex) {
			this.lineNumber = ex.getLineNumber();
			this.message = ex.getMessage();
			this.stackTraceString = ex.getStackTraceString();
			this.typeName = ex.getTypeName();
		}
	}
}

/*

	Extensions of this class will allow for additional results to be returned
	for specific application needs.

	class ResultWithCount extends Result() {
		public Integer recordCount {get; set;}
		
		public override Result setRecords(List<sObject> rs) {
			this.recordCount = rs.size();
			return super.setRecords(rs);
		}
	}
	

	class myResult extends Result() {
		public Map<Id, List<Contact>> relatedContacts{ 
			get {
				if(relatedContacts == null)
					relatedContacts = new Map<Id, List<Contact>>();
				return relatedContacts;
			} set; 
		}

		public Result setRelatedContacts(Id accountId, List<Contact> contacts) {
			this.relatedContacts.put(Id, contacts);
			return this;
		}
	}


*/