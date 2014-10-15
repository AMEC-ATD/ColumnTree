/**
 * Grid that contains a list of nodes that are children of {Ext.ux.ColumnTree.Column.rootNode}.
 * Uses the owner container's view model to get the {treeStore} that this column is a chained store
 * of. The store technically contains all nodes in the tree, but has a filter function that only 
 * shows nodes that have the same {Ext.data.Model.IdProperty} value as a child of the {RootNode}.
 */
Ext.define('Ext.ux.ColumnTree.Column', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.columntreecolumn',

	requries:[
	],

	config:{
		/**
		 * parent node of all nodes show in this store. 
		 * @type {Ext.data.Model}
		 */
		rootNode:null
	},

	viewModel:{

	},

	flex:1,
	collapseDirection: Ext.Component.DIRECTION_LEFT,
	animCollapse: 1,
	//collapseMode:"mini",
	frame:true,
	enableColumnMove:false,
	enableColumnResize:false,
	emptyText:"No Entries Found",
	hideHeaders:true,
	columns:[],
	store:{
		type:"chained"
	},
	viewConfig: {
		emptyText:"No Entries Found",
		deferEmptyText:false,
		getRowClass:function(record, index, rowParams, store) {
			return record.get("disabled") ? "row-disabled" : "row-enabled";
		}
	},

	applyRootNode:function(root) {
		if(!Ext.isEmpty(this.nextSibling())) {
			this.nextSibling().setRootNode(null);
		}
		if(!Ext.isEmpty(root)) {		
			this.setTitle(root.get("Title"));

			if(this.getStore().isStore) {
				this.getStore().clearFilter();
				this.getStore().addFilter({
					filterFn:this.filterFn,
					root:root
				});
			}
		}
		else {
			this.ownerCt.remove(this);
		}
		return root;
	},

	initComponent: function() {
		this.callParent(arguments);
		this.getStore().setSource(this.getViewModel().get("treeStore"));
		this.getStore().addFilter({
			filterFn:this.filterFn,
			root:this.getRootNode()
		});		
	},

	filterFn:function(item) {
		return this.getRoot().findChild(this.getRoot().idProperty,item.get(this.getRoot().idProperty));
	},

	listeners:{
		'itemclick': function(grid, record, item, index) {
			if(!Ext.isEmpty(record)) {
				record.expand(false, function() {
					if(!Ext.isEmpty(this.nextSibling())) {
						this.nextSibling().setRootNode(record);
					}
					else {
						this.ownerCt.add(Ext.applyIf({
							rootNode:record,
						},this.initialConfig));
					}			
				},this);
			}
		}
	}

});

