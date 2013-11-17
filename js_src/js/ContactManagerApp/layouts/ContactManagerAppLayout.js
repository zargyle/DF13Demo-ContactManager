/*
 * @class ContactManagerAppLayout
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 20:46:57 GMT-0400 (EDT)
 *
 */

ContactManagerApp.ContactManagerAppLayout = Backbone.Marionette.Layout.extend({
	template: 'ContactManagerAppLayout',

	events: {},

	regions: {
		form : '.form',
		list : '.list'
	},

	onRender: function() {}

});