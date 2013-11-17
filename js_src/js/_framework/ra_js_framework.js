/*******************************************************************************
 *  RA JS Framework
 *
 *  This Framework is designed to manipulate inputs and outputs based on objects
 *  This allows validation and formatting based on extended flavors of this
 *  framework to sync with various backend services.
 *
 *  @supportedBackendLanguages PHP, Salesforce Apex
 *  @roadmapLanguages Ruby, iOS, Android
 *
 *  Property of Red Argyle - www.redargyle.com
 *
 *  @version 0.90beta
 *
 *  @baseRequirements: jquery.min.js - 1.7.1
 *                     underscore.js - 1.4.2
 *                     backbone.js - 0.9.2
 *                     handlebars-1.0.0.beta.6.js - 1.0.0.beta.6
 *
 *
 *  @fullRequirements: jQuery.validity.js
 *                     bootstrap.js - 2.2.1
 *                     bootbox.js
 *                     backbone.marionette.js
 *
 *  @styles: bootstrap.css - 2.2.1
 *             bootstrap-responsive.css - 2.2.1
 *             validity.css
 *
 *
 ******************************************************************************/


/*******************************************************************************
 *  Container Validation
 *
 *  @required: jQuery.validity.js
 *  @description: This area uses container/input based validation for validating
 *                 both forms and psudo forms.
 *
 ******************************************************************************/


/*
 *  Runs validity on a form or container, returning the validation object
 *
 *  @param object options
 *     jQueryObject $container,
 *     string outputMode,
 *     function specialValidation,
 *     boolean skipAutoValidity,
 *     object setupSettings
 *
 *  @return object
 *
 *  @example
 *     <div id="form1">
 *      <input data-required="true" data-match="phone" />
 *     </div>
 *
 *     <script>
 *    var result = runValidity({$container : $('div#form1')});
 *     </script>
 */

function runValidity(options) {
	$container = options.$container;
	outputMode = options.outputMode;
	specialValidation = options.specialValidation;
	skipAutoValidity = options.skipAutoValidity;
	setupSettings = options.setupSettings;

	var validitySettings = setupSettings || {};
	validitySettings.outputMode = outputMode || "modal";
	$.validity.setup(validitySettings);

	window.currentValidityContainer = $container;
	$.validity.start();


	if (skipAutoValidity === undefined) skipAutoValidity = false;

	if (typeof specialValidation == 'function') specialValidation($container);

	if (!skipAutoValidity) {
		var reqAll = $container.attr('data-require-all');
		if (typeof reqAll !== 'undefined') //check if we should require all fields
			$container.find('input, select, textarea').require();
		else {
			$container.find('input, select, textarea').each(function() {
				$input = $(this);
				var required = $input.attr('data-required') || $input.attr('required');
				var match_type = $input.attr('data-match');
				
				if (typeof required !== 'undefined' && required !== false) $input.require();
				/*if (match_type == "number") $input.match("number");
				else if (match_type == "email") $input.match("email");
				else if (match_type == "phone") $input.match("phone");
				else*/
				if (!isNothing(match_type)) {
					if (match_type == "url") {
						if ($input.val() !== "" && $input.val().indexOf("http") < 0) $input.val("http://" + $input.val());
						//$input.match("url");*/
					} else if (match_type.toLowerCase().indexOf('date') != -1) {
						var dataDateRange = $input.attr('data-date-range');
						if (!isNothing(dataDateRange)) {
							if (!isNothing($input.val())) {
								var now = new Date();
								if (dataDateRange == 'current-past') {
									$input.assert(new Date($input.val()) <= now, 'The date must be the current date or a past date.');
								} else if (dataDateRange == 'current-future') {
									$input.assert(new Date($input.val()) >= now, 'The date must be the current date or a future date.');
								} else if (dataDateRange == 'past') {
									$input.assert(new Date($input.val()) < now, 'The date must be a past date.');
								} else if (dataDateRange == 'future') {
									$input.assert(new Date($input.val()) > now, 'The date must be a future date.');
								}
							}
						}
						var dataDateGreaterThan = $input.attr('data-date-great-than');
						var greaterThanFieldName = $input.attr('data-date-great-than-name');
						if (!isNothing(dataDateGreaterThan)) {
							if (!isNothing($input.val())) {
								if ($(dataDateGreaterThan).length > 0) {
									var dateToCompare = $(dataDateGreaterThan).val();
									if (isNothing(dateToCompare))
										dateToCompare = 0;
									var thisVal = $input.val();
									$input.assert((moment(thisVal).unix() - moment(dateToCompare).unix()) > 0, 'This date must be greater than ' + greaterThanFieldName);
								}
							}

						}
					} else if (match_type == 'number') {
						var dataRange = $input.attr('data-range');
						if (!isNothing(dataRange)) {
							try {
								var ranges = dataRange.split(' ');
								var min = ranges[0];
								var max = ranges[1];
								$input.range(min, max);
							} catch (error) {
								console.log('runValidity:data-range: ');
								console.log(error);
							}
						}
					}
					$input.match(match_type);
				}
			});
		}
	}

	//remove our context
	window.currentValidityContainer = null;
	return $.validity.end();

}

/*
 *  Add element support to validity, based on jQuery selectors
 *
 *  @param string support
 *
 *  @return void
 *
 *  @todo: add me to validity? or does it exist
 *
 *  @example:
 *     addValidityElementSupport('[type="number"]');
 *
 */

function addValidityElementSupport(support) {
	if ($.validity.settings.elementSupport.indexOf(support) == -1) {
		$.validity.settings.elementSupport += ', ' + support;
	}
}

function hideValidityModals() {
	$('.validity-modal-msg').click(); //removes all validity messages
}

/*******************************************************************************
 *  Inline Editing
 *
 *  @description: this section defines inline edit abilities
 *  @example:
 *     <div>
 *        <input class="inline-edit">
 *        <span class="inline-readonly">SOME VALUE</span>
 *     </div>
 ******************************************************************************/

/*
 *  Toggles the state of the inline edits
 *
 *  @note: this does not track the container nor the variable
 *  @todo: review me, Think this needs rework or removal
 *
 *  @param: boolean isEdit
 *  @return: void
 */

function toggleInlineEdits(isEdit) {
	if (isEdit) {
		$('.inline-readonly').hide();
		$('.inline-edit').show();
	} else {
		$('.inline-readonly').show();
		$('.inline-edit').hide();
	}
}

/*
 *  Toggles inline edits based on the container and its current state.
 *
 *  @param jQueryObject $container
 */

function toggleInlineEditsContainer($container) {
	var state = $container.attr('inline-edit-state');
	if (state === null || state === '') state = 'edit'; //triggers to readonly
	if (state == 'edit') {
		hideInlineEdits($container);
		$container.attr('inline-edit-state', 'readonly');
	} else {
		showInlineEdits($container);
		$container.attr('inline-edit-state', 'edit');
	}

}

/*
 *  Hides inline edits based on the container and shows the read only
 *
 *  @param jQueryObject $container
 */

function hideInlineEdits($container) {
	$container.find('.inline-readonly').show();
	$container.find('.inline-edit').hide();

}

/*
 *  Shows inline edits based on the container and hides the read only
 *
 *  @param jQueryObject $container
 */

function showInlineEdits($container) {
	$container.find('.inline-readonly').hide();
	$container.find('.inline-edit').show();
}


/*******************************************************************************
 *  UI / Messaging
 *
 *  @required: bootstrap.js - 2.2.1
 *              bootbox.js
 ******************************************************************************/

/*
 *  Flashes a message on the screen to inform the user of some event
 *
 *  @param: option
 *   string message
 *   string className
 *   integer duration (in miliseconds)
 *   string templateId
 */
var BLOCK_FLASH = false;

function flashMessage(options) {
	var message;
	if (typeof options.message == 'string') {
		message = {};
		message.message = options.message;
	} else {
		message = options.message;
	}

	var duration = options.duration;
	var template = options.template;
	var className = options.className || '';
	var source;
	var html;

	if (duration === undefined || duration === null) duration = 2500;
	if ($('div#global-message').size() === 0) {
		html = '<div id="global-message" class="modal hide"><div class="modal-body"></div></div>';
		$('body').append(html);
	}

	if (template === undefined || template === null || template === '') {
		source = '<h3><center>{{message}}</center></h3>';
	} else {
		source = template;
	}
	template = Handlebars.compile(source);
	html = template(message); //this can be a string or complex object

	if (className !== '') $("#global-message").addClass(className);
	else $("#global-message").removeClass();
	$("#global-message").addClass('modal'); //always keep modal
	$("#global-message .modal-body").html(html);
	if (!BLOCK_FLASH) {
		BLOCK_FLASH = true;
		$("#global-message").fadeIn(function() {
			setTimeout(function() {
				$("#global-message").fadeOut();
				BLOCK_FLASH = false;
			}, duration);
		});
	}
}

/*
 *  Renders a Popover message over a region. This region is defined by the class.
 *  This will take all of the classes and
 *
 *  NOTE: the classes / attributes users to have a -help involved. The ideation
 *  behind this has grown, therefore this -help has been depricated.
 *
 */

function renderPopovers(options) {
	var popovers;
	if (options === null || options.$container === null) popovers = $('.popover-ui');
	else popovers = options.$container.find('.popover-ui');

	popovers.popover(options);

}

/*
 * Show Other
 *
 * pass in the controller field and other field, shows and hides based on the value
 */
/****************  SHOW OTHER  *****************************/

function showOther($selectorField, $otherField, otherValue) {

	$otherField.hide();

	type = $selectorField.attr('type');
	if (type == 'checkbox') {

		if ($selectorField.is(':checked')) $otherField.show();
		else $otherField.val('');

		$selectorField.click(function() {
			if ($(this).is(':checked')) $otherField.show();
			else {
				//$otherField.val('');
				$otherField.hide();
			}
		});

	} //else if($selectorField.attr('multiple') != undefined) {
	else if ($selectorField.attr('multiple') == "multiple") {

		if (typeof otherValue == 'object') {

		} else {
			//if($selectorField.children().last().html().match(otherValue) != null)
			if ($selectorField.children().last().text() == "Other") $otherField.show();
			else $otherField.hide();
		}
	} else {
		//First we have to check if the value is already selected
		if (typeof otherValue == 'object') { //we will assume array object 
			if ($.inArray($selectorField.val(), otherValue) > -1) $otherField.show();
			else {
				//$otherField.val() = '';
				$otherField.hide();
			}
		} else {
			if ($selectorField.val() == otherValue) $otherField.show();
			else {
				//$otherField.val() = '';
				$otherField.hide();
			}
		}
	}
	//next we handle if it changes
	$selectorField.on("change", function() {
		if (typeof otherValue == 'object') { //we will assume array object 
			if ($.inArray($(this).val(), otherValue) > -1) $otherField.show();
			else {
				//$otherField.val() = '';
				$otherField.hide();
			}
		} else {
			if ($selectorField.attr('multiple') == "multiple") {

				if (typeof otherValue == 'object') {

				} else {
					//if($selectorField.children().last().html().match(otherValue) != null)
					if ($selectorField.children().last().text() == "Other") $otherField.show();
					else $otherField.hide();
				}
			} else {
				if ($(this).val() == otherValue) $otherField.show();
				else {
					//$otherField.val() = '';
					$otherField.hide();
				}
			}
		}
	});

}
/*
 *  PHP/Apex Date Format
 *  (~input = '2012-11-08T16:18:35.000Z')
 *  (~output = '11/8/2012 11:18 AM')
 */

function formatDateTime(dateString, utc) {
	dateString = dateString || Date();
	var d = utc ? moment.utc(dateString) : moment(dateString);
	return d.format('M/D/YYYY h:mma');
}

/*
 *  PHP/Apex Date Format
 *  (~input = '2012-11-08T16:18:35.000Z')
 *  (~output = '11/8/2012')
 */

function formatDate(dateString, utc) {
	dateString = dateString || Date();
	var d = utc ? moment.utc(dateString) : moment(dateString);
	return d.format('MM/DD/YYYY');
}

/*
 *  PHP/Apex Date Format
 *  (~input = '2012-11-08T16:18:35.000Z')
 *  (~output = '2012-11-8')
 */

function formatDateValue(dateString, utc) {
	dateString = dateString || Date();
	var d = utc ? moment.utc(dateString) : moment(dateString);
	return d.format('YYYY-MM-DD');
}

function fixDate(dateString, type, utc) {
	type = type || 'date';
	type = type.toLowerCase();
	utc = utc || false;

	if (typeof dateString == 'number' && !utc) dateString = dateString.toString();
	if (typeof dateString == "undefined" || dateString === "") return "";

	// Check if there is a time. Chances are if the dateString contains a ':' then a time is involved.
	// If no time was provided add one.
	if (!utc && dateString.indexOf(':') === -1) dateString += ' 00:00:00';

	toReturn = '';
	switch (type) {
		case 'date':
			toReturn = formatDate(dateString, utc);
			break;
		case 'datetime':
			toReturn = formatDateTime(dateString, utc);
			break;
		case 'value':
			toReturn = formatDateValue(dateString, utc);
			break;

		default:
			toReturn = formatDate(dateString, utc);
			break;
	}
	return toReturn;
}

function fixDatesIn($container) {
	$container.find('.format-date').each(function() {
		$(this).text(fixDate($(this).text(), $(this).attr('data-date-type')));
	});
}

function jsToSFDate(value) {
	return new Date(value).getTime();
}

function booleanToCheckmark(value) {
	output = '';
	if (value == 'true' || value === true) output = '<i class="icon-ok"></i>';
	return output;
}

function booleanToThumbs(value) {
	output = '<i class="icon-thumbs-down"></i>';
	if (value == 'true' || value === true) output = '<i class="icon-thumbs-up"></i>';
	return output;
}

function booleanToYesNo(value) {
	output = '<span>No</span>';
	if (value == 'true' || value === true) output = '<span>Yes</span>';
	return output;
}

function dateSFPHPFormat(d) {
	d = d || Date();
	var sfDate = moment(d);
	return sfDate.format('YYYY-MM-DD');
}

function setPicklistOptions(options) {
	var $select;
	if (options.$select === null) $select = options;
	else $select = options.$select;

	var object = $select.attr('data-api-object');
	var field = $select.attr('data-api-name');
	var value = $select.attr('data-value');
	if (value === null) value = '';

	if (options.skipOptions === true) {
		if (value !== null && value !== '') $select.find('option[value="' + value + '"]').attr('selected', 'selected');
		return;
	}
	callService('getPicklistOptions', null, {
		object: object,
		field: field,
		value: value
	}, function(data) {
		$select.html(data.options);
	}, function(data) {
		flashMessage({
			message: '...Error getting select values...'
		});
	});
}

function deactivateButton($button) {
	$button.addClass('disabled');
	if ($button.hasClass('btn-primary')) {
		$button.attr('btn-original-state', 'btn-primary');
	} else if ($button.hasClass('btn-success')) {
		$button.attr('btn-original-state', 'btn-success');
	} else if ($button.hasClass('btn-danger')) {
		$button.attr('btn-original-state', 'btn-danger');
	} else if ($button.hasClass('btn-warning')) {
		$button.attr('btn-original-state', 'btn-warning');
	}
	$button.removeClass('btn-primary, btn-success, btn-danger, btn-warning');

}

function activateButton($button) {
	$button.removeClass('disabled');
	var state = $button.attr('btn-original-state');
	if (!isNothing(state)) {
		$button.addClass(state);
	}
}


function createOption(value, label, attributes) {
	if (attributes === null) attributes = '';
	return '<option value="' + value + '" ' + attributes + '>' + label + '</option>';
}

var sObject = Backbone.Model.extend({
	defaults: {
		"_type": null,
		"Id": null,
		"_action": null,
		"_children": []
	},

	initialize: function() {
		this.set({
			_cid: this.cid
		});
	},
	clearFields: function() {
		for (var attr in this.attributes) {
			if (attr.indexOf('_') === 0) {
				//keep	
			} else {
				this.unset(attr);
			}
		}
	},

	save: function(action, params, success, failure) {
		callService(action, [this.php_format()], params, success, failure);
	},

	add_child: function(childObject) {
		var children_array = this.get("_children");
		children_array.push(childObject);
		this.set({
			children: children_array
		});
	},

	createObjectFromForm: function(options) {
		var $form;
		if (!isNothing(options.$form)) $form = options.$form;
		else $form = options;

		if ($form === null) return null;
		this.set({
			_type: $form.attr('data-api-object')
		});
		attrs = {};


		$form.find('input, select, textarea').each(function() {
			var $input = $(this);
			var api_name = $input.attr('data-api-name');
			var type = $input.attr('type');
			var val = '';
			if (!isNothing(api_name)) {
				if (type == 'number') {
					var step = $input.attr('step');
					if (!isNothing(step)) {
						if (step.indexOf('.') != -1) //maybe we have a step of 2, 10, etc
							val = parseFloat($input.val());
						else val = parseInt($input.val(), 10);
					} else val = parseInt($input.val(), 10);

				} else if (type == 'date' || type == 'ra-date') {
					val = jsToSFDate($input.val());
					if (isNothing(val) || isNaN(val)) val = undefined;
				} else if (type == 'checkbox') {
					val = $input.is(':checked') ? "1" : "0";
				} else if (type == 'file') {
					reader = new FileReader();
					reader.readAsDataURL($input.context.files[0]);
				} else {
					val = $input.val();
					if (options.safe) val = val.replace(/'/g, "\\'").replace(/"/g, '\\"');
					if (options.htmlSafe) val = val.replace(/</g, "&lt;").replace(/>/g, '&gt;');
				}
				attrs[api_name] = val;
			}
		});
		this.set(attrs);
		return this;
	} //,
	//this is created for binding this model to a remove, triggering this can allow
	//it to remove itself from a collection, without external referencing
	//remove: function() {
	//     this.trigger('removeSObject',[this]);//trigger our custom event
	//    }
});

//FRAMEWORK INITIALIZER
var BLOCK_NAV = false;
var BLOCK_NAV_ONCE = false;
var BLOCK_NAV_MESSAGE = 'Sorry but navigation is blocked due to the page. Please read the page for what to do.';

function initialize() {
	$(function() {
		//create some basic attachments of events
		//handle inline edits with a button

		$('body').on('click', '.toggle-inline', function(event) {
			$('.inline-edit').find('input, select, textarea').each(function() {
				if ($(this).is(':visible')) $(this).val($(this).data('original-value'));
				else $(this).data('original-value', $(this).val());

			});

			$('.inline-edit').find('input, select, textarea').filter('[data-default-val][value=" "]').val(function(index, value) {
				return $(this).attr("data-default-val");
			});
			$('.inline-readonly,.inline-edit,.edit-toggle').toggle();
			$('.inline-edit').each(function() {
				if ($(this).is(':visible')) {
					$(this).find('input, select, textarea').each(function() {
						attr = $(this).attr('data-required');
						if (typeof attr !== 'undefined' && attr !== false) $(this).closest(".control-group").addClass('error');
					});
				} else $(this).find('input, select, textarea').closest(".control-group").removeClass('error');
			});
		}).on('click', 'a', function(event) {
			if (!$(this).hasClass('external-link')) {
				/*event.preventDefault();
				if (BLOCK_NAV && !$(this).hasClass('skip-block')) {
					flashMessage({
						message: BLOCK_NAV_MESSAGE
					});
					if (BLOCK_NAV_ONCE) BLOCK_NAV = false;
				} else {
					if(!isNothing($(event.target).attr("href")))
						appRouter.navigate($(event.target).attr("href"), {
							trigger: true
						});
				}*/
			}

		}).on('click', function(event) {
			if ((!$(event.target).hasClass('popover-ui') && $(event.target).closest('.popover-ui').length === 0) && !$(event.target).hasClass('popover-sticky')) $('.popover-ui').popover('hide');
			else {
				if ($(event.target).hasClass('popover-sticky')) return;
				if ($(event.target).hasClass('popover-ui')) $contextItem = $(this);
				else $contextItem = $(event.target).closest('.popover-ui');
				id = $contextItem.attr('id');
				if (id !== null && id !== '') {
					$popoversToHide = $('.popover-ui[id!="' + id + '"]');
					if ($popoversToHide.length > 0) $popoversToHide.popover('hide');
				}
			}
		});

		//add the endswith function
		if (typeof String.prototype.endsWith != 'function') {
			String.prototype.endsWith = function(str) {
				return str.length > 0 && this.substring(this.length - str.length, this.length) === str;
			};
		}


		//Why are these not native to validity...? lets add to the community
		addValidityElementSupport('[type="number"]');
		addValidityElementSupport('[type="date"]');
		$.validity.settings.cssClass = 'error'; //why is this used in remove, but the outputmode cssClass is used in the other raise.
	});
}

/* Example usage

var account = new sObject();
var contact = new sObject();

var params = {};
params.action = 'saveAccount';

account.createObjectFromForm($('#account-form'));

params.records = [account.php_format()];

ajaxToProxy(
	params,
	function(result){//success

	},
		function(){failure

	}
);


if you want to set something
account.set({Id : '123abc', _type : 'Account'});



Example Form

<script class="TEMPLATE">

<form data-api-object="Account">
	<input type="hidden" data-api-name="Id" value="{{Id}}"" />
	<input data-required="true" type="text" data-api-name="Name" value="{{Name}}" />
	<textarea data-api-name="Details__c" value="{{Details__c}}" />
</form>

</script>
 */

/*
 This is a base for the grid collection. This just defines that we want an sObject
for the model.
 */
/*******************************************************************************
 *
 *  Dynamic Grids
 *
 *  @description: these are used for either inputs or outputs. These define the
 *             views and collection neccesary, They come with the ability to
 *             add and remove rows by their own context, validate all the
 *             collection, as well format their own sObjects based on flavor
 *
 ******************************************************************************/

/*
 *  Grid collection
 *
 *  @description: Base definition of a collection that uses sObjects, this can
 *                be extended to add other functionality to this.
 */
var gridCollection = Backbone.Collection.extend({
	model: sObject
});

/*
 *  Grid Item View
 *
 *  @description: This is the base for the ItemView for grids. This handles removing itself from
 *  the collection/composite view as well as getting its object from itself.
 */
var gridItemView = Backbone.Marionette.ItemView.extend({
	events: {
		'click .remove-item': 'removeItem'
	},
	removeItem: function() {
		this.model.collection.remove(this.model);
	},
	getsObjectFromForm: function(options) {
		if (options !== null) {
			options.$container = $(this.$el);
			var result = runValidity(options);
			if (!result.valid) this.model.set({
				_validateError: true
			});
			else this.model.set({
				_validateError: false
			});
		}

		this.model.CreateObjectFromForm($(this.$el));
	},

	model: sObject
});


/*
 *  Grid Composite View
 *
 *  @description: The mail view that runs the grid. This is able to house the
 *             overall template for the area and handles the adding of objects
 *             as well as validations and the overall base functions. This is
 *             extended in flavors to give proper formatting of objects.
 *
 */
var gridCompositeView = Backbone.Marionette.CompositeView.extend({
	model: sObject,
	//this is the acutal Case
	events: {
		'click .add-item': 'addItem'
	},

	afterAdd: function() {
		//overrite this for after add functionality
	},

	addItem: function(event) {
		var object = new sObject();
		object._myList = this;
		this.collection.add(object);
		this.afterAdd();
	},

	getsObjectsFromChildForms: function(options) {
		_.each(this.children._views, function(itemView) {
			itemView.getsObjectFromForm(options);
		});
	},

	isCollectionValidated: function() {
		var validated = true;
		_.each(this.collection.models, function(model) {
			if (model.get('_validateError') === true) validated = false;
		});
		return validated;
	},
	getPHPsObjects: function() {
		var objects = [];
		_.each(this.collection.models, function(model) {
			objects.push(model.php_format());
		});
		return objects;
	}
});


/*
 *   This is a collection that is not being used as of yet
 */
var sObjects = Backbone.Collection.extend({
	model: sObject,

	setAttribute: function(prop, value) {
		if (this.attributes === undefined) this.attributes = {};
		if (prop !== undefined) this.attributes[prop] = value;
	},

	getAttribute: function(prop) {
		if (this.attributes === undefined) return null;
		return this.attributes[prop];
	},

	defaults: {
		"type": null,
		"objects": []
	},

	format: function() {
		var objects = this.models;

		var formatedObjects = [];
		for (i = 0; i < objects.length; i++) {
			formatedObjects.push(objects[i].format());
		}
		return formatedObjects;
	},
	absorb: function(objects) {
		if (isNothing(objects)) return;
		for (i = 0; i < objects.length; i++) {
			object = new sObject();
			object.absorb(objects[i]);
			this.add(object);
		}
	}
});

function htmlEncode(value) {
	//create a in-memory div, set it's inner text(which jQuery automatically encodes)
	//then grab the encoded contents back out.  The div never exists on the page.
	return $('<div/>').text(value).html();
}

function htmlDecode(value) {
	return $('<div/>').html(value).text();
}

/*******************************************************************************
 *
 *
 *      Helpful JS Enterprise functions
 *
 *
 *******************************************************************************/

//via: http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
//@author: Marco Demaio
Number.prototype.toMoney = function(decimals, decimal_sep, thousands_sep) {
	var n = this,
		c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
		d = decimal_sep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

		/*
   according to [http://stackoverflow.com/questions/411352/how-best-to-determine-if-an-argument-is-not-sent-to-the-javascript-function]
   the fastest way to check for not defined parameter is to use typeof value === 'undefined'
   rather than doing value === undefined.
   */
		t = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep, //if you don't want to use a thousands separator you can pass empty string as thousands_sep value

		sign = (n < 0) ? '-' : '',

		//extracting the absolute value of the integer part of the number and converting to string
		i = parseInt(n = Math.abs(n).toFixed(c), 10) + '',

		j = ((j = i.length) > 3) ? j % 3 : 0;
	return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

/*
 *  isNothing(value) will return if the thing you asking for is undefined, or null or empty string
 */
function isNothing(value) {
	if (typeof value === 'undefined' || value === undefined || value === null || value === '') return true;
	else return false;
}

/*
 *  valueOrBlank(value) if your value exists return it, otherwise return a blank string
 */
function valueOrBlank(value) {
	if (value === undefined || value === null) return '';
	else return value;
}

/*******************************************************************************
 *Template Manager todo, make me a marionette ext.
 *
 ******************************************************************************/

templates = {
	// Hash of preloaded templates for the app.
	templates: {},

	// Recursively pre-load all the templates for the app.
	// This implementation should be changed in a production environment. All the template files should be
	// concatenated in a single file.
	loadTemplates: function(options) {
		var names = options.names;
		var callback = options.callback;
		var path = options.path;
		var that = this;

		var loadTemplate = function(index) {
			var name = names[index];
			$.get(path + name + '.html', function(data) {
				$('<div>').html(data).find('.view-template').each(function() {
					that.templates[$(this).attr('id')] = $(this).wrap('<div />').parent().html();
				});

				index++;
				if (index < names.length) {
					loadTemplate(index);
				} else {
					if (typeof options.callback == 'function') callback();
				}
			});
		};

		loadTemplate(0);
	},

	// Get template by name from hash of preloaded templates.
	get: function(name) {
		return this.templates[name];
	}

};

/**********************************************************************
 * IE Fixes
 **********************************************************************/

function fixHTML5Dates(options) {
	if (!Modernizr.inputtypes.date) {
		if (isNothing(options)) options = {};
		if (options.past === true)
			$('[type="date"]').datepicker({
				changeMonth: true,
				changeYear: true,
				maxDate: 0,
				yearRange: "-100:+0"
			});
		else
			$('[type="date"]').datepicker({
				changeMonth: true,
				changeYear: true
			});
	}
}

/*******************************************************************************
 *   Helpful Handlebars templetes
 *******************************************************************************/

/*
 *	decodeSFImage
 * takes a richtext field with an image tag and outputs the html for the image
 *
 */
Handlebars.registerHelper('decodeSFImage', function(imageText) {
	if (isNothing(imageText)) return 'No Image Found';
	return $('<div/>').html(imageText).text();
});

/*
 * Servelet an image from SF Attachment
 *
 *
 */
Handlebars.registerHelper('serveletImage', function(id, maxHeight) {
	if (isNothing(id)) return 'No Image Found';
	var serveletImage;
	serveletImage = '<image src="' + window['servelet-link'] + id + '" alt="No Image Preview Available" ';
	if (!isNothing(maxHeight))
		serveletImage += 'style="max-height:' + maxHeight + '" ';
	serveletImage += '/>';
	return serveletImage;
});

/*
 * render checkbox value based on input value
 *
 * @param: value
 *
 */
Handlebars.registerHelper('checkboxValue', function(value) {
	if (value === 1 || value === true || value === '1' || value === 'true') return 'checked=checked';
	return '';
});

Handlebars.registerHelper('valueToReadOnlyCheck', function(value) {
	if (value === 1 || value === true || value === '1' || value === 'true') return '<i class="glyphicon-check" />';
	return '';
});

/*
 * render selected if a value is equal, for select options
 *
 * @param: value
 *
 */
Handlebars.registerHelper('selectedValue', function(selectValue, value) {
	if (selectValue == value) return 'selected="selected"';
});

/*
 * render selected if a value is equal, for select options
 *
 * @param: value
 *
 */
Handlebars.registerHelper('selectOptions', function(value, options, shouldBaseOption) {
	if (isNothing(options)) {
		flashMessage({
			message: 'Failed to load select list options'
		});
		console.log('error in select options:' + value + ' : ' + options);
		return '<option value="ERROR">ERROR</option>';
	}
	var optionsString = '';
	if (shouldBaseOption === true) {
		optionsString += '<option value="" class="default">Please Select...</option>';
	}
	for (var i = 0; i < options.length; i++) {
		optionsString += '<option value="' + options[i].value + '"';
		if (isNothing(value) && options[i].defaultValue) optionsString += ' selected="selected" class="default"';
		else if (value == options[i].value) optionsString += ' selected="selected"';
		optionsString += '>' + options[i].label + '</option>';
	}
	return optionsString;
});

/*
 * render checkbox value based on input value
 *
 * @param: string value
 *
 */
Handlebars.registerHelper('numbersOnly', function(value) {
	value = String.valueOf(value);
	return value.replace(/[^0-9]/g, '');
});

/*
 * render money format value based on input value
 *
 * @param: string value
 *
 */
Handlebars.registerHelper('formatMoney', function(value) {
	if (isNaN(value)) return '0.00';
	value = Number(value).toMoney();
	return value;
});

/*
 * render date format value based on input value
 *
 * @param: string value
 *
 */
Handlebars.registerHelper('formatDate', function(value) {
	return fixDate(value, 'date');
});
//used to drop in to html5 date fields
Handlebars.registerHelper('formatSFDate', function(value) {
	offset = (new Date().getTimezoneOffset()) * 60000; //offset only needed if not SF timeformatting
	if (isNothing(value)) return '';
	if (!isNothing(Modernizr)) {
		if (!Modernizr.inputtypes.date)
			return moment(new Date(value + offset)).format('MM/DD/YYYY');
		else
			return moment(new Date(value + offset)).format('YYYY-MM-DD');
	} else
		return moment(new Date(value + offset)).format('YYYY-MM-DD');
});
Handlebars.registerHelper('formatSFNiceDate', function(value) {
	offset = (new Date().getTimezoneOffset()) * 60000; //offset only needed if not SF timeformatting
	if (isNothing(value)) return '';
	return moment(new Date(value + offset)).format('MM/DD/YYYY');
});
Handlebars.registerHelper('formatSFNiceDateTime', function(value) {
	offset = (new Date().getTimezoneOffset()) * 60000; //offset only needed if not SF timeformatting
	if (isNothing(value)) return '';
	return moment(new Date(value + offset)).format('MM/DD/YYYY h:mm:ss a');
});
Handlebars.registerHelper('momentJSTimeAgo', function(value) {
	offset = (new Date().getTimezoneOffset()) * 60000; //offset only needed if not SF timeformatting
	if (isNothing(value)) return '';
	return moment(new Date(value + offset)).fromNow();
});

/*
 * render datetime format value based on input value
 *
 * @param: string value
 *
 */
Handlebars.registerHelper('formatDateTime', function(value) {
	return fixDate(value, 'datetime');
});

/*
 * render date value value based on input value
 *
 * @param: value
 *
 */
Handlebars.registerHelper('formatDateValue', function(value) {
	return fixDate(value, 'value');
});

/*
 * render date format value based on input utc value
 *
 * @param: string value
 *
 */
Handlebars.registerHelper('formatUTCDate', function(value) {
	return fixDate(value, 'date', true);
});

/*
 * render datetime format value based on input utc value
 *
 * @param: string value
 *
 */
Handlebars.registerHelper('formatUTCDateTime', function(value) {
	return fixDate(value, 'datetime', true);
});

/*
 * render date value value based on input utc value
 *
 * @param: value
 *
 */
Handlebars.registerHelper('formatUTCDateValue', function(value) {
	return fixDate(value, 'value', true);
});

Handlebars.registerHelper('atLeastHelper', function(amt, value) {
	if (value === undefined || value == 'Null' || value === 0 || value === null) return 'No';
	var v = (value >= amt);
	if (v === true) return 'Yes';
	else return 'No';
});

Handlebars.registerHelper('greaterThan', function(amt, value) {
	if (amt > value) return true;
	return false;
});

Handlebars.registerHelper('lessThan', function(amt, value) {
	if (amt < value) return true;
	return false;
});

/*
 * Replace \n with <br />
 *
 */
Handlebars.registerHelper('replaceNewline', function(value) {
	if (isNothing(value)) return '';
	return value.replace(/\n/g, "<br />");
});

/*
 * If equals Helper
 */
Handlebars.registerHelper('ifEquals', function(value1, value2, block) {
	if (value1 == value2) {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});

/*
 * If Not equals Helper
 */
Handlebars.registerHelper('ifNotEquals', function(value1, value2, block) {
	if (value1 != value2) {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});

/*
 * If less Helper
 */
Handlebars.registerHelper('ifLessThan', function(value1, value2, block) {
	if (value1 < value2) {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});

/*
 * If less Helper
 */
Handlebars.registerHelper('ifGreaterThan', function(value1, value2, block) {
	if (value1 > value2) {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});


/*
 * If In Helper
 */
Handlebars.registerHelper('ifIn', function(value, array, block) {
	var that = this;
	_.each(array, function(item) {
		if (value == item)
			return block.fn(this);
	});
	return block.inverse(this);
});

/*
 * If equals Helper
 */
Handlebars.registerHelper('ifStringContains', function(value1, value2, block) {
	if (value1.indexOf(value2) != -1) {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});

/**
*
* select selects an option from a select list 
*

USAGE: 

<select>
    {{#select status}}
    <option value="Completed">Betalad</option>
    <option value="OverDue">Förfallen</option>
    <option value="SentToPayer">Utskickad</option>
    <option value="None">Tillsatt</option>
    {{/select}}
</select>
*
**/
//**Modded to use the default '' value if defined per select
Handlebars.registerHelper('select', function(value, options) {
	var $el = $('<select />').html(options.fn(this));
	if (isNothing(value)) {
		value = '';
	} else {
		$el.find('[value=' + value + ']').attr({
			'selected': 'selected'
		});
	}
	return $el.html();
});

Handlebars.registerHelper("debug", function(optionalValue) {
	console.log("Current Context");
	console.log("====================");
	console.log(this);

	if (optionalValue) {
		console.log("Value");
		console.log("====================");
		console.log(optionalValue);
	}
});

/* 
 * If equals Helper
 */
Handlebars.registerHelper('ifStringContains', function(value1, value2, block) {
	if (!value1) value1 = "";
	if (value1.indexOf(value2) != -1) {
		return block.fn(this);
	} else {
		return block.inverse(this);
	}
});

/*
 * Marrionette is trying to be overly friendly, lets make it work with us instead.
 * This uses our external File templates. once loaded we just compile them and return them
 *
 * TODO: cache the compiled templates, lets not keep caching them. This is what marionnette does,
 * however i could not get it to play nice until here.
 */
_.extend(Marionette.TemplateCache, {
	get: function(templateId) {
		return Handlebars.compile($(templates.get(templateId)).html());
	}
});

//Let me put in whatever I need for the template name
Marionette.View.originalClose = Marionette.View.close;
Marionette.View = _.extend(Marionette.View, {
	getTemplate: function() {
		return this.template;
	},
	close: function() {
		this.originalClose();
		$('.validity-modal-msg').click(); //destroy validations
	}
});

//lets add the $EL to the dom, so our onRender of views on region.show is useful
_.extend(Marionette.Region.prototype, Backbone.Events, {

	//TODO: Run me through a list of views to close, and close on close.
	swap: function(view) {

		this.ensureEl();
		//this.close();

		this.open(view);

		if (view._isRendered === false || view._firstRender === true) { //support layouts
			view.render();
			Marionette.triggerMethod.call(view, "show");
			Marionette.triggerMethod.call(this, "show", view);
		} else {
			//reattach any events
			view.delegateEvents();
			Marionette.triggerMethod.call(view, "swap");
			Marionette.triggerMethod.call(this, "swap", view);
		}

		this.currentView = view;
	},
	hardDrop: function(view) {

		this.ensureEl();
		this.close();

		this.open(view);
		if (view._isRendered === false || view._firstRender === true) { //support layouts
			view.render();
			Marionette.triggerMethod.call(view, "show");
			Marionette.triggerMethod.call(this, "show", view);
		}

		view.delegateEvents();
		Marionette.triggerMethod.call(view, "drop");
		Marionette.triggerMethod.call(this, "drop", view);

		this.currentView = view;
	}

	/*
		THIS CAN STYLIZE THE SHOWING
	open: function(view) {
		this.$el.hide();
		this.$el.html(view.el);
		this.$el.slideDown("fast");
	}*/


});
/*******************************************************************************
 *
 *  BOOTSTRAP Extensions
 *
 ******************************************************************************/
//Lets add a callback / internal template option for tooltip / popover
$.fn.popover.Constructor.prototype = _.extend($.fn.popover.Constructor.prototype, {
	originalBootstrapTooltipShow: $.fn.popover.Constructor.prototype.show,
	show: function() {   
		this.originalBootstrapTooltipShow();   
		if (typeof this.callback == 'function')   this.callback();
	},

	originalBootstrapTooltipInit: $.fn.popover.Constructor.prototype.init,
	init: function(type, element, options) {   
		this.originalBootstrapTooltipInit(type, element, options);   
		if (options.callback !== null)   this.callback = options.callback;   
		if (options.contentTemplate !== null)   this.contentTemplate = options.contentTemplate;   
		if (options.addClass !== null)   this.options.template = this.options.template.replace('class="popover"', 'class="popover ' + options.addClass + '"');
	},

	originalBootstrapPopoverGetContent: $.fn.popover.Constructor.prototype.getContent,
	getContent: function() {   
		if (this.contentTemplate !== null && this.contentTemplate !== undefined) {  
			templateFunction = Handlebars.compile(this.contentTemplate);  
			return templateFunction(this.options.content);     
		} else {  
			return this.originalBootstrapPopoverGetContent();   
		}
	}

});

/*
 * EXAMPLE USEAGE
 * 
 this.$el.find('.popover-ui').popover({
	callback : function() {
   alert('callback!'); //your context of this is Popover, options intact
	}, 
	contentTemplate : "<h3>{{NAME}}</h3>", 
	content : {
   NAME : 'STEVERSON'
	},
	addClass : 'span6'
});
 */

/*
	twinbox multi Select List
*/

(function($) {
	$.fn.twinBoxMultiSelectList = function(options) {

		var settings = $.extend(true, {
			// all styling related options
			styles: {
				containerClass: 'container-list',
				selectedItemClass: 'selected-item',
				width: 'auto',
				height: 'auto'
			},
			// this will append the generated list in the target element
			append2TargetElem: true
		}, options);

		/*
          Returns true if the select option is selected
         */

		function isOptionSelected(opt) {
			var selectedAttr = opt.attr('selected');
			return selectedAttr && selectedAttr == 'selected';
		}

		/*
          Marks the list item as selected
      */

		function markItemSelected(liItem) {
			liItem.addClass(settings.styles.selectedItemClass);
		}

		// Create a blank picklist  
		var pickList = $('<ul/>')
			.css('max-height', settings.styles.height)
			.css('width', settings.styles.width)
			.css('min-height', settings.styles.height)
			.attr('class', settings.styles.containerClass)
			.attr('usageType', 'available');

		var selPickList = pickList.clone();
		selPickList.attr('usageType', 'selected');

		//jk 4/30/2013
		//pass in array and 
		if (!isNothing(options.choices)) {
			var value;
			if (isNothing(options.value)) value = $(this).val();
			else value = options.value;
			if (isNothing(value)) value = '';

			_.each(options.choices, function(choice) {
				var newLi = $('<li/>').html('<span class="value">' + choice.value + '</span>');
				if (!isNothing(choice.otherValue)) newLi.attr('other-value', choice.otherValue);
				if (!isNothing(choice.id)) {
					newLi.attr('id', choice.id);
					newLi.append('<span class="pull-right remove-minus">-</span>');
					newLi.appendTo(selPickList);
				} else {
					newLi.append('<span class="pull-right add-plus">+</span>');
					newLi.appendTo(pickList);
				}
			});
		} else {

			this.find('option').each(

				function() {
					var $this = $(this);
					var newLi = $('<li/>').html($this.html());
					// associate this option with the list item
					newLi.data('option', $this);
					if (isOptionSelected($this)) {
						newLi.append('<span class="pull-right remove-minus">-</span>');
						newLi.appendTo(selPickList);
					} else {
						newLi.append('<span class="pull-right add-plus">+</span>');
						newLi.appendTo(pickList);
					}
				});
		}

		if (settings.append2TargetElem) {
			pickList.appendTo($(options.availableList));
			selPickList.appendTo($(options.selectedList));
		} else {
			$(options.availableList).html(pickList);
			$(options.selectedList).html(selPickList);
		}


		function listItemClickHandler() {
			$(this).change();
			return $(this).slideUp('fast', function() {
				var li = $(this);
				var liParent = li.parent();
				var selOption = li.data('option');
				li = li.remove()
					.data('option', selOption)
					.click(listItemClickHandler);
				var appendToList = null;
				if (liParent.attr('usageType') == 'selected') {
					// un select
					li.find('.remove-minus').remove();
					li.append('<span class="pull-right add-plus">+</span>');
					appendToList = pickList;
					if (!isNothing(selOption)) {
						selOption.removeAttr('selected');
						selOption.attr('selected', false);
					}
				} else {
					appendToList = selPickList;
					li.find('.add-plus').remove();
					li.append('<span class="pull-right remove-minus">-</span>');
					if (!isNothing(selOption)) {
						selOption.attr('selected', 'selected');
					}
				}
				li.appendTo(appendToList);
				li.slideDown();
				return this;
			}); //fadeOut


		}
		if (settings.searchBox) {
			$(settings.searchBox).keyup(function() {
				var searchBoxVal = $(this).val().toLowerCase();
				pickList.find('li').each(

					function() {
						var li = $(this);
						if (li.html().toLowerCase().indexOf(searchBoxVal) < 0) li.hide();
						else {
							li.show();
						}
					});
			});
		}

		// associate click handler with the list item
		pickList.find('li').click(listItemClickHandler);
		selPickList.find('li').click(listItemClickHandler);
		this.hide();
		// maintain chainablity
		return this;
	};
})(jQuery);