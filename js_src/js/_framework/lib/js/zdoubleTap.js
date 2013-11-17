(function($) {
	$.fn.doubleTap = function(singleTapCallback, doubleTapCallback, context) {
		return this.each(function() {
			var elm = this;
			var shouldSingleClick = true;
			var lastTap = 0;
			$(elm).bind('click', function(e) {
				var now = (new Date()).valueOf();
				var diff = (now - lastTap);
				lastTap = now;
				if (diff < 750) {
					shouldSingleClick = false;
					if ($.isFunction(doubleTapCallback)) {
						doubleTapCallback.call(context);
						setTimeout(function() {
							shouldSingleClick = true;//reset after time
					}, 775);
					}
				} else {
					//we are on single tap
					setTimeout(function() {
						if (shouldSingleClick) if ($.isFunction(singleTapCallback)) {
							singleTapCallback.call(context);
						}
					}, 775);
				}

			});
		});
	}
})(jQuery);