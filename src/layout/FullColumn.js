/*

 */
Ext.define('Ext.ux.ColumnTree.layout.FullColumn', {
	extend:'Ext.layout.container.Column',
	alias:'layout.fullcolumn',

	columnWidthSizePolicy: {
		readsWidth: 0,
		readsHeight: 0,
		setsWidth: 1,
		setsHeight: 1
	},

	beginLayout: function(ownerContext) {
		this.updateColumnWidths();
		this.callParent(arguments);
	},

	calculateItems: function(ownerContext, containerSize) {

		var me = this,
			targetContext = ownerContext.targetContext,
			items = ownerContext.childItems,
			len = items.length,
			contentHeight = 0,
			gotHeight = containerSize.gotHeight,
			blocked = false, availableHeight, i, itemContext, itemMarginHeight;
			

		// No parallel measurement, cannot lay out boxes.
		if (gotHeight === true) {
			availableHeight = containerSize.height;
		} else {
			targetContext.domBlock(me, 'height');
			blocked = true;
		}

		if (!blocked) {
			for (i = 0; i < Math.min(3,len); ++i) {
				itemContext = items[i];
				if (itemContext.heightModel.calculated) {
					itemMarginHeight = itemContext.getMarginInfo().height; 

					itemContext.setHeight(availableHeight - itemMarginHeight); 
				}
			}

			ownerContext.setContentHeight(availableHeight + ownerContext.paddingContext.getPaddingInfo().height);
			

		}

		var columnBlocked = this.callParent(arguments);
		return !blocked && columnBlocked;

	},


	updateColumnWidths:function() {
		var panels = this.owner.query(">panel");

		var itemsToShow = Math.min(this.columnWidths.length,panels.length);
		var indexOfFirstVisible = panels.length-itemsToShow;

		var total = 0;
		var i;
		for(i = 0; i < itemsToShow; i++) {
			total += this.columnWidths[i];
		}


		for(i = 0, len = panels.length; i < len; i++) {
			var panel = panels[i];
			if(i < indexOfFirstVisible) {
				panel.columnWidth = 0;
			}
			else {
				panel.columnWidth = Math.round(this.columnWidths[i-indexOfFirstVisible]*100/total)/100;
			}
		}

		
	},

	updateColumnWidths_old:function() {
		var panel = this.owner.items.first();

		while(!Ext.isEmpty(panel) && panel.collapsed) {	
			panel.columnWidth = 0;
			panel = panel.nextSibling(); 
		}

		var total = 0;

		var i, len;
		for(i = 0, len = Math.min(this.columnWidths.length,this.owner.items.length); i < len; i++) {
			total += this.columnWidths[i];
		}

		for(i = 0, len = Math.min(this.columnWidths.length,this.owner.items.length); i < len; i++) {
			panel.columnWidth = Math.round(this.columnWidths[i]*100/total)/100;
			panel = panel.nextSibling();
			if(Ext.isEmpty(panel)) { break; }
		}

		while(!Ext.isEmpty(panel)) {	
			panel.columnWidth = 0;
			panel = panel.nextSibling(); 
		}

		//this.owner.doLayout();
		
	}

});
