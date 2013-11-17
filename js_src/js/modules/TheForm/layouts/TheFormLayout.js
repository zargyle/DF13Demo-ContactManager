/*
 * @class TheFormLayout
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 21:43:10 GMT-0400 (EDT)
 *
 */
ContactManagerApp.module("TheForm", function(TheForm, App, Backbone, Marionette, $, _) {

	TheForm.TheFormLayout = Backbone.Marionette.Layout.extend({
		template: 'TheFormLayout',

		events: {},

		regions: {
			content : '.content'
		},

		onRender: function() {}

	});

});