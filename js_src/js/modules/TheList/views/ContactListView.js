/*
 * @class ContactListView
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 20:51:19 GMT-0400 (EDT)
 *
 */
ContactManagerApp.module("TheList", function(TheList, App, Backbone, Marionette, $, _) {

	TheList.ContactListItemView = Backbone.Marionette.ItemView.extend({
		template: 'TheListContactListItemView',
		tagName: 'tr', //Whatever wrapper element you want the itemview to render in. Ex:'div'
		className: '', //Class name to apply to the wrapper element
		events: {
			'click .editLink': 'editLinkClicked'
		},

		onRender: function() {},

		editLinkClicked: function(e){
			App.vent.trigger('EditContact',{
				recordId: this.model.get("Id")
			});
		}

	});

	TheList.ContactListCompositeView = Backbone.Marionette.CompositeView.extend({
		template: 'TheListContactListCompositeView',

		events: {},

		onShow: function() {},

		itemViewContainer: 'tbody',//where do you wish to render this within the composite template
		itemView: TheList.ContactListItemView

	});

});