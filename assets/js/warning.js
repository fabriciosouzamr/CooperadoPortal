var warning = (function(){
	'use strict';
	var self;

	return {
		init : function()
		{
			self = this;
			self.initVars();
			self.processTriggers();
			self.onElementsClick();

			if( Cookies.get('warning') === '1' )
			{
				$('#warning').remove();
			}

			self.trigger('warning-ready');
		},

		initVars: function()
		{
			self.debug = true;
		},

		trigger: function(p_trigger_name, p_args)
		{
			if (p_args === undefined)
			{
				$(document).trigger(p_trigger_name);
				if (self.debug === true) { console.log('Trigger: ' + p_trigger_name); }
			}
			else
			{
				$(document).trigger(p_trigger_name, p_args);
				if (self.debug === true) { console.log('Trigger: ' + p_trigger_name, p_args); }
			}
		},

		processTriggers: function()
		{

		},

		onElementsClick: function()
		{
			$(document).on
			(
				'click',
				'.warning a.btn-close',
				function(e)
				{
					e.preventDefault();
					self.closeWarning();
				}
			);
		},

		closeWarning: function()
		{
			Cookies.set('warning', 1, { expires: 1 });
			$('#warning').slideUp
			(
				'slow', 
				function()
				{
					$(this).remove();
				}
			);
		}
	}

})();

// jQuery Use
$(document).ready(function() {
	warning.init();
});