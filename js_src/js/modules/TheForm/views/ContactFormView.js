/*
 * @class ContactFormView
 * @author Zach Horton - zach@redargyle.com
 * @created Tue Oct 22 2013 21:43:23 GMT-0400 (EDT)
 *
 */
ContactManagerApp.module("TheForm", function(TheForm, App, Backbone, Marionette, $, _) {

	TheForm.ContactFormView = Backbone.Marionette.ItemView.extend({
		template: 'TheFormContactFormView',

		events: {
			'submit .contactForm': 'saveContact'
		},

		onShow: function() {},

		saveContact: function(e){
			e.preventDefault();

			this.model.createObjectFromForm({
				$form: $(".contactForm")
			});

			this.listenToOnce(this.model, 'save:success', function(response) {
				App.vent.trigger("ContactSaveSuccessful");
			});
			this.listenToOnce(this.model, 'save:error', function(response) {
				alert(response.result.message);
			});
			this.model.save({
			    objectType: 'Contact'
			}); 
		}

	});

});