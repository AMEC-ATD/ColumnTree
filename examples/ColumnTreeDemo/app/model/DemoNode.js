/**
 */
Ext.define('ColumnTreeDemo.model.DemoNode', {
	extend: 'Ext.data.Model',
	idProperty: 'NodeID',

	fields: [
		{ name: 'NodeID', type: 'int' },
		{ name: 'Title', type: 'string' },
		{ name: 'State', type: 'int' },
		{ name: 'ctime', type: 'date' },
		{ name: 'mtime', type: 'date' }
	],
  proxy: {
    type:'rest'
  }
});
