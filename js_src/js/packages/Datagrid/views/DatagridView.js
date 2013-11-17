var DatagridView = Backbone.Marionette.CompositeView.extend({
	itemView: null, //extend and define me
	itemViewContainer: "tbody", //change me to what you want to iterate with
	template: "DatagridView", //"DatagridView", //for this version, please extend at all times
	model: null, //this drives the grid function needs to be passed in.
	collection: new sObjects(),

	initialize: function(options) {
		this.model = options.model;
		var that = this;
		this.listenTo(this.model, 'datagrid:loaded', this.listenToDatagridLoaded);
		this.listenTo(this.collection, 'callservice:error', function() {
			that.collection.reset(); //we broke so reset the collection, its probably not valid now
			that.$el.unblock(); //unblock
		});
		this.listenTo(this.model, 'datagrid:loading', function() {
			this.$el.block({
				message: '<h3>...loading...</h3>'
			});
		});
	},

	listenToDatagridLoaded: function() {
		this.collection.reset(); //reset the collection
		var records = this.model.get('records');
		if (!isNothing(records)) {
			if (records.length > 0) {
				var newCollection = new sObjects();
				newCollection.absorb( this.model.get('records') ); //absorb the records in a tmp collection
				if(typeof this.beforeDatagridRender === 'function')
					this.beforeDatagridRender(newCollection); //pass the collection to datagrid function for mod before render
				this.collection.reset(newCollection.models); //reset records into the collection, marionette re-renders collection view
				this.model.unset('records'); //remove the records from the model, they dont belong here, unless you need them to, then overwrite this function
			}
		}
		//this.renderModel();
		this.render();
		if(typeof this.afterDatagridRender == 'function')
			this.afterDatagridRender(this);
		this.$el.unblock(); //unblock the region
	},

	events: {
		'click .btn-next': 'next',
		'click .btn-previous': 'previous',
		'click .btn-search': 'search',
		'click th': 'sort',
		'click .sortable': 'sort',
		'click .btn-reset': 'resetDataGrid',
		'keyup .search-term': 'keyPressSearch',
		'change .table-limit': 'changeLimit'
	},

	onCompositeModelRendered: function() {
		//this.loadClients();
		this.$nextButton = this.$el.find('.btn-next');
		this.$previousButton = this.$el.find('.btn-previous');
		this.$pageNumber = this.$el.find('.page-number');
		this.$searchTextBox = this.$el.find('.search-term');
		this.$resetButton = this.$el.find('.btn-reset');
		this.$headers = this.$el.find('th');
		this.$currentPage = this.$el.find('.current-page');
		this.$currentPageSet = this.$el.find('.current-page-set');
		this.$totalRecords = this.$el.find('.total-records');
		this.$limitSelect = this.$el.find('.table-limit');

		//should we show the reset?
		if (this.model.get('hasPrevious') || !isNothing(this.model.get('_searchTerm')) || !isNothing(this.model.get('sort-field'))) this.$resetButton.show();
		//this.$previousButton.attr('disabled', 'disabled').addClass('disabled'); //start page 1

		$sortedColumn = this.$el.find('th[sort-direction="desc"]');
		$sortedColumn.append('<i style="margin-left: 3px;" class="icon-arrow-down">');
		$sortedColumn = this.$el.find('th[sort-direction="asc"]');
		$sortedColumn.append('<i style="margin-left: 3px;" class="icon-arrow-up">');

	},

	next: function(event) {
		if ($(event.target).hasClass('disabled')) return; //do nothing		
		this.model.set({
			currentPage: this.model.get('currentPage') + 1
		});
		this.model.loadDatagrid();
	},
	previous: function(event) {
		if ($(event.target).hasClass('disabled')) return; //do nothing
		page = this.model.get('currentPage');
		if (page != 1) {
			this.model.set({
				currentPage: page - 1
			});
			this.model.loadDatagrid();
		}
	},
	keyPressSearch: function(event) {
		if (event.keyCode == 13) this.search();
	},
	search: function() {
		this.model.set({
			_searchTerm: this.$searchTextBox.val()
		});
		//reset the next and previous. 
		this.firstPage();
		this.model.loadDatagrid();
	},
	changeLimit: function() {
		this.model.set({
			pageSize: parseInt(this.$limitSelect.val(), 10)
		});
		this.model.loadDatagrid();
	},

	resetDataGrid: function() {
		this.$headers.removeClass('sort-desc, sort-asc').removeAttr('sort-direction').find('i').remove();
		this.$searchTextBox.val('');
		this.model.resetDatagrid();
	},

	sort: function(event) {
		$sortObject = $(event.currentTarget);
		if ($sortObject.attr('sort-field') !== undefined) {
			dir = $sortObject.attr('sort-direction');
			this.$headers.removeClass('sort-desc, sort-asc').removeAttr('sort-direction').find('i').remove();
			if (dir === null || dir == 'asc') {
				dir = 'desc';
				$sortObject.append('<i style="margin-left: 3px;" class="icon-arrow-down">');
			} else {
				$sortObject.append('<i style="margin-left: 3px;" class="icon-arrow-up">');
				dir = 'asc';
			}
			$sortObject.attr('sort-direction', dir);
			this.model.set({
				sortField: $sortObject.attr('sort-field'),
				sortDirection: dir,
				currentPage: 1
			});
			this.model.loadDatagrid();
		} else {
			flashMessage({
				message: "<h3>This column does not support sorting.</h3>",
				duration: 1500
			});
		}
	},
	firstPage: function() {
		this.model.set({
			currentPage: 1
		});
	},
	updatePageCount: function() {
		this.$pageNumber.text(this.model.get('page'));
	}
});

Handlebars.registerHelper('sortFieldDirection', function(fieldSorted, field, direction, that) {
	if (fieldSorted === field) return 'sort-direction=' + direction;
	return '';
});