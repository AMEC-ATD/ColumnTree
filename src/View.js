Ext.define('Ext.ux.ColumnTree.View', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.columntreeview',
	requires:[
		'Ext.data.TreeStore',
		'Ext.ux.ColumnTree.Column',
		'Ext.layout.container.Border'
	],

	columnWidths:[1,2,1],

	layout:"border",

	defaultType:'columntreecolumn',

	store:null, // must be a treestore

	config: {
		showIcons:false,
		numColumns:3,
		columns:null,
		levelOffset:10
	},

	viewModel:{
		data:{
			treeStore:null
		}
	},


	initComponent: function() {
		if (Ext.isString(this.store)) {
			this.store = Ext.StoreMgr.lookup(this.store);
		} else if (!this.store || !this.store.isStore) {
			this.store = Ext.StoreMgr.lookup(Ext.apply({
				type: 'tree',
				root: this.root || {Title:this.getTitle()},
				fields: this.fields,
				model: this.model,
				folderSort: this.folderSort
			}, this.store));
		}

		this.callParent(arguments);

		this.store.load({
			callback:function() {
				this.store.getRootNode().expand();
				this.getViewModel().set("treeStore",this.store);
				this.add({
					rootNode:this.store.getRootNode(),
					columns:this.columns
				});
			},
			scope:this
		});
	},
	listeners:{
		'add':function(container,comp, index) { 
			this.redoLayout(); 
			comp.on("expand",this.onPanelExpaneded,this);
		},
		'remove': function(container, comp) {this.redoLayout(); 	}
	},
	redoLayout:function() {
			var panels = this.query('>columntreecolumn');

			var itemsToShow = Math.min(this.columnWidths.length,panels.length);
			var indexOfFirstVisible = panels.length-itemsToShow;

			var total = 0;
			var i;
			for(i = 0; i < itemsToShow; i++) {
				total += this.columnWidths[i];
			}

			for(i = 0, len = panels.length; i < len; i++) {
				var panel = panels[i];
				if(i < panels.length - 1) {
					panel.setRegion("west");
				}
				else {
					this.getLayout().centerRegion = null;
					panel.setRegion("center");
				}
				if(i < indexOfFirstVisible) {
					if(panel.getCollapsed() === false) {
						panel.collapse();
					}
				}
				else {
					if(panel.getCollapsed() !== false) {
						panel.expand(false);
					}
					panel.setFlex(Math.round(this.columnWidths[i-indexOfFirstVisible]*100/total)/100);
					if(!panel.rendered) {
						var topMargin = i * this.getLevelOffset();
						panel.margin = topMargin + " 0 0 0";
					}
					else {
						panel.margin = 0;
					}
				}
			}
	},
	onPanelExpaneded:function(panel) {
		var panels = this.query(">columntreecolumn");

		var itemsToShow = Math.min(this.columnWidths.length,panels.length);
		var indexOfExpaneded = panels.indexOf(panel);

		if(panels.length - itemsToShow > indexOfExpaneded) {
			this.suspendEvent("remove");
			var i, len;
			for(i = indexOfExpaneded + itemsToShow, len = panels.length; i < len; i++) {
				this.remove(panels[i]);				
			}
			panels[indexOfExpaneded + itemsToShow -1].setSelection();
			this.resumeEvent("remove");
			this.redoLayout();
		}

	}

});
