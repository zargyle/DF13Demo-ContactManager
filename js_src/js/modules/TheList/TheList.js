/*
 * @class TheList
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 20:49:58 GMT-0400 (EDT)
 *
 */
ContactManagerApp.module("TheList", function(TheList, App) {
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
			App.startSubApp("TheList", {
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
	TheList.Controller = App.AppController.extend({
		initialize: function(options) {
			var that = this;
			this.listenTo(App.vent, 'module:TheList:switch', function(options) {
				this.switchFunction(options);
			});

			this.loadContacts();
		},
		switchFunction: function(options) {
			TheList.layout.close();//close the layout, cleans events
			TheList.controller.close();//close the controller, cleans events
			//trigger the ready, or use logic to control this event, module wont switch until this event fires
			App.vent.trigger('module:TheList:switch:ready', options);
		},
		loadContacts: function(){
			var contacts = new sObjects();
			this.listenToOnce(contacts, 'load:success', function(response) {
				var contactListView = new TheList.ContactListCompositeView({
					collection: contacts
				});
				TheList.layout.content.show(contactListView);
			});
			this.listenToOnce(contacts, 'load:error', function(response) {
				alert(response.result.message);
			});
			contacts.load({
			    queryOrService: 'SELECT Id, Name, Phone, Email FROM Contact'
			}); 
		}
		//add a constructor if needed, define controls here.
		//ie load this, put it in this view, and plop it in the layout there.
	});

	TheList.addInitializer(function(options) {
		//add your regions of your app
		TheList.layout = new TheList.TheListLayout();
		TheList.controller = new TheList.Controller();
		this.content = options.region;

		//show the layout for the module
		this.content.show(TheList.layout);

	});
});