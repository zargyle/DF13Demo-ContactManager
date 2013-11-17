/*
 * @class TheForm
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 21:43:10 GMT-0400 (EDT)
 *
 */
ContactManagerApp.module("TheForm", function(TheForm, App) {
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
			App.startSubApp("TheForm", {
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
	TheForm.Controller = App.AppController.extend({
		initialize: function(options) {
			var that = this;
			this.listenTo(App.vent, 'module:TheForm:switch', function(options) {
				this.switchFunction(options);
			});
		},
		switchFunction: function(options) {
			TheForm.layout.close();//close the layout, cleans events
			TheForm.controller.close();//close the controller, cleans events
			//trigger the ready, or use logic to control this event, module wont switch until this event fires
			App.vent.trigger('module:TheForm:switch:ready', options);
		},
		loadContact: function(options){
			var contact = new sObject();
			this.listenToOnce(contact, 'load:success', function(response) {
				var contactFormView = new TheForm.ContactFormView({
					model: contact
				});
				TheForm.layout.content.show(contactFormView);
			});
			this.listenToOnce(contact, 'load:error', function(response) {
				alert("Error Loading Contact");
			});
			contact.load({
			    queryOrService: "SELECT Id, FirstName, LastName, Phone, Email FROM Contact WHERE Id ='"+options.recordId+"'"
			}); 
		}
		//add a constructor if needed, define controls here.
		//ie load this, put it in this view, and plop it in the layout there.
	});

	TheForm.addInitializer(function(options) {
		//add your regions of your app
		TheForm.layout = new TheForm.TheFormLayout();
		TheForm.controller = new TheForm.Controller();
		this.content = options.region;

		//show the layout for the module
		this.content.show(TheForm.layout);

	});
});