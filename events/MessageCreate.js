const { Events } = require("discord.js");
const { getAfk, removeAfk } = require("../modules/afk");
const { getCooldown, setCooldown } = require("../modules/cooldowns");
const ms = require("ms");
const { addExp } = require("../modules/exp");

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (!message.guild) return;
    if (message.author.bot) return;

    const status = await getAfk(message.author.id);

    if (status) {
      removeAfk(message.author.id);
      message.reply("🐈 Meow~ Welcome Back!\nI removed your AFK status~");
    }

    if (message.mentions.users.size > 0) {
      message.mentions.users.forEach((user) => {
        const afkStatus = getAfk(user.id);
        if (afkStatus)
          message.reply(`🐈 Meow~ ${user.username} is AFK: ${afkStatus}`);
      });
    }

    if (!message.reference) return;

    if (message.content.toLowerCase() === "mimi emoji") {
      const fetched = await message.channel.messages.fetch(
        message.reference.messageId
      );
      if (!fetched) return;

      const customEmojiRegex = /<a?:\w+:\d+>/g;

      const found = fetched.content.match(customEmojiRegex);

      if (found) {
        found.forEach((e) => {
          const parsed = e.match(/<(a?):(\w+):(\d+)>/);
          const animated = parsed[1] === "a";
          const name = parsed[2];
          const id = parsed[3];

          return message.reply(
            `Emoji name: \`${name}\`\nEmoji ID: \`${id}\`\nhttps://cdn.discordapp.com/emojis/${id}.${
              animated ? "gif" : "png"
            }`
          );
        });
      } else {
        return message.reply("❌ No emoji found.");
      }
    }
  },
};
