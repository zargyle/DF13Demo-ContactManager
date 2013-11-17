/**
 * Copyright (c) 2012, Redargyle.com, inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, 
 *   are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *      this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *      this list of conditions and the following disclaimer in the documentation 
 *      and/or other materials provided with the distribution.
 * - Neither the name of the FinancialForce.com, inc nor the names of its contributors 
 *      may be used to endorse or promote products derived from this software without 
 *      specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND 
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
 *  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 *  THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 *  OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 *  OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

/*
 * This work is based on the fflib_SObjectSelector from Financialforce, extending to keep compatiability
 * Copyright (c) 2012, FinancialForce.com, inc
 * All rights reserved.
*/

public with sharing abstract class ra_SObjectSelector extends fflib_SObjectSelector {
	/* required base class abstracts that are defined and esentially removed here*/
	public virtual  Schema.SObjectType getSObjectType() { return this.objectType; }
	public virtual List<Schema.SObjectField> getSObjectFieldList(){ return new List<Schema.SObjectField>(); }

	//we require nothing of the constructor, but you should define base object / maybe fields in your ext.
	public ra_SObjectSelector() {}

	public Schema.SObjectType objectType;
	public List<String> selectFields = new List<String>();
	public String objectName;
	public String whereClause;
	public String orderBy;
	public String sortField;
	public String sortDirection;
	public Boolean nullsLast = true;
	public Integer limitAmount;
	public Integer offset;
	public Boolean rebuildQuery = true; //set to true to force rebuild query
	public Boolean enforceAccessible = true;
	public String queryString {
		get {
			if(queryString == null || rebuildQuery) {
				boolean hasOrderBy = false;
				//Todo always run through the available fields for the user, and log ones you cannot.
				this.queryString = 'Select ' + selectFieldsString() + ' from ' + this.objectName;
				if(this.whereClause != null && this.whereClause != '') {
					this.queryString += ' where ' + this.whereClause;
				}
				if(this.orderBy != null) {
					this.queryString += ' order by ' + this.orderBy;
					hasOrderBy = true;
				}
				if(this.sortField != null) {
					if(this.orderBy == null)
						this.queryString += ' order by ';
					else
						this.queryString += ', ';
					this.queryString += this.sortField + ' ' + this.sortDirection;
					hasOrderBy = true;
				}
				if(this.nullsLast == true && hasOrderBy)
						this.queryString += ' NULLS Last';
				if(this.limitAmount != null) {
					this.queryString += ' limit ' + String.valueOf(this.limitAmount);
				}
				if(this.offset != null) {
					this.queryString += ' offset ' + String.valueOf(this.offset);
				}
			}
			system.debug('BUILT QUERY [' + this.queryString + ']');
			return this.queryString;
		} set;
	}

	public String countQueryString {
		get {
			if(countQueryString == null) {
				this.countQueryString = 'select count() from ' + this.objectName;
				if(this.whereClause != null) {
					this.countQueryString += ' where ' + this.whereClause;
				}
			}
			return this.countQueryString;
		}set;
	}

	public virtual void setPagination(Integer page, Integer pageSize) {
		this.limitAmount = pageSize;
		this.offset = (page - 1) * pageSize;
	}

	//abstract Schema.SObjectType getSObjectType();
	
	public String selectFieldsString() {
		if(!enforceAccessible)
			return String.join(this.selectFields, ', ');
		List<String> fieldsThatPass = new List<String>();
		for(String field : this.selectFields) {
			if(accessibleFieldsSet.contains(field) || field.contains('__r'))
				fieldsThatPass.add(field);
			else
				system.debug('Field Inaccessible: ' + field);
		}
		return String.join(fieldsThatPass, ', ');
	}

	public List<sObject> Query() {
		return Database.query(this.queryString);
	}

	public List<Schema.sObjectField> getAllFields(Schema.SObjectType objectType) {
		return objectType.getDescribe().fields.getMap().values();
	}

	public List<String> accessibleFields {get;set;}
	public List<String> getAllAccessibleFields () {
		if(accessibleFields == null) {
			List<Schema.sObjectField> sObjectFields = this.getAllFields(this.objectType);
			List<String> fields = new List<String>();
			for(Schema.sObjectField objectField : sObjectFields) {
				Schema.DescribeFieldResult Field = objectField.getDescribe();
				if(Field.isAccessible())
					fields.add( Field.getName() );
			}
			accessibleFields = fields;
		}
		return accessibleFields;
	}

	public Set<String> accessibleFieldsSet {
		get {
			if(accessibleFieldsSet == null) {
				if(accessibleFields == null)
					getAllAccessibleFields();
				accessibleFieldsSet = new Set<String>();
				accessibleFieldsSet.addAll(accessibleFields);
			}
			return accessibleFieldsSet;
		} set;
	}
}