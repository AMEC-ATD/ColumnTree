/**
 * Shows a tree view in column form. Children of the root node are shown in the first column. When
 * a node in a column is selected the children of that node are shown in the next column to the 
 * right. The layout and content of the columns are controlled by the {colViews} and 
 * {numColumnConfig} properties. If the left most column is clicked, and it isn't the children of
 * the root node, its parent is expanded. In this way you can move back up the tree. In addition 
 * enabling the breadcrumb trail or changing the collapseMode to null will allow traversal up the 
 * tree. 
 */
Ext.define('Ext.ux.ColumnTree.View', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.columntreeview',
	requires:[
		'Ext.data.TreeStore',
		'Ext.ux.ColumnTree.Column',
		'Ext.layout.container.Border',
		'Ext.toolbar.Toolbar'
	],

	layout:"border",

	defaultType:'columntreecolumn',

	/**
	 * Tree store to be used in this view. This is passed to the {Ext.ux.ColumnTree.Column}s via the
	 * {treeStore} view model value. 
	 * @type {Ext.data.TreeStore}
	 */
	store:null, // must be a treestore

	config: {

		/**
		 * Available sets of {Ext.grid.Panel.columns} to use in each {Ext.ux.ColumnTree.Column}.
		 * @type {Ext.grid.column.Column[][]}
		 */
		columnViews:[
			[{ flex:2, dataIndex:"text", hideable: false}]
		],

		/**
		 * Configures how {Ext.ux.ColumnTree.Column}s will be laid out. Object is indexed by the number 
		 * of {Ext.ux.ColumnTree.Column}s currently visible. numColumnConfig[1] is used when one 
		 * {Ext.ux.ColumnTree.Column} is visible, numColumnConfig[2] when two 
		 * {Ext.ux.ColumnTree.Column}s are visible and so forth. Each config contains two properties: 
		 * colWidths and ColMap. colWidths is used to define the {Ext.layout.container.Box.flex} values 
		 * of each visible {Ext.ux.ColumnTree.Column}. For example  colWidths:[2,1] would make the 
		 * first {Ext.ux.ColumnTree.Column} be 66% of the available area, and the second 
		 * {Ext.ux.ColumnTree.Column} 33% of the area. colMap is used to define which 
		 * {Ext.ux.ColumnTree.Column} set in columnViews should be used for each 
		 * {Ext.ux.ColumnTree.Column}. For example colMap:[1,0] would use columnViews[1] for the 
		 * {Ext.grid.Panel.columns} in the first visible {Ext.ux.ColumnTree.Column} and columnViews[0] 
		 * for the {Ext.grid.Panel.columns} in the second visible visible {Ext.ux.ColumnTree.Column}. 
		 * @type {Object}
		 */
		numColumnConfig:{
			1:{ colWidths:[1], colMap:[0]	},
			2:{ colWidths:[2,1], colMap:[0,0]	},
			3:{ colWidths:[1,2,1], colMap:[0,0,0]	}
		},

		/**
		 * Number of pixels to off set each subsequent level of the tree. This provides a subtle 
		 * indicator that this is a hierarchy. 
		 * @default 1
		 * @type {Number}
		 */
		levelOffset:1,

		/**
		 * Config that is passed to each panel created. 
		 * @type {Object}
		 */
		panelConfig:{
			collapseMode:'mini'
		},

		/**
		 * true to enable the breadcrumb trail.
		 * @default true
		 * @type {Boolean}
		 */
		breadCrumbEnabled:true
	},

	viewModel:{
		data:{
			treeStore:null
		}
	},

	dockedItems:[{
		xtype: 'toolbar',
		cls:"BreadCrumbTrail",
		bind:{
			hidden:"{!breadCrumbEnabled}"
		},
		dock: 'top'
	}],

	updateBreadCrumbEnabled: function(value) {
		this.getViewModel().set("breadCrumbEnabled",value);
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
				this.add(Ext.apply({},{
					rootNode:this.store.getRootNode()
				},this.getPanelConfig()));
			},
			scope:this
		});
	},

	listeners:{
		'add':function(container,comp, index) { 
			this.redoLayout(); 
			if(this.getBreadCrumbEnabled() === true) {
				this.pushBreadCrumbTrail(comp.getRootNode());
			}
			comp.on("expand",this.onBeforePanelExpaneded,this);
		},
		'remove': function(container, comp) {
			this.redoLayout(); 
			if(this.getBreadCrumbEnabled() === true) {	
				this.popBreadCrumbTrail();
			}
		}
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

				//3. set columns
				if(!Ext.isEmpty(colMap[i])) {
					panel.reconfigure(this.columnViews[colMap[i]]);
				}			

				//4. check visibility
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
	},


	popBreadCrumbTrail: function() {
		var trail = this.down("toolbar[cls=BreadCrumbTrail]");
		trail.remove(trail.items.last());
		trail.remove(trail.items.last());
	},

	pushBreadCrumbTrail: function(node) {
		this.down("toolbar[cls=BreadCrumbTrail]").add([{
				text: node.get("Title"),
				node:node,
				handler:function(button) {
					this.breadCrumbTrailClick(button.node);
				},
				scope:this
			},{	xtype: 'tbtext', text: '>' }]);
	},

	breadCrumbTrailClick:function (node) {
		var panels = this.query(">columntreecolumn");
		var index = panels.length - 1;
		var panel;
		while(index > 0) {
			panel = panels[index];
			if(panel.getRootNode() === node) {
				break;
			}
			else {
				this.remove(panel);
				index--;
			}
		}

	}

});
