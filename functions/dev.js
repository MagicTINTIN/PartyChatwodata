const { client } = require("../index.js");
const devfct = require("./devfct.js");

function avoirounon(istrue) {
    if (istrue)
        return " a "
    else
        return " n'a pas "
}

function etreounon(istrue) {
    if (istrue)
        return " est "
    else
        return " n'est pas "
}

module.exports = {
    // commandes de test
    testbot: function (message) {
        if (!fullpower.includes(message.author.id)) return
        if (message.content.toLowerCase().startsWith(";getid")) {

            if (!message.mentions.users.size) {
                userinfo = message.author;
                memberinfo = message.guild.members.cache.get(userinfo.id);
            }
            else {
                usrmention = message.mentions.users.first();
                memberinfo = message.guild.members.resolve(usrmention);
            }

            message.channel.send("id : " + memberinfo.user.id)
        }
        if (message.content.toLowerCase().startsWith(";empty")) {
            message.channel.send('\u200B')
        }

        if (message.content.toLowerCase().startsWith(";isboosting")) {
            memberinfo = message.guild.members.cache.get(message.content.slice(12));

            if (!memberinfo)
                message.channel.send("Personne n'a été trouvé")
            else {
                console.log(memberinfo.premiumSinceTimestamp);
                message.channel.send(memberinfo.user.tag + etreounon(memberinfo.premiumSinceTimestamp > 0) + "en train de booster le serveur")
            }
        }
    },

};