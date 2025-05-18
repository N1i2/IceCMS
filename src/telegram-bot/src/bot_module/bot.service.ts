import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf, Scenes, session, Markup } from 'telegraf';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Page } from './const/pageModel';
import { backendUrl, frontendUrl, frontendForHtmlUrl } from './const/localIp';

const UrlChoose = 'Url';
const HtmlChoose = 'Html';

dotenv.config();

interface MySession extends Scenes.SceneSession {
  choice?: typeof UrlChoose | typeof HtmlChoose;
}

type MyContext = Scenes.SceneContext & { session: MySession };

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf<MyContext>;

  async onModuleInit() {
    let validNames: string[] = [];
    let pages: Page[] = [];
    const validNamesArrays: string[][] = [];

    try {
      const response = await axios.get(`${backendUrl}/page`);
      pages = response.data as Page[];

      if (pages.length === 0) {
        this.bot.command('message', (ctx) => {
          ctx.reply('Список страниц пуст. Пожалуйста, попробуйте позже.');
          return;
        });
        return;
      }

      if (Array.isArray(pages)) {
        validNames = pages.map((page) => String(page.name).toLowerCase());

        for (let i = 0; i < validNames.length; i += 3) {
          const chunk = validNames
            .slice(i, i + 3)
            .map((name) => name.charAt(0).toUpperCase() + name.slice(1));
          validNamesArrays.push(chunk);
        }
      }
    } catch (error) {
      console.error('Error with DB: ', error);
    }

    const chooseScene = new Scenes.BaseScene<MyContext>('choose');
    const askNameScene = new Scenes.BaseScene<MyContext>('askName');

    chooseScene.enter((ctx) => {
      ctx.reply(
        'Select a format: ',
        Markup.keyboard([[UrlChoose], [HtmlChoose]])
          .oneTime()
          .resize(),
      );
    });

    chooseScene.on('text', async (ctx) => {
      const text = ctx.message.text;

      if (text === UrlChoose || text === HtmlChoose) {
        ctx.session.choice = text as typeof UrlChoose | typeof HtmlChoose;
        await ctx.scene.enter('askName');
      } else {
        await ctx.reply(
          'Please choose one of the suggested formats: Url, Html or Png.',
        );

        await ctx.scene.enter('choose');
      }
    });

    askNameScene.enter((ctx) => {
      ctx.reply(
        'Enter the id of the page you are looking for or select one of the following:',
        Markup.keyboard(validNamesArrays).oneTime().resize(),
      );
    });

    askNameScene.on('text', async (ctx) => {
      const input = ctx.message.text.trim().toLowerCase();

      if (validNames.includes(input)) {
        const greeting = ctx.session.choice;
        const pageId = pages.find(
          (p) => p.name.toLowerCase() === input,
        )?.pageId;

        if (greeting === UrlChoose) {
          await ctx.reply(`${frontendUrl}/p/${pageId}`);
        } else if (greeting === HtmlChoose) {
          const fs = await import('fs');
          const path = await import('path');

          const response = await axios.get(`${frontendForHtmlUrl}/p/${pageId}`);
          const pageHtml = response.data as string;

          const htmlContent = `${pageHtml}`;
          const filePath = path.resolve(__dirname, `${input}.html`);

          fs.writeFileSync(filePath, htmlContent, 'utf-8');

          await ctx.replyWithDocument({
            source: filePath,
            filename: `${input}.html`,
          });
        } else {
          await ctx.reply(`Somthing Wrong`);
        }

        await ctx.reply(
          'Try again?',
          Markup.keyboard([['Try again']])
            .oneTime()
            .resize(),
        );

        await ctx.scene.leave();
      } else {
        await ctx.reply(
          'Invalid id, please select from the list below:',
          Markup.keyboard(validNamesArrays).oneTime().resize(),
        );
      }
    });

    const stage = new Scenes.Stage<MyContext>([chooseScene, askNameScene]);

    this.bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);

    this.bot.use(session());

    this.bot.use(stage.middleware());

    await this.bot.telegram.setMyCommands([
      { command: 'message', description: 'Start a dialog' },
      { command: 'gologin', description: 'If you want to try my app' },
    ]);

    this.bot.command('message', (ctx) => {
      ctx.scene.enter('choose');
    });

    this.bot.command('gologin', (ctx) => {
      ctx.reply(
        'Open login page in browser:',
        Markup.inlineKeyboard([
          Markup.button.url('Go to Login', `${frontendUrl}/login`),
        ]),
      );
    });

    this.bot.hears('Try again', (ctx) => {
      ctx.scene.enter('choose');
    });

    this.bot.on('text', async (ctx, next) => {
      if (!ctx.scene?.current) {
        // Waitting
      } else {
        await next();
      }
    });

    await this.bot.launch();
  }
}
