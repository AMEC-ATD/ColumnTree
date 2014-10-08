Ext.define('Ext.ux.ColumnTree.Column', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.columntreecolumn',

	requries:[
		'Ext.layout.container.Fit',
		'Ext.grid.panel'
	],

	config:{
		rootNode:null
	},

	updateRootNode:function(root) {
		if(!Ext.isEmpty(this.nextSibling())) {
			this.nextSibling().setRootNode(null);
		}
		if(!Ext.isEmpty(root)) {
			this.getViewModel().set("rootNode",root);
		}
		else {
			this.ownerCt.remove(this);
		}
	},

	viewModel:{

	},

	collapsible: true,
	collapseDirection: Ext.Component.DIRECTION_LEFT,
	animCollapse: true,
	autoDestroy: false,
	hideCollapseTool: true,
	header:false,		
	layout:"fit",
	border:false,
	items:[{
		frame:true,
		xtype: 'grid',
		enableColumnMove:false,
		enableColumnResize:false,
		bind:{
			title:"{rootNode.Title}",
			store:{
				type:"chained",
				source:"{treeStore}",
				filters:[{
					filterFn:function(item) {
						return this.getRoot().findChild(this.getRoot().idProperty,item.get(this.getRoot().idProperty));
					},
					root:"{rootNode}"
				}]
			}
	
		},
		columns:[{ flex:2, dataIndex:"Title", hideable: false}],
		viewConfig: {
			emptyText:"No Entries Found",
			deferEmptyText:false,
			getRowClass:function(record, index, rowParams, store) {
				return record.get("disabled") ? "row-disabled" : "row-enabled";
			}
		},
		emptyText:"No Entries Found",
		hideHeaders:true
	}],

	initComponent:function() {
		this.callParent(arguments);
		this.down("grid").on("selectionchange",this.selectionChanged,this);
	},

	selectionChanged: function(grid, selected) {
		var node = selected[0];
		if(!Ext.isEmpty(node)) {
			node.expand(false, function() {
				if(!Ext.isEmpty(this.nextSibling())) {
					this.nextSibling().setRootNode(node);
				}
				else {
					this.ownerCt.add({
						rootNode:node
					});
				}			
			},this);
		}
	}
});
