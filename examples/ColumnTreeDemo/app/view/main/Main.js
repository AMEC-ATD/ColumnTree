/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('ColumnTreeDemo.view.main.Main', {
    extend: 'Ext.container.Container',

    xtype: 'app-main',

    requires:[
        'Ext.grid.Panel',
        'Ext.ux.ColumnTree.View',
        'ColumnTreeDemo.model.DemoNode',
        'Ext.data.TreeStore',
        'Ext.data.proxy.Rest'
    ],
    
    controller: 'main',
    viewModel: {
        type: 'main'
    },

    layout: {
        type: 'border'
    },

    items: [{
        xtype: 'panel',
        bind: {
            title: '{name}'
        },
        region: 'west',
        html: ['<h3>Features</h3>',
                '<ul>',
                    '<li>Use a tree store to represent heirachical data</li>',
                    '<li>clicking on an item should "Expand" it to the next column</li>',
                    '<li>Columns should be expand in from the right</li>',
                    '<li>Columns should colapse to the left when there are more than 3</li>',
                '</ul>'].join(""),
        width: 250,
        split: true
    },{
        region: 'center',
        xtype:"columntreeview",
        title:"My Tree Columns",
        root:{
            Title:"Top Level"
        },
        store:{
            type:"tree",
            storeId:"MyTreeStore",
            nodeParam:"NodeID",
            defaultRootId: 0,
            model:"ColumnTreeDemo.model.DemoNode",
            proxy: {
                type:'rest',
                url: "ExampleData/DemoNodes"
            }
        },
        columns: [
            { flex:2, dataIndex:"Title", hideable: false}
        ]
    }]
});
