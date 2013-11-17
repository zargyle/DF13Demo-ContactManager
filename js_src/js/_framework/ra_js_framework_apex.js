/*******************************************************************************
 *  RA JS Framework - APEX Flavor
 *
 *  This extends the RA JS Framework functionality for APEX related / SF related
 *  functionality
 *
 *  @supportedBackendLanguages PHP, Salesforce Apex
 *  @roadmapLanguages Ruby, iOS, Android
 *
 *  Property of Red Argyle - www.redargyle.com
 *
 *  @version 0.90beta
 *
 *  @baseRequirements: ra_js_framework.js v0.90beta
 *
 *
 ******************************************************************************/

sObject = sObject.extend({
	format: function() {
		var apexObject = jQuery.extend({}, this.attributes);
		var type = apexObject._type;
		for (var attr in apexObject)
			if (attr.indexOf('_') === 0 || attr.indexOf('__r') != -1) delete apexObject[attr];
		if (!isNothing(type) && isNothing(apexObject.Id) && isNothing(apexObject.sobjectType)) apexObject.sobjectType = type;
		else if (!isNothing(apexObject.Id)) delete apexObject.sobjectType;
		return apexObject;
	},

	defaults: {
		_service: 'Service',
		_load: 'query',
		_save: 'save',
		_delete: 'deleteObjects'
	},

	absorb: function(object) {
		this.set(object);
	},

	callService: function(options) {
		callService(options);
	},

	load: function(options) {
		queryOrService = options.queryOrService;
		getAccess = options.getAccess;
		successHandle = options.successHandle;
		errorHandle = options.errorHandle;
		params = options.params;
		if (isNothing(getAccess)) getAccess = false;
		this.getAccess = getAccess;
		isService = false;
		if (typeof queryOrService == 'string') {
			if (queryOrService.toLowerCase().indexOf('select ') !== 0) isService = true;
		} else if (isNothing(queryOrService)) {
			if (isNothing(this.query)) {
				queryOrService = 'select ';
				queryOrService += this.fields.join(', ');
				queryOrService += ' from ';
				queryOrService += this.objectType;
				if (!isNothing(this.where)) queryOrService += ' where ' + this.where;
				if (!isNothing(this.order)) queryOrService += ' order by ' + this.order;
				if (!isNothing(this.nullsLast)) queryOrService += ' nulls last';
			} else {
				queryOrService = this.query;
			}
		}
		if (isService) {
			callService({
				service: queryOrService,
				params: params,
				successCallback: successHandle,
				errorCallback: errorHandle,
				context: this
			});
		} else {
			if (isNothing(successHandle)) successHandle = this.defaultSuccessLoadHandle;
			if (isNothing(errorHandle)) errorHandle = this.defaultErrorLoadHandle;

			var that = this;
			callService({
				service: this.get('_service') + '.' + this.get('_load'),
				params: [queryOrService],
				successCallback: successHandle,
				errorCallback: errorHandle,
				context: this
			});
		}
	},

	save: function(options) {
		objectType = options.objectType;
		if (isNothing(this.get('Id')))
			this.set({
				sobjectType: objectType
			});
		successHandle = options.successHandle;
		errorHandle = options.errorHandle;
		if (isNothing(successHandle)) successHandle = this.defaultSuccessSaveHandle;
		if (isNothing(errorHandle)) errorHandle = this.defaultErrorSaveHandle;
		callService({
			service: this.get('_service') + '.' + this.get('_save'),
			params: [objectType, [this.format()]],
			successCallback: successHandle,
			errorCallback: errorHandle,
			context: this
		});

	},
	deleteMe: function(options) {
		objectType = options.objectType;
		successHandle = options.successHandle;
		errorHandle = options.errorHandle;
		if (isNothing(successHandle)) successHandle = this.defaultSuccessDeleteHandle;
		if (isNothing(errorHandle)) errorHandle = this.defaultErrorDeleteHandle;
		if (isNothing(this.get('Id'))) {
			console.log('No Id given for deletion of:');
			console.log(options);
			options.errorHandle({
				success: false,
				message: 'No Id given for deletion'
			});
		}
		callService({
			service: this.get('_service') + '.' + this.get('_delete'),
			params: [objectType, [this.format()]],
			successCallback: successHandle,
			errorCallback: errorHandle,
			context: this
		});
	},

	defaultSuccessLoadHandle: function(result, context) {
		context.absorb(result.records[0]);
		if (context.getAccess) {
			callService({
				service: 'Service.getRecordsAccess',
				params: [
					[context.get('Id')]
				],
				successCallback: function(result) {
					context.set({
						_accessLevel: result.records[0].MaxAccessLevel
					});
					context.trigger('load:success', {
						result: result
					});
				},
				errorCallback: function(result) {
					console.log(result);
					flashMessage({
						message: 'Failed to load Users access'
					});
					context.trigger('load:success', {
						result: result
					});
				}
			});
		} else
			context.trigger('load:success', {
				result: result
			});
	},

	defaultErrorLoadHandle: function(result, context) {
		context.trigger('load:error', {
			result: result
		});
		console.log(result);
		console.log(result.message);
	},
	defaultSuccessDeleteHandle: function(result, context) {
		context.absorb(result.records[0]);
		context.trigger('delete:success', {
			result: result
		});
	},

	defaultErrorDeleteHandle: function(result, context) {
		context.trigger('delete:error', {
			result: result
		});
		console.log(result);
		console.log(result.message);
	},

	defaultSuccessSaveHandle: function(result, context) {
		context.absorb(result.records[0]);
		context.trigger('save:success', {
			result: result
		});
	},

	defaultErrorSaveHandle: function(result, context) {
		context.trigger('save:error', {
			result: result
		});
		console.log(result);
		console.log(result.message);
	}
});

sObjects = sObjects.extend({
	initialize: function() {
		this.setAttribute('_service', 'Service');
		this.setAttribute('_load', 'query');
		this.setAttribute('_loadWithAccess', 'queryWithAccess');
		this.setAttribute('_save', 'save');
	},

	callService: function(options) {
		callService(options);
	},

	load: function(options) {
		queryOrService = options.queryOrService;
		params = options.params;
		successHandle = options.successHandle;
		errorHandle = options.errorHandle;
		getAccess = options.getAccess;
		if (isNothing(getAccess)) getAccess = false;
		var that = this;
		isService = false;
		if (typeof queryOrService == 'string') {
			if (queryOrService.toLowerCase().indexOf('select ') !== 0) isService = true;
		} else if (isNothing(queryOrService)) {
			if (isNothing(this.query)) {
				queryOrService = 'select ';
				queryOrService += this.fields.join(', ');
				queryOrService += ' from ';
				queryOrService += this.objectType;
				if (!isNothing(this.where)) queryOrService += ' where ' + this.where;
				if (!isNothing(this.order)) queryOrService += ' order by ' + this.order;
				if (!isNothing(this.nullsLast)) queryOrService += ' nulls last';
			} else {
				queryOrService = this.query;
			}
		}
		if (isNothing(successHandle)) successHandle = this.defaultSuccessLoadHandle;
		if (isNothing(errorHandle)) errorHandle = this.defaultErrorLoadHandle;
		if (isService) {

			callService({
				service: queryOrService,
				params: params,
				successCallback: successHandle,
				errorCallback: errorHandle,
				context: this
			});
		} else {
			var service;
			if (getAccess)
				service = this.getAttribute('_service') + '.' + this.getAttribute('_loadWithAccess');
			else
				service = this.getAttribute('_service') + '.' + this.getAttribute('_load');
			callService({
				service: service,
				params: [queryOrService],
				successCallback: successHandle,
				errorCallback: errorHandle,
				context: this
			});
		}
	},

	save: function(options) {
		objectType = options.objectType;
		successHandle = options.successHandle;
		errorHandle = options.errorHandle;
		if (isNothing(successHandle)) successHandle = this.defaultSuccessSaveHandle;
		if (isNothing(errorHandle)) errorHandle = this.defaultErrorSaveHandle;
		callService({
			service: this.getAttribute('_service') + '.' + this.getAttribute('_save'),
			params: [objectType, this.format()],
			successCallback: successHandle,
			errorCallback: errorHandle,
			context: this
		});

	},
	defaultSuccessSaveHandle: function(result, context) {
		context.absorb(result.records[0]);
		context.trigger('save:success', {
			result: result
		});
	},

	defaultErrorSaveHandle: function(result, context) {
		context.trigger('save:error', {
			result: result
		});
		console.log(result);
		console.log(result.message);
	},

	defaultSuccessLoadHandle: function(result, context) {
		var collection = new sObjects();
		if(!isNothing(result.accessRecords))
			collection.absorb(result.accessRecords);
		else
			collection.absorb(result.records);
		context.reset(collection.models);
		//re-attatch the collection variable onto the models
		_.each(context.models, function(model) {
			model.collection = context;
		});
		context.trigger('load:success', {
			result: result
		});
	},

	defaultErrorLoadHandle: function(result, context) {
		flashMessage({
			message: 'Error: ' + result.message
		});
		context.trigger('load:error', {
			result: result
		});
		console.log(result);
		console.log(result.message);
	}
});

var SERVICE_TEST = false;
var SERVICE_TEST_OBJECT = '';
var SERVICE_TEST_RESULT_TYPE = 'success'; //failure

function callService(options) {
	var service;
	var defaults;
	var ajaxSettings;
	var params = [];
	var callbacks = new Backbone.Marionette.Callbacks();

	if (options.objects !== null) params.records = options.objects;

	if (!isNothing(options.params)) params.params = options.params;
	else options.params = [];

	//stringify the params
	params = JSON.stringify(params);

	//check if we have a certain service to hit, else hit service, or override
	//full defaults

	if (options.service !== null) service = options.service;
	else {
		flashMessage({
			message: 'NO SERVICE PROVIDED.'
		});
		return;
	}
	if (SERVICE_TEST) {
		//try {
		service = service.split('.');
		serviceFunction = window[service[0] + 'Test'][service[1]];
		if (SERVICE_TEST_RESULT_TYPE == 'success') {
			result = serviceFunction.success.apply(options.params);
			options.successCallback(result);
			return;
		} else if (SERVICE_TEST_RESULT_TYPE == 'failure') {
			result = serviceFunction.failure.apply(options.params);
			options.errorCallback(result);
			return;
		} else {
			flashMessage({
				message: 'NO SERVICE TEST RESULT TYPE SET'
			});
			return;
		}
		/*} catch (ex) {
			flashMessage({
				message: ex.message
			});
			return;
		}*/

	} else {
		//try {
		service = service.split('.');
		serviceFunction = window[service[0]][service[1]];

		SH = new serviceHandler(options);
		if (options.successCallback !== null) SH.successCallback = options.successCallback;
		else SH.successCallback = function() {};

		if (options.errorCallback !== null) SH.errorCallback = options.errorCallback;
		else SH.errorCallback = function() {};


		options.params.push(SH.handle);
		serviceFunction.apply({}, options.params);
		/*} catch(ex) {
			flashMessage({
				message : 'Service Error: ' + ex.message
			});
			$('.blockUI').unblock();
		}*/
	}

}

function serviceHandler(options) {
	var thatService = this;
	this.successCallback = function(data, textStatus, jqXHR) {};

	this.errorCallback = function(data, textStatus, jqXHR) {};

	this.handle = function(data, error) {
		if ((data !== null && data.success === false && data.message == 'Auth Failure') || (!isNothing(error) && !isNothing(error.message) && error.message.indexOf('Logged in') != -1)) {
			thatService.authFailure(data, error);
		} else if (data !== null && data.success) {
			thatService.successCallback(data, options.context);
		} else {
			console.log(error);
			if (!isNothing(window.JavascriptErrorService) && !isNothing(window.runningApp) && options.service != 'JavascriptErrorService.createError') {
				window.runningApp.vent.trigger('CallService:error', {
					data: data,
					error: error,
					handleOptions: options
				});
			}
			thatService.errorCallback(data, options.context);
		}
	};

	this.authFailure = function(data, textStatus, jqXHR) {
		if (typeof $.unblockUI != 'undefined') $.unblockUI();
		alert('Your login has expired.');
		window.location.reload();
	};

	this.ajaxError = function(data, textStatus, jqXHR) {
		if (typeof $.unblockUI != 'undefined') $.unblockUI();
		console.log(data);
		console.log(textStatus);
		alert('CallService encountered an error. Please Contact Administrator.');
	};

}