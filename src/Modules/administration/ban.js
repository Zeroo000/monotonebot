const { stripIndents, oneLine } = require('common-tags');
const { getUserMention, isUserId } = require('../../library/users/get-cache.js')
const { Command } = require('discord.js-commando')
const Discord = require('discord.js');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      group: 'administration',
      memberName: 'ban',
      description: 'Ban someone with mentioning or by id',
      examples: ['ban @someone', 'ban @someone Bad words', 'ban 71283497224353324 Your reason here'],
      guildOnly: true,
      clientPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          key: 'member',
          prompt: 'Which user to be banned?',
          type: 'member',
        },
        {
          key: 'reason',
          prompt: 'The reason why you ban him? (optional)',
          type: 'string',
          default: false,
        }
      ],
    });
  }

  async run(msg, { member, reason }) {
    // // manual method
    // let member = await isUserId(args[0], msg);
    // let isMember = args[0].match(/^<@!?\d+>$/);
    // // check if the member is exist
    // if (member) {
    //   member = await msg.guild.members.cache.get(args[0]);
    // } else if (isMember) {
    //   member = await getUserMention(args[0], msg);
    // } else {
    //   return msg.say('Invalid Id or Argument');
    // }
    // get the banned data
    const bannedName = `${member.user.username}#${member.user.discriminator} <${member.user.id}>`;
    const bannedimage = `${member.user.displayAvatarURL()}`;
    if (member) {
      member
        .ban({ reason: reason ? reason : ' ' })
        .then(() => {
          const EmbedMsg = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setAuthor(bannedName, bannedimage)
            .setTitle(`Banned Successfully`)
            .setDescription(`**Member** : ${bannedName}\n` + `**Reason** : ${reason || '-'}\n` +
              `**Time** : ${msg.createdAt.toUTCString()}`)
            .setFooter(`Banned by ${msg.author.username}#${msg.author.discriminator}`,
              `${msg.author.displayAvatarURL()}`);

          msg.channel.send({
            embed: EmbedMsg
          });
        })
        .catch(err => {
          // due to missing permissions or role hierarchy
          msg.reply('I was unable to ban the member');
          // Log the error
          logger.log('error', err);
        });
    }
    // Otherwise, if no user was mentioned
    else {
      msg.reply("You didn't mention the user to ban!");
    }
  }

  async onBlock(msg, reason, data) {
    let parent = await super.onBlock(msg, reason, data);
    parent.delete({ timeout: 9000 })
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 9000 }));
  }
};



