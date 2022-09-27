module.exports = {
    name: 'help',
    description: "Obtenir de l'aide",
    execute(message) {
        const { Client, MessageEmbed } = require('discord.js');
        const embedmeow = new MessageEmbed()
            .setTitle('Liste des commandes admin')
            .setColor(0xffa1a1)
            .setDescription(`Voici la liste des commandes
\n> \`&help\` affiche ce message`);
        message.channel.send({ embeds: [embedmeow] });
    }
}