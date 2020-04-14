const TelegramBot = require('node-telegram-bot-api');
const keys = require('./src/keys');
const keyboards = require('./src/keyboards');
const adv_Users = require('./src/models/User');
const mongoose = require('mongoose');
const bot = new TelegramBot(keys.TOKEN, { polling: true });
const groups = require('./src/read_files/read');

let newUsers = 0;

let cinema_added = 0;
let listen_added = 0;
let read_added = 0;
let entertainment_added = 0;
let vine_added = 0;

let cinema_given = 0;
let listen_given = 0;
let read_given = 0;
let entertainment_given = 0;
let vine_given = 0;

async function sendReview() {
    bot.sendMessage(keys.adm, `Всего пользователей: ${await adv_Users.estimatedDocumentCount()}\nИз них новых пользователей: ${newUsers}\n\nСтатистика по группам (советов дано/советов получено):\n🎬 Что посмотреть - ${cinema_added}/${cinema_given}\n🎸 Что послушать - ${listen_added}/${listen_given}\n📚 Что почитать - ${read_added}/${read_given}\n🍹 Что выпить - ${vine_added}/${vine_given}\n😏 Чем заняться - ${entertainment_added}/${entertainment_given}\n`);
    newUsers = 0;

    cinema_added = 0;
    listen_added = 0;
    read_added = 0;
    entertainment_added = 0;
    vine_added = 0;

    cinema_given = 0;
    listen_given = 0;
    read_given = 0;
    entertainment_given = 0;
    vine_given = 0;
}

setInterval(() => { sendReview(); }, 86400000);


mongoose.connect(keys.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => console.log("Error: MongoDB connection failed"));

function makeCounter() {
    var currentCount = 1;

    return function () {
        return currentCount++;
    };
}

let counter = makeCounter();

class adv_Users_API {
    static async getStateById(user_id) {
        let user = await (adv_Users.findOne({ id: user_id }));
        return user.state;
    }
    static createUser(user_id) {
        adv_Users.findOne({ id: user_id }, async (err, user) => {
            if (user === null) {
                const User = new adv_Users({ 'id': user_id });
                await User.save();
                ++newUsers;
            }
            else {
                await adv_Users.updateOne({ 'id': user_id }, { state: 'start' });
            }
        });
    }
    static changeUserState(user_id, newState) {
        adv_Users.findOne({ id: user_id }, async (err, user) => {
            console.log(err);
            if (user === null) {
                const User = new adv_Users({ id: user_id, state: newState });
                await User.save();
            }
            else {
                await adv_Users.updateOne({ id: user_id }, { state: newState });
            }
        });
    }
    static async getUserOldAdvice(user_id, advice_key) {
        let user = await (adv_Users.findOne({ id: user_id }));
        return user[advice_key];
    }
    static async getUserNewAdvice(user_id, gr_number) {
        let advice_keys = ['adv1', 'adv2', 'adv3', 'adv4', 'adv5'];
        let advice_key = advice_keys[gr_number - 1];
        let old_value = await this.getUserOldAdvice(user_id, advice_key);
        switch (gr_number) {
            case 1:
                cinema_given++;
                break;
            case 2:
                listen_given++;
                break;
            case 3:
                read_given++;
                break;
            case 4:
                entertainment_given++;
                break;
            case 5:
                vine_given++;
                break;
        }
        let new_value = groups.get_advice(gr_number);
        while (new_value == old_value)
            new_value = groups.get_advice(gr_number);
        await adv_Users.updateOne({ id: user_id }, { [advice_key]: new_value });
        return (new_value);
    }
    static async createAdvice(user_id, gr_number, voice_msg_id) {
        let id_string = String(user_id) + String(counter());
        let groups_array = [
            '🎬 Что посмотреть', '🎸 Что послушать', '📚 Что почитать', '😏 Чем заняться', '🍹 Что выпить',
        ];
        switch (gr_number) {
            case 1:
                cinema_added++;
                break;
            case 2:
                listen_added++;
                break;
            case 3:
                read_added++;
                break;
            case 4:
                entertainment_added++;
                break;
            case 5:
                vine_added++;
                break;
        }
        let listener = async (query) => {
            let data = JSON.parse(query.data);
            switch (data.type) {
                case id_string + 'yes':
                    console.log(gr_number + ' ' + voice_msg_id);
                    groups.add_advice(gr_number, voice_msg_id)
                    await bot.sendMessage(keys.adm, `Совет "${voice_msg_id}" для группы "${groups_array[gr_number - 1]}" успешно добавлен`);
                    bot.off('callback_query', listener);
                    break;
                case id_string + 'no':
                    await bot.sendMessage(keys.adm, `Совет "${voice_msg_id}" для группы "${groups_array[gr_number - 1]}" отклонен`);
                    bot.off('callback_query', listener);
                    break;
            };
        };
        bot.on('callback_query', listener);
        await bot.sendMessage(keys.adm, `Добавить совет "${voice_msg_id}" для группы "${groups_array[gr_number - 1]}"?`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Добавить совет',
                            callback_data: JSON.stringify({
                                type: `${id_string}yes`,
                            })
                        },
                    ],
                    [
                        {
                            text: 'Отклонить совет',
                            callback_data: JSON.stringify({
                                type: `${id_string}no`,
                            })
                        },
                    ]
                ]
            }
        });
        await bot.sendVoice(keys.adm, voice_msg_id);
    }
}

bot.on('message', async msg => {
    let state = await adv_Users_API.getStateById(msg.chat.id);;
    switch (msg.text) {
        case '/start':
            break;
        case '📢 Дать совет':
            if (state == 'main') {
                adv_Users_API.changeUserState(msg.chat.id, '1');
                await bot.sendMessage(msg.chat.id, 'Что советовать будем? 🤔', keyboards.screen_1);
            }
            break;
        case '🧠 Получить совет':
            if (state == 'main') {
                adv_Users_API.changeUserState(msg.chat.id, '2');
                await bot.sendMessage(msg.chat.id, 'Выбери категорию 👇', keyboards.screen_2);
            }
            break;
        case '👈 В главное меню':
            if (state != 'start' && state != 'main') {
                adv_Users_API.changeUserState(msg.chat.id, 'main');
                let hello = 'Хочешь получить рекомендацию или дать свой совет коллегам по несчастью?'
                bot.sendMessage(msg.chat.id, hello, keyboards.mainScreen);
            }
            break;
        case '🚀 Поехали!':
            if (state == 'start') {
                adv_Users_API.changeUserState(msg.chat.id, 'main');
                let hello = 'Хочешь получить рекомендацию или дать свой совет коллегам по несчастью?'
                bot.sendMessage(msg.chat.id, hello, keyboards.mainScreen);
            }
        case '✋ Другая категория':
            if (state == '1_1' || state == '1_2' || state == '1_3' || state == '1_4' || state == '1_5' || state == '1_5_1' || state == '1_1_1' || state == '1_2_1' || state == '1_3_1' || state == '1_4_1') {
                // adv_Users_API.changeUserState(msg.chat.id, '1');
                // await bot.sendMessage(msg.chat.id, 'Что советовать будем? 🤔', keyboards.screen_1);
            }
            else if (state == '2_1' || state == '2_2' || state == '2_3' || state == '2_4' || state == '2_5_1') {
                adv_Users_API.changeUserState(msg.chat.id, '2');
                await bot.sendMessage(msg.chat.id, 'Выбери категорию 👇', keyboards.screen_2);
            }
            break;
        case '🧠 Хочу ещё совет':
            if (state == '2_1') {
                await bot.sendMessage(msg.chat.id, 'Твой Киносовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 1), keyboards.line_keyboard_3);
            }
            else if (state == '2_2') {
                await bot.sendMessage(msg.chat.id, 'Твой Музсовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 2), keyboards.line_keyboard_3);
            }
            else if (state == '2_3') {
                await bot.sendMessage(msg.chat.id, 'Твой Книгосовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 3), keyboards.line_keyboard_3);
            }
            else if (state == '2_4') {
                await bot.sendMessage(msg.chat.id, 'Твой Физсовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 4), keyboards.line_keyboard_3);
            }
            else if (state == '2_5_1') {
                await bot.sendMessage(msg.chat.id, 'Твой Алкосовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendMessage(msg.chat.id, 'Чрезмерное употребление алкоголя вредит вашему здоровью');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 5), keyboards.line_keyboard_3);
            }
            break;
        case '📢 Хочу дать еще совет':
            if (state == '1_1_1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_1');
                await bot.sendMessage(msg.chat.id, 'Запиши для меня аудиосообщение и расскажи в нём, что ты советуешь посмотреть и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '1_2_1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_2');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, что ты советуешь послушать и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '1_3_1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_3');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудиосообщение и расскажи в нём, что ты советуешь почитать и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '1_4_1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_4');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, чем ты советуешь заняться и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '1_5_1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_5');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, что ты советуешь выпить и почему 👇', keyboards.line_keyboard_2);
            }
            break;
        case '🎬 Что посмотреть':
            if (state == '1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_1');
                await bot.sendMessage(msg.chat.id, 'Запиши для меня аудиосообщение и расскажи в нём, что ты советуешь посмотреть и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '2') {
                adv_Users_API.changeUserState(msg.chat.id, '2_1');
                await bot.sendMessage(msg.chat.id, 'Твой Киносовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 1), keyboards.line_keyboard_3);
            }
            break;
        case '🎸 Что послушать':
            if (state == '1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_2');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, что ты советуешь послушать и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '2') {
                adv_Users_API.changeUserState(msg.chat.id, '2_2');
                await bot.sendMessage(msg.chat.id, 'Твой Музсовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 2), keyboards.line_keyboard_3);
            }
            break;
        case '📚 Что почитать':
            if (state == '1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_3');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудиосообщение и расскажи в нём, что ты советуешь почитать и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '2') {
                adv_Users_API.changeUserState(msg.chat.id, '2_3');
                await bot.sendMessage(msg.chat.id, 'Твой Книгосовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 3), keyboards.line_keyboard_3);
            }
            break;
        case '😏 Чем заняться':
            if (state == '1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_4');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, чем ты советуешь заняться и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '2') {
                adv_Users_API.changeUserState(msg.chat.id, '2_4');
                await bot.sendMessage(msg.chat.id, 'Твой Физсовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 4), keyboards.line_keyboard_3);
            }
            break;
        case '🍹 Что выпить':
            if (state == '1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_5');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, что ты советуешь выпить и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == '2') {
                adv_Users_API.changeUserState(msg.chat.id, '2_5');
                await bot.sendMessage(msg.chat.id, 'Хорошо. А тебе уже есть 18? 🥃', keyboards.eighteen_check_keyboard);
            }
            break;
        case '✔️ Конечно!':
            if (state == '2_5') {
                adv_Users_API.changeUserState(msg.chat.id, '2_5_1');
                await bot.sendMessage(msg.chat.id, 'Твой Алкосовет 👇\n\nПрослушай аудио 🎧');
                await bot.sendMessage(msg.chat.id, 'Чрезмерное употребление алкоголя вредит вашему здоровью');
                await bot.sendVoice(msg.chat.id, await adv_Users_API.getUserNewAdvice(msg.chat.id, 5), keyboards.line_keyboard_3);
            }
            break;
        case '❌ Ещё нет, дяденька':
            if (state == '2_5') {
                adv_Users_API.changeUserState(msg.chat.id, '2');
                await bot.sendMessage(msg.chat.id, 'Выбери категорию 👇', keyboards.screen_2);
            }
            break;
        case '🎤 Давай':
            if (state == 'no_voice_1') {
                adv_Users_API.changeUserState(msg.chat.id, '1_1');
                await bot.sendMessage(msg.chat.id, 'Запиши для меня аудиосообщение и расскажи в нём, что ты советуешь посмотреть и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == 'no_voice_2') {
                adv_Users_API.changeUserState(msg.chat.id, '1_2');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, что ты советуешь послушать и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == 'no_voice_3') {
                adv_Users_API.changeUserState(msg.chat.id, '1_3');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудиосообщение и расскажи в нём, что ты советуешь почитать и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == 'no_voice_4') {
                adv_Users_API.changeUserState(msg.chat.id, '1_4');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, чем ты советуешь заняться и почему 👇', keyboards.line_keyboard_2);
            }
            else if (state == 'no_voice_5') {
                adv_Users_API.changeUserState(msg.chat.id, '1_5');
                await bot.sendMessage(msg.chat.id, 'Запиши мне аудио и расскажи в нём, что ты советуешь выпить и почему 👇', keyboards.line_keyboard_2);
            }
            break;
        default:
            console.log(msg.voice);
            if (!msg.voice) {
                if (state == '1_1') {
                    adv_Users_API.changeUserState(msg.chat.id, 'no_voice_1');
                    await bot.sendMessage(msg.chat.id, 'Прости, я не получил от тебя аудио. Попробуешь ещё раз?', keyboards.no_voice);
                }
                else if (state == '1_2') {
                    adv_Users_API.changeUserState(msg.chat.id, 'no_voice_2');
                    await bot.sendMessage(msg.chat.id, 'Прости, я не получил от тебя аудио. Попробуешь ещё раз?', keyboards.no_voice);
                }
                else if (state == '1_3') {
                    adv_Users_API.changeUserState(msg.chat.id, 'no_voice_3');
                    await bot.sendMessage(msg.chat.id, 'Прости, я не получил от тебя аудио. Попробуешь ещё раз?', keyboards.no_voice);
                }
                else if (state == '1_4') {
                    adv_Users_API.changeUserState(msg.chat.id, 'no_voice_4');
                    await bot.sendMessage(msg.chat.id, 'Прости, я не получил от тебя аудио. Попробуешь ещё раз?', keyboards.no_voice);
                }
                else if (state == '1_5') {
                    adv_Users_API.changeUserState(msg.chat.id, 'no_voice_5');
                    await bot.sendMessage(msg.chat.id, 'Прости, я не получил от тебя аудио. Попробуешь ещё раз?', keyboards.no_voice);
                }
            }
            break;
    }
})

bot.onText(/\/start/, msg => {
    let hello = 'Привет, ' + msg.from.first_name + ', я бот карантинных рекомендаций! 😷\n\nСкучаешь дома на карантине? Тогда мне нужен именно ты! Здесь можно получить совет — что посмотреть, что почитать, что послушать или чем заняться в перерыве между имейлами, чатами, конф-коллами и другими очень-очень важными рабочими делами.\n\nУже посмотрел, прочитал или послушал что-то офигенное? Я с удовольствием приму ТВОЙ совет. Просто запиши мне аудиосообщение — и оно попадёт в мою базу рекомендаций.\n';
    hello += '\nЖми «Поехали» и начнём!';
    bot.sendMessage(msg.chat.id, hello, keyboards.start_keyboard_1);
    adv_Users_API.createUser(msg.chat.id);
});


bot.on('voice', async msg => {
    console.log(msg);
    let state = await adv_Users_API.getStateById(msg.chat.id);;
    if (state == '1_1') {
        adv_Users_API.changeUserState(msg.chat.id, '1_1_1');
        adv_Users_API.createAdvice(msg.chat.id, 1, msg.voice.file_id);
        await bot.sendMessage(msg.chat.id, 'Спасибо! Совет отправился в мою коллекцию, и теперь другие люди смогут получить его 🌍\n\nПовторим? ', keyboards.on_voice_keyboard);
    }
    else if (state == '1_2') {
        adv_Users_API.changeUserState(msg.chat.id, '1_2_1');
        adv_Users_API.createAdvice(msg.chat.id, 2, msg.voice.file_id);
        await bot.sendMessage(msg.chat.id, 'Спасибо! Совет отправился в мою коллекцию, и теперь другие люди смогут получить его 🌍\n\nПовторим? ', keyboards.on_voice_keyboard);
    }
    else if (state == '1_3') {
        adv_Users_API.changeUserState(msg.chat.id, '1_3_1');
        adv_Users_API.createAdvice(msg.chat.id, 3, msg.voice.file_id);
        await bot.sendMessage(msg.chat.id, 'Спасибо! Совет отправился в мою коллекцию, и теперь другие люди смогут получить его 🌍\n\nПовторим? ', keyboards.on_voice_keyboard);
    }
    else if (state == '1_4') {
        adv_Users_API.changeUserState(msg.chat.id, '1_4_1');
        adv_Users_API.createAdvice(msg.chat.id, 4, msg.voice.file_id);
        await bot.sendMessage(msg.chat.id, 'Спасибо! Совет отправился в мою коллекцию, и теперь другие люди смогут получить его 🌍\n\nПовторим? ', keyboards.on_voice_keyboard);
    }
    else if (state == '1_5') {
        adv_Users_API.changeUserState(msg.chat.id, '1_5_1');
        adv_Users_API.createAdvice(msg.chat.id, 5, msg.voice.file_id);
        await bot.sendMessage(msg.chat.id, 'Спасибо! Совет отправился в мою коллекцию, и теперь другие люди смогут получить его 🌍\n\nПовторим? ', keyboards.on_voice_keyboard);
    }
});