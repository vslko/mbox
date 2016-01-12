/*
 * jQuery MantellaBox (mBox) v0.1 plugin
 * Copyright (c) 2014 Vasilij Olhov
 * Dual licensed under the MIT and GPL licenses
*/

;(function($) {

    // ================================================
    // =============== DEFAULT OPTIONS ================
    // ================================================
    var defaults = {
						icon		: null,
						caption		: ' ',
						lockText	: 'Please wait..',
						collapsable	: false,
						collapsed	: false,
						draggable	: false,
						onExpand	: null,
						onCollapse	: null
	};




    // ================================================
    // =============== EXTERNAL METHODS ===============
    // ================================================
    var methods = {

        // === Initailization ===
        init: function(params) {

            var options = $.extend(true, {}, defaults, params),
            	content	= this.html(),
            	header	= null,
            	caption	= null;

            this.data('options',options);
            this.data('drag',
                	  {
                		dragged : false,
                		offsetX : 0,
                		offsetY : 0,
                	  }
            );

        	// clear block and define as container
        	this.empty().addClass('mbox-container');
	        // add header
    	    header = $('<div class="mbox-header"></div>').appendTo(this);

	        // add caption
    	    caption = $('<div class="caption"></div>').appendTo(header).text( options['caption'] );
        	if ( options['icon'] ) { caption.addClass('iconized').css('background-image', 'url('+options['icon']+')'); }
	        // add expand/collapse arrow icon
    	    if ( options['collapsable'] ) { $('<div class="control ' + ( options.collapsed ? "collapsed" : "expanded" ) + '"></div>').appendTo(header); }
        	// add float reset block
	        $('<div style="clear:both"></div>').appendTo(header);
			// add body
			$('<div class="mbox-body"></div>').appendTo(this).html(content).css('display', ( options.collapsed ? 'none' : 'block' ) );
			// add hidden progressbar
			$('<div class="mbox-progress"></div>').appendTo(this);

            // set events for plugin
            bindActions.call(this);

            return this;
        },

        // === Change caption in header ===
        caption: function( caption ) {
        	this.find('div.mbox-header div.caption').text(caption);

        	return this;
        },

        // === Change icon ===
        icon: function( icon ) {
        	var caption = this.find('div.mbox-header div.caption');
        	if (icon) { caption.addClass('iconized').css('background-image', 'url('+icon+')'); }
        	else { caption.removeClass('iconized').css('background-image', 'none'); }

        	return this;
        },

        // === Forced expand window ===
        expand: function() {
        	var options  = this.data('options'),
        		switcher = this.find('div.mbox-header div.control');

            if ( options.collapsable && switcher.hasClass('collapsed') ) {
            	switcher.trigger('click');
            }

        	return this;
        },

        // === Forced collapse window ===
        collapse: function() {
        	var options  = this.data('options'),
        		switcher = this.find('div.mbox-header div.control');

        	if ( options.collapsable && switcher.hasClass('expanded') ) {
            	switcher.trigger('click');
            }

            return this;
        },



        // === Lock window and set progress ===
        lock: function( message ) {        	var options = this.data('options'),
        		text	= (message ? message : options.lockText ),
        		overlay	= this.find('div.mbox-progress').first(),
        		header	= this.find('div.mbox-header'),
        		body	= this.find('div.mbox-body').first();

            if ( header.hasClass('collapsed') || overlay.is(':visible') ) { return this; }

            var offset = parseInt( ( body.outerWidth(true) - body.innerWidth() ) / 2 );
            overlay.height( body.innerHeight() )
            	   .width(  body.innerWidth() - offset )
                   .css('top', header.outerHeight(true)+'px' )
                   .css('margin-left', offset+'px');

            var textbox = $('<div class="mbox-progress-message" style="padding-top: 20px !important;">'+text+'</div>').appendTo(overlay);
            textbox.css('margin-top', ( parseInt(body.innerHeight()/2)-20)+'px');

            overlay.show();

        	return this;        },

        // === Hide progress and unlock window ===
        unlock: function() {        	this.find('div.mbox-progress').empty().hide();
        	return this;        }




    };






    // =================================================
    // ================ BIND ACTIONS ===================
    // =================================================
    var bindActions = function() {
		var me = this,
			options = me.data('options');

		// click on expand/collapse icon
		me.find('div.mbox-header div.control').on('click', function(event) {

			if ( $(this).hasClass('expanded') ) {
	   			$(this).removeClass('expanded').addClass('collapsed');
	   			me.find('div.mbox-body')
	   			  .slideUp( 'fast',
	   			  			function() { me.find('div.mbox-header').addClass('collapsed'); }
	   			);
	   			if (options.onCollapse) { options.onCollapse.call( me ); }
	   		}
	   		else {
	   			$(this).removeClass('collapsed').addClass('expanded');
	   			me.find('div.mbox-header').removeClass('collapsed');
	   			me.find('div.mbox-body').slideDown( 'fast' );
	   			if (options.onExpand) { options.onExpand.call( me ); }
	   		}

	   		return false;
	   	})
	   	.on('mousedown', function( event ) { return false; });


	   	if ( options.draggable ) {	   		var header = me.find('div.mbox-header');

	   		// start
	   		header.on('mousedown', function( event ) {
	   			var offset = me.offset();

	   			me.css('z-index','99999')
	   			  .css('position','absolute')
	   			  .css('top',  offset.top+'px')
	   			  .css('left', offset.left+'px');
                me.data( 'drag',
                		 {
                			dragged : true,
                			offsetX : event.pageX-offset.left,
                			offsetY : event.pageY-offset.top,
                		 }
                );
	   		});
			// process
			$(document).on('mousemove', function( event ) {
				var drag = me.data('drag');
				if (drag.dragged) {					me.css( 'left' , (event.pageX-drag.offsetX)+'px' )
					  .css( 'top', (event.pageY-drag.offsetY)+'px' );
					return false;				}
			});
			// drop
			$(document).on('mouseup', function() {
            	var drag = me.data('drag');
            	if (drag.dragged) {
	            	me.css('z-index','');
	            	me.data( 'drag',
    	            		 {
        	        			dragged : false,
            	    			offsetX : 0,
                				offsetY : 0,
                			 }
	                );
	            	return false;
				}
            });

	   	}

	};






    // =================================================
    // ============ EXTERNAL ENTRY POINT ===============
    // =================================================
    $.fn.mBox = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) { return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 )); }
        else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) { return methods.init.apply( this, arguments ); }
        else { return false; }
    };




})(jQuery);
