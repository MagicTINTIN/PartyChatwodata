__base :__
**name**:*nom de la commande*
**desc**:*description de la commande*

__steps :__

~step~ :
**title**: titre de l'embed
**message**: message affiché dans l'embed et la fenêtre d'input

**type**:
    input : recevoir un message
    
    choice : boutons de choix
    channelChoice : liste les salons du serveur
    colorChoice : liste de couleurs + par défaut
    menuchoice
    rolechoice
    ~~ inputType: SHORT || PARAGRAPH (by default) ~~ les modals de discord ça pue la merde
    timedelay :  temps pour répondre
    color: pour les boutons : PRIMARY (bleu) SECONDARY (gris) SUCCESS (vert), (DANGER)
    end : envoie le message direct
    cancel : n'eenvoie rien

    graphics
    -   prevcard v|
        prevembd x| pour afficher une prévisualisation des cartes et des embed
        clear
    
**action**: les actions sont séparées par des &
    goto:X *- va à l'étape X ou stoppe le script si `end`*
    addw:un mot *- ajoute un mot dans le content de la commande*
    ~~addv:word=eu *- crée une variable word contenant "eu", si pas d'égal précisé crée juste une variable avec résultat d'input dedans *~~
    adch: ajoute le # du salon
    adin: ajoute la phrase de l'input en mot
    adip : ajoute la phrase de l'input en mots séparés par des +
    adcolor : ajoute le code hexadecimal
    adrole : ajoute le @role
    adcardtxt découpe le message : message avec des variables à traiter (cas boost et welcome)

    del:X supprimer les X derniers élément | |

    imgcheckcard

    nothing
    
    si c'est action d'un bouton maximum 100 caractères d'actions

   

```JSON
{
    "name": "example",
    "desc": "description",
    "_comment": "commande générée",
    "steps": [
        {
            "type": "input",
            "title":"Entree",
            "message": "Entrez le nombre de",
            "action":"addw:test&goto:2",
            "inputType": "PARAGRAPH"
        },
        {
            "_comment": "this step is skipped",
            "type": "menuChoice",
            "title":"Skipped",
            "message": "fonctionnalité supportée",
            "choicesList": [
                {
                    "name": "choix1",
                    "description": "c'est le choix 1",
                    "action": "goto:3"
                }
            ]
        },
        {
            "type": "choice",
            "title":"Un choix",
            "message": "Veuillez choisir entre",
            "choices": [
                {
                    "buttoname": "Choix1",
                    "action": "addw:1&goto:end"
                },
                {
                    "buttoname": "Choix2",
                    "action": "addw:none",
                    "color":"DANGER"
                }
            ]
        },
        {
            "type": "channelChoice",
            "title":"Menu de channels",
            "message": "Choisissez un channel",
            "action": "adch"
        }
    ]
}
```
```JS
/*
        const embed = new MessageEmbed()
            .setTitle('Commande universelle - ' + cmd.name)
            .setColor(colorCommand)
            .setDescription(`Hey ${cmdmsg.user.tag}, j'ai rien foutu mais ça fonctionne`)
            .setFooter({ text: `La commande a été exécutée avec succès` });
        embedmessage.edit({ embeds: [embed], components: [] })
*/
```