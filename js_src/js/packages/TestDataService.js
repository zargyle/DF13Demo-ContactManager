var TestDataModule = new Backbone.Marionette.Application();

TestDataModule.on("initialize:after", function(options) {
	this.addRegions({
		content: '#test-service-content'
		//modal: '#global-modal' -include if you wish to have a modal
	});
	var testDataView = new TestDataView();
	this.content.show(testDataView);
	SERVICE_TEST_OBJECT = 'TestDataService';
});

TestDataModule.vent.on('service:switch', function(options) {
	SERVICE_TEST = options.serviceOn;
	/*if (options.serviceOn) flashMessage({
		message: 'Service Test Data On'
	});
	else flashMessage({
		message: 'Service Test Data Off'
	});*/
});

TestDataModule.vent.on('service:type', function(options) {
	SERVICE_TEST_RESULT_TYPE = options.type;
	if (options.type == 'success') flashMessage({
		message: 'Service Test Data - Success Data'
	});
	else flashMessage({
		message: 'Service Test Data - Failure Data'
	});
});

var TestDataView = Backbone.Marionette.ItemView.extend({
	template: 'TestDataView',
	model: new sObject(),
	initialize: function() {
		this.model.set({
			serviceStatus: SERVICE_TEST, //flip initial to call
			serviceType: SERVICE_TEST_RESULT_TYPE
		});
	},

	onShow: function() {
		this.changeServiceStatus(); //flip initial 
	},

	events: {
		'click #service-on-off': 'changeServiceStatus',
		'click #service-type': 'changeServiceType'
	},

	changeServiceStatus: function(event) {

		this.model.set({
			serviceStatus: !this.model.get('serviceStatus')
		});
		TestDataModule.vent.trigger('service:switch', {
			serviceOn: !this.model.get('serviceStatus')
		});
		if (this.model.get('serviceStatus')) this.$el.find('a#service-on-off').text('Service Test Off').removeClass('btn-warning').addClass('btn-primary');
		else this.$el.find('a#service-on-off').text('Service Test On').removeClass('btn-primary').addClass('btn-warning');
	},

	changeServiceType: function(event) {

	}
});