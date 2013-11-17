/*
 * @class TheListLayout
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 20:49:58 GMT-0400 (EDT)
 *
 */
ContactManagerApp.module("TheList", function(TheList, App, Backbone, Marionette, $, _) {

	TheList.TheListLayout = Backbone.Marionette.Layout.extend({
		template: 'TheListLayout',

		events: {},

		regions: {
			content : '.content'
		},

		onRender: function() {}

	});

});