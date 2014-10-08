Ext.define('Ext.ux.ColumnTree.View', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.columntreeview',
	requires:[
		'Ext.data.TreeStore',
		'Ext.ux.ColumnTree.layout.FullColumn',
		'Ext.ux.ColumnTree.Column'
	],

	layout:{
		type:'fullcolumn',
		columnWidths:[1,2,1]
	},

	defaultType:'columntreecolumn',

	store:null, // must be a treestore
	config: {
		showIcons:false,
		numColumns:3,
		columns:null
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
	}

});
