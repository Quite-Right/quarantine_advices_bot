# quarantine_advices_bot
Telegram bot made for advising people, what to do, to read, to listen, to watch or to drink on quarantine

## How to work width the bot:
Change values in keys.js file:
- TOKEN will be your telegram bot token
- uri will be your mongoDB URI
- adm will be the person to moderate the advices
## Architecture
###Adding advice
When someone trys to add an advice to the bot group the following actions will be done:
1.  Person gives an advice to the group of advices he want to expand
2.  Administrator of the bot receives the info about the advice, checks it for adequacy and decides, whether to add the advice or not
3. The advice is beeing added/rejected, if it's being added it's voice message id wil be written to the groups  .txt file

###Getting advice
When someone trys to get an advice to the bot group the following actions will be done:
1.  Person chooses the category of advice to get
2.  Bot gives person one of the advices from the database (it must be an advice, which weren't given one advice before, there is a check, so minimum for bot to work are to advices per group)
3. Person chooses, wheter to get another advice or not
