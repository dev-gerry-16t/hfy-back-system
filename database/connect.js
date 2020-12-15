var Connection = require('tedious').Connection;
var config = {
    server: 'DESKTOP-JLVI3FK',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '#####'
        }
    },
    options: {
        database: 'homify',
        instanceName: 'MSSQLSERVER',
        rowCollectionOnDone: true,
        useColumnNames: false
    }
}
var connection = new Connection(config);
connection.on('connect', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected');
    }
});
module.exports = connection;