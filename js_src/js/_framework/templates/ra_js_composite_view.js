/*
 * @class ${name}View
 * @author ${user} - ${email}
 * @created ${date}
 *
 */
${appName}.module("${module}", function(${module}, App, Backbone, Marionette, $, _) {

	${module}.${name}ItemView = Backbone.Marionette.ItemView.extend({
		template: '${module}${name}ItemView',
		tagName: 'tr', //Whatever wrapper element you want the itemview to render in. Ex:'div'
		className: '', //Class name to apply to the wrapper element
		events: {},

		onRender: function() {}

	});

	${module}.${name}CompositeView = Backbone.Marionette.CompositeView.extend({
		template: '${module}${name}CompositeView',

		events: {},

		onShow: function() {},

		itemViewContainer: 'tbody',//where do you wish to render this within the composite template
		itemView: ${module}.${name}ItemView

	});

});