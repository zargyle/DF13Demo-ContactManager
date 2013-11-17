/*==========================================
=              ${appName}                
============================================
/*
 * @Application ${appName}
 * @author ${user} - ${email}
 * @created ${date}
 *
 ==========================================*/
${appName} = (function(Backbone, Marionette) {

	var App = new Backbone.Marionette.Application();
	App.$modal = $('#global-modal'); // -include if you wish to have a modal
	App.$modal.on('hidden', function() {
		hideValidityModals(); //hide all validations when we close
	});

	/*
		startModule
		===========
		starting sub apps will run modules underneath regions they are being placed.
		This will trigger the module currently running for its switch method,
		this method will clean the module and then show the new module when it 
		is ready. You can block in the module if you want to not switch due to 
		validation or other logic. Do not modify the function below.
		
	*/
	App.startModule = function(moduleName, args) {
		var region = args.region.options.el;
		var newModule = App.module(moduleName);
		if (isNothing(App.currentModule)) App.currentModule = [];
		if (App.currentModule[region] === newModule) {
			return;
		}
		if (App.currentModule[region]) {
			App.vent.once('module:' + App.currentModule[region].moduleName + ':switch:ready', function(options) {
				App.currentModule[options.region].stop();
				App.currentModule[options.region] = options.newModule;
				options.newModule.start(args);
			});
			App.vent.trigger('module:' + App.currentModule[region].moduleName + ':switch', {
				region: region,
				newModule: newModule
			});

		} else {
			App.currentModule[region] = newModule;
			newModule.start(args);
		}
		return newModule;
	};

	App.stopModule = function(moduleName, args) {
		var region = args.region.options.el;
		var appToClose = App.module(moduleName);

		if (isNothing(App.currentModule)) App.currentModule = [];

		if (App.currentModule[region] === appToClose) {
			App.currentModule[region].stop();
			App.currentModule[region] = null;
			args.region.$el.empty();
		}
	};

	//Before Initializer
	App.addInitializer(function(options) {
		App.layout = new ${appName}.${appName}Layout();

		//add your regions of your app
		this.addRegions({
			maincontent: '#body',
			modal: '#global-modal' //-include if you wish to have a modal
		});
	});

	//After Initializer
	App.on("initialize:after", function(options) {
		//show the app
		App.maincontent.show(App.layout);

		Backbone.history.bind("all", function(route, router) {
			$("html, body").animate({
				scrollTop: 0
			}, "fast");
		});

		Backbone.history.start();

		//this is for unblocking once everything is loaded. Remove if desired
		if (typeof($.unblockUI) == 'function') $.unblockUI();

	});

	//make sure you include the sforce, and a logout URL 
	App.vent.on('logout', function(options) {
		bootbox.confirm('Are you sure you want to logout?', function(confirmed) {
			if (confirmed) {
				try {
					sforce.connection.sessionId = window.sessionId;
					//var result = sforce.connection.logout();
					window.location = window.logoutUrl;
				} catch (exception) {
					flashMessage({
						message: 'Failed to Logout'
					});
					console.log(exception);
				}
			}
		});
	});

	//Override me if you wish to auto log some call service errors
	App.vent.on('CallService:error', function(options) {
		var javascriptError = new sObject();
		if (!isNothing(options.data)) {
			javascriptError.set({
				Line_Number__c: options.data.except.lineNumber,
				Stack_Trace__c: options.data.except.stackTraceString,
				Error__c: options.data.message
			});
		}
		javascriptError.set({
			URL__c: window.location.href,
			Hash__c: window.location.hash,
			Error_Object__c: JSON.stringify(options.error).replace(/\"/g, '\''),
			User_Agent__c: navigator.userAgent,
			Time_Occured__c: moment(Date.now()).format('h:mm:ss a'),
			Issue_Type__c: 'System Issue'
		});
		callService({
			service: 'JavascriptErrorService.createError',
			params: [
				javascriptError.format()
			],
			successCallback: function(result) {
				//silent
				App.vent.trigger('CallService:case', result.records[0]);
				App.lastJavascriptError = result.records[0];
			},
			errorCallback: function(result) {
				flashMessage({
					message: 'Failed to update error log.'
				});
			}
		});

	});

	window.onresize = function() {
		App.vent.trigger('window:resize');
	};

	return App;

})(Backbone, Marionette);

//APPLICATION CONTROLLER
${appName}.AppController = (function(App, Marionette) {

	var AppController = Marionette.Controller.extend({
		constructor: function(options) {
			options = options || {};

			this.mainRegion = options.mainRegion;
			this.navRegion = options.navRegion;

			Marionette.Controller.prototype.constructor.call(this, options);
		},

		// show this component in the app
		show: function() {
			Marionette.triggerMethod.call(this, "show");
		}

		// show the specified component, closing any currently
		// displayed component before showing the new one
		/*showComponent: function(component) {
				if (this._currentComponent) {
					this._currentComponent.close();
				}

				component.show();
				this._currentComponent = component;
			}*/

	});
	return AppController;
})(${appName}, Marionette);
window.runningApp = ${appName};//set the running application