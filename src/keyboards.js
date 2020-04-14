module.exports = {
    mainScreen: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '🧠 Получить совет',
                        // callback_data: JSON.stringify({
                        //     type: '1',
                        // })
                    }
                ],
                [
                    {
                        text: '📢 Дать совет',
                        // callback_data: JSON.stringify({
                        //     type: '2',
                        // })
                    }
                ],
            ]
        }
    },
    screen_1: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '🎬 Что посмотреть',
                    },
                    {
                        text: '🎸 Что послушать',
                    }
                ],
                [
                    {
                        text: '📚 Что почитать',
                    },
                    {
                        text: '🍹 Что выпить',
                    }
                ],
                [
                    {
                        text: '😏 Чем заняться',
                    },
                    {
                        text: '👈 В главное меню',
                    }
                ],
            ],
            one_time_keyboard: true,
        }
    },
    screen_2: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '🎬 Что посмотреть',
                    },
                    {
                        text: '🎸 Что послушать',
                    }
                ],
                [
                    {
                        text: '📚 Что почитать',
                    },
                    {
                        text: '🍹 Что выпить',
                    }
                ],
                [
                    {
                        text: '😏 Чем заняться',
                    },
                    {
                        text: '👈 В главное меню',
                    }
                ],
            ],
            one_time_keyboard: true,
        }
    },
    line_keyboard_1: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: 'Главное меню',
                    },
                ],
            ],
            one_time_keyboard: true,
        }
    },
    line_keyboard_2: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '✋ Другая категория',
                    },
                    {
                        text: '👈 В главное меню',
                    }
                ],
            ],
            one_time_keyboard: true,
        }
    },
    line_keyboard_3: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '🧠 Хочу ещё совет',
                    },
                    {
                        text: '✋ Другая категория',
                    }
                ],
                [
                    {
                        text: '👈 В главное меню',
                    },
                ],
            ],
            one_time_keyboard: true,
        }
    },
    start_keyboard_1: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '🚀 Поехали!',
                    },
                ],
            ],
            one_time_keyboard: true,
        }
    },
    eighteen_check_keyboard: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '✔️ Конечно!',
                    },  
                ],
                [
                    {
                        text: '❌ Ещё нет, дяденька',
                    },  
                ],
            ],
            one_time_keyboard: true,
        }
    },
    no_voice: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '🎤 Давай',
                    },  
                ],
                [
                    {
                        text: '👈 В главное меню',
                    },  
                ],
            ],
            one_time_keyboard: true,
        }
    },
    on_voice_keyboard: {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: '📢 Хочу дать еще совет',
                    },  
                ],
                [
                    {
                        text: '👈 В главное меню',
                    },  
                ],
            ],
            one_time_keyboard: true,
        }
    },
}
