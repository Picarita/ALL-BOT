const config = require('./config.json');

module.exports = {
    enabled: true,
    lavalink: config.nodes || [
        {
            name: "Node 1",
            host: "lavalink.jirayu.net",
            port: 13592,
            password: "youshallnotpass",
            secure: false
        },
        {
            name: "Node 2",
            host: "lavalinkv4.serenetia.com",
            port: 80,
            password: "https://seretia.link/discord",
            secure: false
        },
        {
            name: "Node 3",
            host: "lavalink.triniumhost.com",
            port: 2333,
            password: "kirito",
            secure: false
        }
    ]
};
