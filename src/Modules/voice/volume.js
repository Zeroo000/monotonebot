const { Command, CommandoMessage } = require('discord.js-commando');
const { guildSettingsSchema } = require('../../library/Database/schema.js');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      group: 'voice',
      aliases: ['vol'],
      memberName: 'volume',
      description: 'Set volume of current audio stream from range 1-130',
      examples: ['volume 100', 'vol 5'],
      argsType: 'multiple',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 20,
      },
      args: [
        {
          key: 'volume',
          prompt: 'How many volume do you want to play?',
          type: 'integer',
          min: 0,
          max: 130,
          default: '',
        }
      ]
    })
  }

  /** @param {CommandoMessage} msg */
  async run(msg, { volume }) {
    volume /= 100;
    if (!msg.guild.me.voice.connection) {
      return msg.say(`I'm not connected to the voice channel`);
    }
    if (!volume) {
      let vol = await guildSettingsSchema.findOne({ guildId: msg.guild.id })
      return msg.say(`Current volume level is ${vol.volume * 100}`)
    }

    try {
      await guildSettingsSchema.findOneAndUpdate({ guildId: msg.guild.id }, {
        volume: volume,
      });
      msg.guild.volume = volume;
      msg.say(`Change volume level to ${volume * 100}`)
    } catch (err) {
      logger.log('error', err);
    }
    if (msg.guild.me.voice.connection.dispatcher) {
      msg.guild.me.voice.connection.dispatcher.setVolume(volume);
    }
  }

  async onBlock(msg, reason, data) {
    super.onBlock(msg, reason, data)
      .then(blockMsg => blockMsg.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }

  onError(err, message, args, fromPattern, result) {
    super.onError(err, message, args, fromPattern, result)
      .then(msgParent => msgParent.delete({ timeout: 10000 }))
      .catch(e => e); // do nothing
  }
}
