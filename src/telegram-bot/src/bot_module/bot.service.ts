import { Injectable, OnModuleInit } from '@nestjs/common';
import { Telegraf, Scenes, session, Markup } from 'telegraf';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Page } from './const/pageModel';
import { backendUrl, frontendUrl, frontendForHtmlUrl } from './const/localIp';

const UrlChoose = 'Url';
const HtmlChoose = 'Html';
const TryAgain = 'Try again';
const Cancel = 'Cancel';

dotenv.config();

interface MySession extends Scenes.SceneSession {
  choice?: typeof UrlChoose | typeof HtmlChoose;
}

type MyContext = Scenes.SceneContext & { session: MySession };

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf<MyContext>;
  private pages: Page[] = [];
  private validNames: string[] = [];
  private validNamesArrays: string[][] = [];

  constructor() {
    this.bot = new Telegraf<MyContext>(process.env.TELEGRAM_BOT_TOKEN!);
  }

  private async fetchPages(): Promise<boolean> {
    try {
      const response = await axios.get(`${backendUrl}/page`);
      this.pages = response.data as Page[];
      
      if (this.pages.length === 0) {
        return false;
      }

      this.validNames = this.pages.map((page) => String(page.name).toLowerCase());
      this.validNamesArrays = [];

      for (let i = 0; i < this.validNames.length; i += 3) {
        const chunk = this.validNames
          .slice(i, i + 3)
          .map((name) => name.charAt(0).toUpperCase() + name.slice(1));
        this.validNamesArrays.push(chunk);
      }

      return true;
    } catch (error) {
      console.error('Error fetching pages from DB:', error);
      return false;
    }
  }

  async onModuleInit() {
    // Initial fetch
    await this.fetchPages();

    const chooseScene = new Scenes.BaseScene<MyContext>('choose');
    const askNameScene = new Scenes.BaseScene<MyContext>('askName');

    chooseScene.enter(async (ctx) => {
      const hasPages = await this.fetchPages();
      
      if (!hasPages) {
        await ctx.reply('Currently there are no pages available. Please try later.');
        return ctx.scene.leave();
      }

      await ctx.reply(
        'Select a format:',
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
          'Please choose one of the suggested formats:',
          Markup.keyboard([[UrlChoose], [HtmlChoose]])
            .oneTime()
            .resize(),
        );
      }
    });

    askNameScene.enter(async (ctx) => {
      const hasPages = await this.fetchPages();
      
      if (!hasPages) {
        await ctx.reply('Currently there are no pages available. Please try later.');
        return ctx.scene.leave();
      }

      await ctx.reply(
        'Enter the name of the page you are looking for or select one from the list:',
        Markup.keyboard([...this.validNamesArrays, [Cancel]])
          .oneTime()
          .resize(),
      );
    });

    askNameScene.on('text', async (ctx) => {
      const text = ctx.message.text.trim();

      if (text === Cancel) {
        await ctx.reply('Returning to format selection...');
        return ctx.scene.enter('choose');
      }

      const input = text.toLowerCase();

      if (!this.validNames.includes(input)) {
        await ctx.reply(
          `I dont know page \"${text}\". Please select from the list below:`,
          Markup.keyboard([...this.validNamesArrays, [Cancel]])
            .oneTime()
            .resize(),
        );
        return;
      }

      // Refresh data right before processing the request
      const hasPages = await this.fetchPages();
      if (!hasPages) {
        await ctx.reply('The page is no longer available. Please start over.');
        return ctx.scene.leave();
      }

      const selectedPage = this.pages.find(p => p.name.toLowerCase() === input);
      if (!selectedPage) {
        await ctx.reply('Page not found. Please try again.');
        return ctx.scene.enter('askName');
      }

      try {
        if (ctx.session.choice === UrlChoose) {
          await ctx.reply(`${frontendUrl}/p/${selectedPage.pageId}`);
        } else if (ctx.session.choice === HtmlChoose) {
          const fs = await import('fs');
          const path = await import('path');

          const response = await axios.get(`${frontendForHtmlUrl}/p/${selectedPage.pageId}`);
          const htmlContent = response.data;

          const filePath = path.resolve(__dirname, `${input}.html`);
          fs.writeFileSync(filePath, htmlContent, 'utf-8');

          await ctx.replyWithDocument({
            source: filePath,
            filename: `${input}.html`,
          });

          // Clean up the file after sending
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error processing request:', error);
        await ctx.reply('An error occurred while processing your request. Please try again.');
      }

      await ctx.reply(
        'What would you like to do next?',
        Markup.keyboard([[TryAgain], [Cancel]])
          .oneTime()
          .resize(),
      );
    });

    const stage = new Scenes.Stage<MyContext>([chooseScene, askNameScene]);

    this.bot.use(session());
    this.bot.use(stage.middleware());

    await this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Start interaction with bot' },
      { command: 'message', description: 'Start a dialog' },
      { command: 'gologin', description: 'Open login page' },
    ]);

    this.bot.command('start', (ctx) => {
      ctx.reply('Welcome! Use /message command to start searching for pages.');
    });

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

    this.bot.hears(TryAgain, (ctx) => {
      ctx.scene.enter('choose');
    });

    this.bot.hears(Cancel, async (ctx) => {
      if (ctx.scene.current?.id === 'askName') {
        await ctx.reply('Returning to format selection...');
        ctx.scene.enter('choose');
      } else {
        await ctx.reply('Operation cancelled. Use /message if you want to start again.');
        ctx.scene.leave();
      }
    });

    this.bot.on('text', async (ctx, next) => {
      if (!ctx.scene?.current) {
        await ctx.reply('Please use /message command to start.');
      } else {
        await next();
      }
    });

    await this.bot.launch();
    console.log('Bot service started');
  }
}