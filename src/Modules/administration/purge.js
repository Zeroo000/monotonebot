const { Command } = require('discord.js-commando');
const emoji = require('../../library/helper/emoji.js');
const { stripIndents } = require('common-tags');

module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      aliases: ['clear'],
      group: 'administration',
      memberName: 'purge',
      description: 'Bulk delete',
      examples: ['purge', 'purge 100'],
      throttling: {
        usages: 1,
        duration: 10,
      },
      args: [
        {
          key: 'total',
          prompt: 'Which user u want to show?',
          type: 'string',
          default: 1
        },
        {
          key: 'old',
          prompt: 'Delete message that older than 2 weeks?',
          type: 'string',
          default: false,
        }
      ],
      clientPermissions: ['MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  async run(msg, args) {
    let totalMsg;
    if (parseInt(args.total)) {
      totalMsg = parseInt(args.total);
    } else {
      return msg.reply('Value must be a number').then(msg => msg.delete({timeout: 6000}));
    }

    if (totalMsg > 100) totalMsg = 100;

    let messages = await msg.channel.messages.fetch({ limit: totalMsg })
    try {
      msg.channel.bulkDelete(messages).then(messages => {
        msg.channel.send(`Bulk deleted ${messages.size} messages`).then(msg => msg.delete({ timeout: 5000 }));
      }).catch(err => {
        logger.log('error', err);
        msg.channel.send(stripIndents`
        Unable to delete messages
        It's likely because you are trying to delete messages that are under 14 days old.
      `).then(msg => msg.delete({timeout: 7000}))
      });
    } catch (err) {
      logger.log('error', err);
      msg.channel.send(`Unable to delete messages`)
    }

  }

  onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data).then(parent => parent.delete({timeout: 9000}));
  }
};