module.exports = {
    network: {
        host: '0.0.0.0', // api server listening port
        port: 12345, // api server 
    },
    db: {
        host: 'abc.rds.amazonaws.com',
        dialect: 'mysql',
        uri: 'mysql://id:pw@abc.rds.amazonaws.com/table',
        timezone: "+09:00",
    },
    log: {
        stdout: 'dev',
        access: {
            directory: 'logs',
            filename: 'access.log',
            format: 'combined',
        },
    }
  };