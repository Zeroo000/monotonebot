const { Command, CommandoMessage } = require('discord.js-commando');
const { guildSettingsSchema } = require('../../library/Database/schema.js');

module.exports = class LogChannelCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'logchannel',
      group: 'administration',
      memberName: 'logchannel',
      aliases: ['setlogchannel'],
      description: 'Set log channel where all the log is sent',
      examples: ['logchannel #log', 'logchannel'],
      guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          key: 'channel',
          prompt: 'Which channel will be the log channel?',
          type: 'text-channel',
          default: '',
        },
      ],
    });
  }

  /** @param {CommandoMessage} msg */
  async run(msg, { channel }) {
    // fetch data
    let guildSettings;
    try {
      guildSettings = await guildSettingsSchema.findOne({ guildId: msg.guild.id });
    } catch (err) {
      logger.log('error', err.stack);
      return msg.channel.send(`Can't load the playlist`);
    }
    // show current log channel if no argument
    if (typeof channel !== 'object') {
      if (guildSettings && guildSettings.logChannelId) {
        return msg.reply(`Current log channel is <#${guildSettings.logChannelId}>`)
      } else {
        return msg.reply(`Log channel is not yet assigned, use \`${msg.guild.commandPrefix}logchannel <channelName>\` to set a new one`);
      }
    }
    if (!channel.permissionsFor(msg.guild.me.id).has('SEND_MESSAGES')) {
      return msg.reply(`I don't have a permission for sending messages to that channel`);
    }
    // set a new one
    try {
      const newGuildSettings = await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        logChannelId: channel.id,
      }, { new: true, upsert: true });
      return msg.say(`Assignment successful, new log channel is <#${newGuildSettings.logChannelId}>`)
    } catch (err) {
      logger.log('error', err.stack);
      return msg.channel.send(`Can't update new log channel.`);
    }
  }

};
