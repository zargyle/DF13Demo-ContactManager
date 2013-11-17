/*
 * @class ${name}
 * @author ${user} - ${email}
 * @created ${date}
 *
 */
${appName}.module("${name}", function(${name}, App) {
	"use strict";
	this.startWithParent = false;//use this if you want to start it yourself, which you probably do

	// Router
	// ----------
	var Router = Backbone.Router.extend({
		routes: {
		},
		// route filter before method
		// https://github.com/boazsender/backbone.routefilter
		before: function() {
			App.startSubApp("${name}", {
				region: App.layout.content //set the options and/or region to use here
			});
		}
		//proceed with router functions, dont forget your comma! 
	});
	//Add the router to the list of our routers to be started with the App 
	App.addInitializer(function() {
		var router = new Router();//leave this alone
	});


	// Controller
	// ----------
	${name}.Controller = App.AppController.extend({
		initialize: function(options) {
			var that = this;
			this.listenTo(App.vent, 'module:${name}:switch', function(options) {
				this.switchFunction(options);
			});
		},
		switchFunction: function(options) {
			${name}.layout.close();//close the layout, cleans events
			${name}.controller.close();//close the controller, cleans events
			//trigger the ready, or use logic to control this event, module wont switch until this event fires
			App.vent.trigger('module:${name}:switch:ready', options);
		} 
		//add a constructor if needed, define controls here.
		//ie load this, put it in this view, and plop it in the layout there.
	});

	${name}.addInitializer(function(options) {
		//add your regions of your app
		${name}.layout = new ${name}.${name}Layout();
		${name}.controller = new ${name}.Controller();
		this.content = options.region;

		//show the layout for the module
		this.content.show(${name}.layout);

	});
});