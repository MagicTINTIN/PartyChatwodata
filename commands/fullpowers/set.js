const points = require("../../functions/game/points.js");
const xp = require("../../functions/game/xp.js");

module.exports = {
    name: 'set',
    description: 'Définir un nombre de points/xp',
    execute(message, args) {
        const { client } = require("../../index.js");
        if (fullpower.includes(message.author.id)) {
            try {
                let type = args[0];
                let receiver = args[1].replace('<@', '').replace('>', '');
                console.log(receiver);
                let amount = parseInt(args[2]);

                if (type == "points") {
                    points.set(receiver, message.guild, amount)
                    message.channel.send("points updated")
                }
                else if (type == "xp") {
                    xp.set(receiver, message.guild, amount)
                    message.channel.send("xp updated")
                }
                else {
                    message.channel.send("I can't set " + args[0])
                }


            } catch (error) {
                console.log(error);
                message.channel.send("Une erreur s'est produite")
            }
        }
    }
}