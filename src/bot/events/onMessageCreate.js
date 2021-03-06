async function onMessageCreate (msg) {
  if (msg.author.bot) {
    return;
  }

  const mentionPrefix = msg.content.match(new RegExp(`^<@!*${this.client.user.id}>`));
  const prefix = mentionPrefix ? `${mentionPrefix[0]} ` : await this.db.getPrefix(msg.channel.guild ? msg.channel.guild.id : null);
  if (!msg.content.startsWith(prefix)) {
    return;
  }

  const args = msg.content.slice(prefix.length).split(' ').filter(Boolean);
  let command = args.shift();

  if (!command) {
    return;
  } else {
    command = command.toLowerCase();
  }

  if (command in this.commands) {
    command = this.commands[command];
  } else {
    const potentialCommand = Object.keys(this.commands).find(c => this.commands[c].aliases.includes(command));
    if (potentialCommand) {
      command = this.commands[potentialCommand];
    }
  }

  if (command && command instanceof Object) {
    if (command.ownerOnly && msg.author.id !== this.config.ownerID) {
      return;
    }

    command.command.call(this, msg, args)
      .then(res => {
        if (res && (typeof res === 'string' || res instanceof Object)) {
          this.sendMessage(msg.channel.id, res);
        }
      })
      .catch(e => {
        this.log(e.stack, 'error');
        msg.channel.createMessage(`Something went wrong while executing this command. The error has been logged. \nPlease join here (discord.gg/Yphr6WG) if the issue persists.\n\`\`\`${e.message}\`\`\``);
      });
  } else if (
    msg.mentions.find(u => u.id === this.client.user.id) &&
    msg.content.toLowerCase().includes('help')
  ) {
    return this.commands['help'].command.call(null, msg);
  }
}

module.exports = onMessageCreate;