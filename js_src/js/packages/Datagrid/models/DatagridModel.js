//this translates into a Apex DatagridSelector Object

var DatagridModel = sObject.extend({
	defaults: {
		currentPage: 1,
		pageSize: 10,
		_service: null,
		_datagridService: 'Service.datagrid',
		_baseQuery: null,
		whereClause: null,
		_searchClause: null,
		orderBy: null,
		sortField: null,
		sortDirection: null,

		rebuildQuery : true,//force rebuild of query each time

		apexType: 'DatagridSelector' //its a SF thing
	},
	setSelectFields: function(selectFields) {
		var fields = [];
		var columns = [];
		var that = this;
		_.each(selectFields, function(field) {
			fields.push(field.apiName);
			if (!isNothing(field.name)) columns.push(field.name);
			else columns.push(field.apiName);
		});
		this.set({
			selectFields: fields
		});
		this.set({
			_columns: columns
		});
		this.set({
			_selectFields: selectFields
		});
	},

	setWhereClause: function(whereClause) {
		this.set({
			whereClause: whereClause,
			_whereClause: whereClause
		});
	},

	getWhereClause: function() {
		whereClause = this.get('_whereClause');
		if (isNothing(whereClause)) whereClause = '';
		var searchClause = this.getSearch();
		if (!isNothing(searchClause)) {
			if (whereClause === '') whereClause += searchClause;
			else whereClause += ' ' + searchClause;
			if(isNothing(this.get('inClauseCount')))
				this.set({inClauseCount: 0});
			if(!isNothing(this.get('_inClauseSearchCount')))
				this.set({inClauseCount : this.get('inClauseCount') + this.get('_inClauseSearchCount')});
		}
		this.set({
			whereClause: whereClause
		});
	},
	getSearch: function() {
		var searchTerm = this.get('_searchTerm');
		if (isNothing(searchTerm)) {
			return null;
		} else {
			searchClause = this.get('_searchClause');
			return searchClause.replace(/{TERM}/g, searchTerm);
		}

	},

	loadDatagrid: function() {
		this.getWhereClause();
		this.trigger('datagrid:loading');
		if (this.get('_service') !== null) {
			this.load(this.get('_service'));
		} else {
			var that = this;
			this.callService({
				service: this.get('_datagridService'),
				params: [this.format()],
				successCallback: function(result, e) {
					that.absorb(result.datagridSelector);
					that.trigger('datagrid:loaded');
				},
				errorCallback: function(result, e) {
					flashMessage({
						message: 'Failed to load datagrid'
					});
					console.log(result);
					console.log(e);
					that.trigger('datagrid:error');
				}
			});
		}
	},
	resetDatagrid: function() {
		this.set({
			totalRecords: null,
			currentResult: null,
			currentResultSet: null,
			hasNext: null,
			hasPrevious: null,
			currentPage: 1,
			pageSize: 10,
			sortField: null,
			sortDirection: null,
			_searchTerm: null
		});
		this.loadDatagrid();
	}

});