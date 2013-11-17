/*
 * @class ${name}Layout
 * @author ${user} - ${email}
 * @created ${date}
 *
 */
${appName}.module("${module}", function(${module}, App, Backbone, Marionette, $, _) {

	${module}.${name}Layout = Backbone.Marionette.Layout.extend({
		template: '${name}Layout',

		events: {},

		regions: {
			content : '.content'
		},

		onRender: function() {}

	});

});