const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions, DiscordAPIError, MessageSelectMenu } = require('discord.js');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const other = require("../../functions/other.js");
/*const Canvas = require('@napi-rs/canvas');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');*/
const Canvas = require('canvas');

const maxBtnInaRow = 5;
const maxRow = 4;


module.exports = {

    checkCardDimensions: async function (imglink) {
        extension = path.extname(imglink)
        const image = await Jimp.read(imglink);


        if (image && image.bitmap.width && image.bitmap.height && extension && image.bitmap.width <= 1000 && image.bitmap.height <= 1000 && (extension.toLowerCase().startsWith(".jpg") || extension.toLowerCase().startsWith(".jpeg") || extension.toLowerCase().startsWith(".png"))) {
            console.log("Image Ok");
            messagecollected += imglink + " " + image.bitmap.width + " " + image.bitmap.height + " "
            console.log("OK", image.bitmap.width, image.bitmap.height, extension);
            return true
        } else {
            if (image && image.bitmap.width && image.bitmap.height) {
                console.log(image.bitmap.width, image.bitmap.height, extension);

            } else {
                console.log(extension);
            }
            return false

        }
    },

    previewCard: async function (type, moreinfos) {

        if (type == "welcomecmd") {

            args = moreinfos.slice(0, -1).split(" ");
            // argument completion
            while (args.length <= 26) {
                args.push("c")
            }

            //-------------------------------------------------INIT
            channelidwelcome = args[1].replace('<#', '').replace('>', '');
            if (args[2] == "n") { prewelcomemention = "" } else { prewelcomemention = args[2].split("+").join(" "); }
            welcomemention = args[3];
            if (args[4] == "n") { postwelcomemention = "" } else { postwelcomemention = args[4].split("+").join(" "); }
            //-------------------------------------------------GENERAL
            showwelcomeimage = args[5];
            if (args[6] == "n") { backgroundimage = 'https://cdn.discordapp.com/attachments/820236448590331924/820415130655260755/chalinewelcome3-1.jpg' } else { backgroundimage = args[6] }
            if (args[7] == "n") { xcan = 900 } else { if (parseInt(args[7]) <= 1000) { xcan = parseInt(args[7]) } else { xcan = 1000; } }
            if (args[8] == "n") { ycan = 500 } else { if (parseInt(args[8]) <= 1000) { ycan = parseInt(args[8]) } else { ycan = 1000; } }
            //-------------------------------------------------PROFILEPICT
            if (args[9] == "c") { profilepict = "n"; } else { profilepict = args[9]; }
            if (args[10] == "n" || args[10] == "c") { diameter = Math.min(xcan, ycan) } else { diameter = parseInt(args[10]) }
            if (args[11] == "n" || args[11] == "c") { logocenterdx = Math.floor(xcan / 2) } else { logocenterdx = parseInt(args[11]) }
            if (args[12] == "n" || args[12] == "c") { logocenterdy = Math.floor(ycan / 2) } else { logocenterdy = parseInt(args[12]) }
            //-------------------------------------------------USERNAME
            if (args[13] == "c") { profileusername = "n"; } else { profileusername = args[13]; }
            if (args[14] == "n" || args[14] == "c") { userdx = Math.floor(xcan / 2) } else { userdx = parseInt(args[14]) }
            if (args[15] == "n" || args[15] == "c") { userdy = Math.floor(ycan / 2) } else { userdy = parseInt(args[15]) }
            if (args[16] == "n" || args[16] == "c") { alignfontuser = "left" } else { alignfontuser = args[16] }
            if (args[17] == "n" || args[17] == "c") { maxsizexfontuser = Math.floor(xcan / 2) } else { maxsizexfontuser = parseInt(args[17]) }
            if (args[18] == "n" || args[18] == "c") { fontuser = "Arial Black" } else { fontuser = args[18].split("+").join(" "); }
            if (args[19] == "n" || args[19] == "c") { colorfontuser = "#d2eff0" } else { colorfontuser = "#" + args[19] }
            //-------------------------------------------------MEMBERCOUNT
            if (args[20] == "c") { showmembercount = "n"; } else { showmembercount = args[20]; }
            if (args[21] == "n" || args[21] == "c") { mcountdx = Math.floor(xcan / 2) } else { mcountdx = parseInt(args[21]) }
            if (args[22] == "n" || args[22] == "c") { mcountdy = Math.floor(ycan / 2) } else { mcountdy = parseInt(args[22]) }
            if (args[23] == "n" || args[23] == "c") { alignfontmcount = "left" } else { alignfontmcount = args[23] }
            if (args[24] == "n" || args[24] == "c") { maxsizexfontmcount = Math.floor(xcan / 4) } else { maxsizexfontmcount = parseInt(args[24]) }
            if (args[25] == "n" || args[25] == "c") { fontmcount = "Outlier" } else { fontmcount = args[25].split("+").join(" "); }
            if (args[26] == "n" || args[26] == "c") { colorfontmcount = "#6f7f80" } else { colorfontmcount = "#" + args[26] }

            try {
                numbernewmember = interaction.guild.memberCount;
                //logger.all(channelidwelcome);
                if (channelidwelcome == "n") { return } //------------------------------------------------WELCOME ?
                if (showwelcomeimage == "y") {
                    //--------------------------------------------------CREATE CANVAS
                    const canvas = Canvas.createCanvas(xcan, ycan);
                    const ctx = canvas.getContext('2d');

                    const background = await Canvas.loadImage(backgroundimage);
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    //------------------------------TEXT
                    function fitTextOnCanvas(text, fontused, distx, disty, sizex) {
                        var fontsize = xcan;
                        do {
                            fontsize--;
                            ctx.font = fontsize + "px " + fontused;
                        } while (ctx.measureText(text).width > sizex)
                        ctx.fillText(text, distx, disty);
                    }

                    if (profileusername == "y") {//-----------------------------PSEUDO
                        ctx.fillStyle = colorfontuser;
                        ctx.textAlign = alignfontuser;
                        fitTextOnCanvas(`${interaction.user.tag}`, fontuser, userdx, userdy, maxsizexfontuser);
                    }

                    if (showmembercount == "y") {//--------------------------MEMBER COUNT
                        ctx.fillStyle = colorfontmcount;
                        ctx.textAlign = alignfontmcount;
                        fitTextOnCanvas(`${numbernewmember}`, fontmcount, mcountdx, mcountdy, maxsizexfontmcount);
                    }
                    if (profilepict == "y") {//-------------------------LOGO MEMBER
                        ctx.beginPath();
                        ctx.arc(logocenterdx, logocenterdy, diameter / 2, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.clip();

                        const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ format: 'jpg' }));
                        ctx.drawImage(avatar, logocenterdx - diameter / 2, logocenterdy - diameter / 2, diameter, diameter);
                    }

                    const attachment = await new Discord.MessageAttachment(canvas.toBuffer(), 'welcomimg.jpg');

                    const examplembed = new MessageEmbed()
                        .setColor(colorCommand)
                        .setTitle("Prévisualisation")
                        .setDescription(`La carte sera envoyée dans ${args[1]}`)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) })
                        .setImage("attachment://welcomimg.jpg")
                    if (welcomemention == "m") { examplembed.addFields({ name: "Voici à quoi ressemblera la carte de bienvenue", value: "\u200B" + `${prewelcomemention}${interaction.member}${postwelcomemention}` }); }
                    else if (welcomemention == "y") { examplembed.addFields({ name: "Voici à quoi ressemblera la carte de bienvenue", value: "\u200B" + `${prewelcomemention}${postwelcomemention}` }); }
                    else if (welcomemention == "n") { examplembed.addFields({ name: "Voici à quoi ressemblera la carte de bienvenue", value: "\u200B" }); }

                    //embedlist.push(examplembed)
                    return [examplembed, attachment]
                } else {
                    console.log("Ne s'affichera pas");
                    const examplembed = new MessageEmbed()
                        .setColor(colorCommand)
                        .setTitle("Prévisualisation")
                        .setDescription(`La carte sera envoyée dans ${args[1]}`)
                        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) })
                    if (welcomemention == "m") { examplembed.addFields({ name: "Voici à quoi ressemblera la carte de bienvenue", value: "\u200B" + `${prewelcomemention}${interaction.member}${postwelcomemention}` }); }
                    else if (welcomemention == "y") { examplembed.addFields({ name: "Voici à quoi ressemblera la carte de bienvenue", value: "\u200B" + `${prewelcomemention}${postwelcomemention}` }); }
                    else if (welcomemention == "n") { examplembed.addFields({ name: "Voici à quoi ressemblera la carte de bienvenue", value: "\u200B" }); }
                    //embedlist.push(examplembed)
                    return [examplembed, ""]
                }




            } catch (err) { console.log('------------------------ERROR PREVIEW WELCOMING-----------------------'); console.error(err); }
        }
    }
}