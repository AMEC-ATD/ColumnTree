Ext.define('Ext.ux.ColumnTree.View', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.columntreeview',
	requires:[
		'Ext.data.TreeStore',
		'Ext.ux.ColumnTree.Column',
		'Ext.layout.container.Border'
	],


	layout:"border",

	defaultType:'columntreecolumn',

	store:null, // must be a treestore

	config: {
		columnViews:[
			[{ flex:2, dataIndex:"text", hideable: false}]
		],
		numColumnConfig:{
			1:{ colWidths:[1], colMap:[0]	},
			2:{ colWidths:[2,1], colMap:[0,0]	},
			3:{ colWidths:[1,2,1], colMap:[0,0,0]	}
		},
		showIcons:false,
		levelOffset:2
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
					rootNode:this.store.getRootNode()
				});
			},
			scope:this
		});
	},

	getColumnsForPanel: function(width) {
		return this.columnViews[0];
	},

	listeners:{
		'add':function(container,comp, index) { 
			this.redoLayout(); 
			comp.on("expand",this.onBeforePanelExpaneded,this);
		},
		'remove': function(container, comp) {this.redoLayout(); 	}
	},
	redoLayout:function() {
			var panels = this.query('>columntreecolumn');

			var config = this.numColumnConfig[panels.length];

			var colWidths = [];
			var colMap = [];
			var i, len;
			var panel;

			for(i = 0, len = panels.length; i < len; i++) {
				panel = panels[i];
				if(!Ext.isEmpty(this.numColumnConfig[panels.length - i])) {
					Ext.Array.push(colWidths, this.numColumnConfig[panels.length - i].colWidths);
					Ext.Array.push(colMap, this.numColumnConfig[panels.length - i].colMap);
					break;
				}
				else {
					colWidths.push(0);
					colMap.push(null);
				}
				
			}

			Ext.suspendLayouts();

			for(i = 0, len = panels.length; i < len; i++) {
				panel = panels[i];

				//1. set width (has to happen before regions change)
				if(colWidths[i] > 0 ) {
					panel.setFlex(colWidths[i]);

					if(!panel.rendered) {
						var topMargin = i * this.getLevelOffset();
						panel.margin = topMargin + " 0 0 0";
					}
					else {
						panel.margin = 0;
					}
					
				}

				//2. set region
				if(i < panels.length - 1) {
					panel.setRegion("west");
				}
				else {
					this.getLayout().centerRegion = null;
					panel.setRegion("center");
				}

				//4. set columns
				if(!Ext.isEmpty(colMap[i])) {
					panel.reconfigure(this.columnViews[colMap[i]]);
				}			

				//3. check visibility
				if(colWidths[i] <= 0 && panel.getCollapsed() === false) {
					panel.collapse();
				}
				else if(colWidths[i] > 0 && panel.getCollapsed() !== false) {
					panel.suspendEvent("expand");
					panel.expand(false);
					panel.resumeEvent("expand");
				}


			}
			Ext.resumeLayouts(true);
	},

	onBeforePanelExpaneded:function(panel) {
		var panels = this.query(">columntreecolumn");

		var indexOfExpaneded = panels.indexOf(panel);
		var needsLayout = false;


		var i, len;
		this.suspendEvent("remove");
		for(i = indexOfExpaneded, len = panels.length; i < len; i++) {
			if(!Ext.isEmpty(this.numColumnConfig[panels.length - indexOfExpaneded])) {
				break;
			}
			else {
				this.remove(panels.pop());
				panels[panels.length-1].setSelection();
				needsLayout = true;
			}
		}
		this.resumeEvent("remove");
		if(needsLayout) {
			this.redoLayout();
		}
	}

});
