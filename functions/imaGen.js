const { client } = require("../index.js");
const Canvas = require('canvas');
const logger = require("./logger.js");
const getParty = require("./game/getParty.js");
const Discord = require('discord.js');
const { Client, Intents, MessageEmbed } = require('discord.js');

module.exports = {
    // Send a rank card image
    rank: async function (interactreply, member, srvsettingsgen, userfile) {
        const { botchannels } = require("../index.js");

        srvsettings = srvsettingsgen.rankcard
        //console.log("srv ?", srvsettingsgen);
        guildwcfg = member.guild;
        guildwid = guildwcfg.id;
        if (!srvsettings) {
            //-------------------------------------------------STOP
            return;
        } else {
            //-------------------------------------------------GENERAL
            srvsettings.image = srvsettings.image;
            srvsettings.sizex = srvsettings.sizex;
            srvsettings.sizey = srvsettings.sizey;
            textfont = srvsettings.font;
            textcolor = srvsettings.textcolor;

            try {
                numbernewmember = member.guild.memberCount;
                //--------------------------------------------------CREATE CANVAS
                const canvas = Canvas.createCanvas(srvsettings.sizex, srvsettings.sizey);
                const ctx = canvas.getContext('2d');


                ctx.save()
                if (!member.guild.members.cache.get(member.user.id) || blacklist.includes(member.user.id)) {

                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#000000';
                    ctx.globalCompositeOperation = 'luminosity';
                }

                const background = await Canvas.loadImage(srvsettings.image);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                //-------------------------MEMBER PDP

                sizeimageavatar = srvsettings.pdp.size;
                ctx.save();
                if (srvsettings.pdp.shape == "circle") {
                    ctx.beginPath();
                    ctx.arc(srvsettings.pdp.x, srvsettings.pdp.y, sizeimageavatar / 2, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();

                }
                const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg', size: 512 }));
                ctx.drawImage(avatar, srvsettings.pdp.x - sizeimageavatar / 2, srvsettings.pdp.y - sizeimageavatar / 2, sizeimageavatar, sizeimageavatar);
                ctx.restore();


                if (srvsettings.imageov != "") {
                    const overlay = await Canvas.loadImage(srvsettings.imageov);
                    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
                }

                //------------------------------TEXT

                function fitTextOnCanvas(text, fontused, distx, disty, maxwidth, maxheight) {
                    var fontsize = maxheight;
                    do {
                        fontsize--;
                        ctx.font = fontsize + "px " + fontused;
                        //console.log(ctx.font, " : ", ctx.measureText(text).width, " <=> ", maxwidth);
                    } while (ctx.measureText(text).width > maxwidth)
                    ctx.fillText(text, distx, disty);
                }

                function fitStrokeTextOnCanvas(text, fontused, distx, disty, maxwidth, maxheight) {

                    var fontsize = maxheight;
                    do {
                        fontsize--;
                        ctx.font = fontsize + "px " + fontused;
                        //console.log(ctx.font, " : ", ctx.measureText(text).width, " <=> ", maxwidth);
                    } while (ctx.measureText(text).width > maxwidth)
                    ctx.fillText(text, distx, disty);
                    ctx.strokeStyle = textcolor
                    ctx.strokeText(text, distx, disty);
                }


                // Pseudo
                ctx.fillStyle = textcolor;
                ctx.textAlign = srvsettings.pseudo.align;
                fitTextOnCanvas(`${member.user.tag}`, textfont, srvsettings.pseudo.x, srvsettings.pseudo.y, srvsettings.pseudo.maxwidth, srvsettings.pseudo.maxheight);
                // Rank
                ctx.textAlign = srvsettings.rank.align;
                if (blacklist.includes(member.user.id))
                    rankclassement = "not ranked"
                else if (botchannels.chalineBotsID.includes(member.id))
                    rankclassement = "CAT"
                else
                    var rankclassement = getParty.rankinserver(member.guild.id, member.user.id, numbernewmember)
                fitTextOnCanvas(`${rankclassement}`, textfont, srvsettings.rank.x, srvsettings.rank.y, srvsettings.rank.maxwidth, srvsettings.rank.maxheight);
                // lvl
                if (userfile.level < 0)
                    ctx.fillStyle = "#ff0000";
                if (blacklist.includes(member.user.id)) userfile.level = "-";
                else if (botchannels.chalineBotsID.includes(member.id))
                    userfile.level = "∞";
                ctx.textAlign = srvsettings.lvl.align;
                fitTextOnCanvas(`${userfile.level}`, textfont, srvsettings.lvl.x, srvsettings.lvl.y, srvsettings.lvl.maxwidth, srvsettings.lvl.maxheight);
                // xp
                ctx.textAlign = srvsettings.xp.align;
                if (userfile.xp < 0)
                    ctx.fillStyle = "#ff0000";
                else
                    ctx.fillStyle = textcolor;
                if (blacklist.includes(member.user.id)) userfile.xp = "-";
                else if (botchannels.chalineBotsID.includes(member.id))
                    userfile.xp = "∞";
                fitTextOnCanvas(`${userfile.xp}`, textfont, srvsettings.xp.x, srvsettings.xp.y, srvsettings.xp.maxwidth, srvsettings.xp.maxheight);
                // point
                ctx.textAlign = srvsettings.points.align;
                if (userfile.points < 0)
                    ctx.fillStyle = "#ff0000";
                else
                    ctx.fillStyle = textcolor;
                if (blacklist.includes(member.user.id)) userfile.points = "-";
                else if (botchannels.chalineBotsID.includes(member.id))
                    userfile.points = "∞";
                fitTextOnCanvas(`${userfile.points}`, textfont, srvsettings.points.x, srvsettings.points.y, srvsettings.points.maxwidth, srvsettings.points.maxheight);
                ctx.fillStyle = textcolor;
                // role
                if (srvsettings.role.show) {
                    //console.log(member.displayHexColor);
                    ctx.fillStyle = member.displayHexColor;
                    ctx.textAlign = srvsettings.role.align;
                    fitStrokeTextOnCanvas(`${member.roles.highest.name}`, textfont, srvsettings.role.x, srvsettings.role.y, srvsettings.role.maxwidth, srvsettings.role.maxheight);
                    //console.log(`${member.user.tag}`, textfont, srvsettings.pseudo.x, srvsettings.pseudo.y, srvsettings.pseudo.maxwidth, srvsettings.pseudo.maxheight);
                }


                // Badges
                sizeImgandSpace = srvsettings.badges.maxwidth / userfile.badges.length;
                sizeimage = srvsettings.badges.imageratio * sizeImgandSpace;
                sizespace = sizeImgandSpace - sizeimage
                if (sizeimage > srvsettings.badges.maxsize) {
                    sizeimage = srvsettings.badges.maxsize;
                    sizeImgandSpace = sizeimage / srvsettings.badges.imageratio;
                    sizespace = sizeImgandSpace - sizeimage;
                }
                badgenb = 0
                specialBadges = [];
                if (blacklist.includes(member.user.id)) userfile.badges = []
                else if (botchannels.chalineBotsID.includes(member.id)) userfile.badges.push("_chat")
                //var memberinfo = member.guild.members.cache.get(user.id);

                if (member && member.premiumSinceTimestamp > 0) userfile.badges.push("booster")
                for (const badgeNbofUser in userfile.badges) {
                    var badgeId;
                    const badgename = userfile.badges[badgeNbofUser]
                    if (partyconfig.badgesList[badgename] || srvsettingsgen.badgesList[badgename]) {
                        if (badgename.startsWith("_")) {
                            //console.log(partyconfig)
                            //const badgeId = userfile.badges[badgename];
                            //badgeId = partyconfig.badgesList[badgename].emote
                            specialBadges.push(badgename)
                        }
                        else {
                            badgeId = srvsettingsgen.badgesList[badgename].emote;
                            const badgeimage = await Canvas.loadImage(`https://cdn.discordapp.com/emojis/${badgeId}.png`);
                            posx = srvsettings.badges.x + sizeImgandSpace * badgenb + (sizespace + sizeimage / 2);

                            ctx.drawImage(badgeimage, posx - sizeimage / 2, srvsettings.badges.y - sizeimage / 2, sizeimage, sizeimage);

                            badgenb++;
                        }

                        //console.log(badgeimage, posx - sizeimage / 2, srvsettings.badges.y - sizeimage / 2, sizeimage, sizeimage);

                    }
                }
                for (const specialB in specialBadges) {
                    var badgeId;
                    if (partyconfig.badgesList[specialBadges[specialB]]) {
                        badgeId = partyconfig.badgesList[specialBadges[specialB]].emote

                        const badgeimage = await Canvas.loadImage(`https://cdn.discordapp.com/emojis/${badgeId}.png`);
                        posx = srvsettings.badges.x + sizeImgandSpace * badgenb + (sizespace + sizeimage / 2);

                        ctx.drawImage(badgeimage, posx - sizeimage / 2, srvsettings.badges.y - sizeimage / 2, sizeimage, sizeimage);
                        badgenb++;
                    }
                }

                ctx.restore();
                ctx.textAlign = "center"
                ctx.fillStyle = "#ff0000";
                ctx.globalAlpha = 1;
                if (!member.guild.members.cache.get(member.user.id)) {

                    ctx.fillStyle = 'rgba(10, 0, 0, 0.6)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "#ff0000";
                    fitStrokeTextOnCanvas(`Cet utilisateur n'est plus sur le serveur`, textfont, canvas.width / 2, canvas.height - 10, canvas.width - 40, canvas.height);
                } else if (blacklist.includes(member.user.id)) {
                    ctx.fillStyle = 'rgba(25, 0, 0, 0.6)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#ff0000';
                    fitStrokeTextOnCanvas(`Cet utilisateur est banni du réseau Chaline`, textfont, canvas.width / 2, canvas.height - 10, canvas.width - 40, canvas.height);
                }


                // Create attachment

                const attachment = new Discord.MessageAttachment(canvas.toBuffer(), interactreply.guild + "_" + interactreply.user + "rank.jpg");
                interactreply.edit({ files: [attachment], embeds: [] });


            } catch (err) { logger.all('------------------------ERROR RANKING-----------------------'); console.error(err); logger.all(`----------------${guildwid}------------------`); }
        }

    },
}