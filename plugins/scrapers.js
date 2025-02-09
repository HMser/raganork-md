const googleTTS = require('google-translate-tts');
const {MODE} = require('../config');
const {getString} = require('./misc/lang');
const Lang = getString('scrapers');
let w = MODE=='public'?false:true
const {Module} = require('../main');
const {getVideo, skbuffer} = require('raganork-bot');
const ytdl = require('ytdl-core');
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();
Module({ pattern: 'tts ?(.*)', fromMe: w, desc:Lang.TTS_DESC}, async (message, match) => {
    var query = match[1] || message.reply_message.text
    if(!query) return await message.sendReply(Lang.TTS_NEED_REPLY);
    let 
        LANG = 'en',
        ttsMessage = query,
        SPEED = 1.0
    if(langMatch = query.match("\\{([a-z]{2})\\}")) {
        LANG = langMatch[1]
        ttsMessage = ttsMessage.replace(langMatch[0], "")
    } 
    if(speedMatch = query.match("\\{([0].[0-9]+)\\}")) {
        SPEED = parseFloat(speedMatch[1])
        ttsMessage = ttsMessage.replace(speedMatch[0], "")
    }
   try { var buffer = await googleTTS.synthesize({
        text: ttsMessage,
        voice: LANG
    });
} catch {return await message.sendReply(Lang.TTS_ERROR)}
    await message.client.sendMessage(message.jid,{audio: buffer,mimetype: 'audio/mp4',ptt: false},{quoted: message.data});
});
Module({pattern: 'video ?(.*)', fromMe: w, desc: Lang.VIDEO_DESC}, (async (message, match) => { 
        var s1 = !match[1] ? message.reply_message.message : match[1]
        if (!s1) return await message.sendReply(Lang.NEED_VIDEO);
        if (!s1.includes('youtu')) return await message.sendReply(Lang.NEED_VIDEO);
        const getID = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
        var qq = getID.exec(s1)
        await message.sendMessage(Lang.DOWNLOADING_VIDEO);
     try { var dl = await getVideo(qq[1]) } catch {return await message.sendMessage("*Download failed. Restart bot*"); }
var cap = dl.details.title || ""
var th = dl.details.thumbnail.url || null
try { var yt = ytdl(qq[1], {filter: format => format.container === 'mp4' && ['720p', '480p', '360p', '240p', '144p'].map(() => true)}); } catch {return await message.client.sendMessage(message.jid,{text:"*Download failed. Restart bot*"})}
        yt.pipe(fs.createWriteStream('./temp/' + qq[1] + '.mp4'));
        yt.on('end', async () => {
            await message.sendMessage(Lang.UPLOADING_VIDEO);
            await message.client.sendMessage(message.jid,{video: fs.readFileSync('./temp/' + qq[1] + '.mp4'),mimetype: "video/mp4" , caption:cap, thumbnail: await skbuffer(th)});
        });
    
}));
Module({pattern: 'detectlang$', fromMe: w, desc: Lang.DLANG_DESC}, (async (message, match) => {

    if (!message.reply_message) return await message.sendMessage(Lang.NEED_REPLY)
    const msg = message.reply_message.text
    var ldet = lngDetector.detect(msg)
    async function upperfirstLetter(letter) {
        return letter.charAt(0).toUpperCase() + letter.slice(1).toLowerCase();
    }
    var cls1 = await upperfirstLetter(ldet[0][0])
    var cls2 = ldet[0][1].toString()
    var cls3 = await upperfirstLetter(ldet[1][0])
    var cls4 = ldet[1][1].toString()
    var cls5 = await upperfirstLetter(ldet[2][0])
    var cls6 = ldet[2][1].toString()
    var cls7 = await upperfirstLetter(ldet[3][0])
    var cls8 = ldet[3][1].toString()
    const res_1 = '*' + Lang.DLANG_INPUT + '* ' + '_' + msg + '_ \n'
    const res_2 = '*' + Lang.DLANG_CLOSER + '* ' + '_' + cls1 + '_\n*' + Lang.DLANG_SIMI + '* ' + '_' + cls2 + '_ \n\n'
    const res_3 = '```[ ' + Lang.DLANG_OTHER + ' ]```\n\n'
    const res_4 = '#2 *' + Lang.DLANG_LANG + '* ' + '_' + cls3 + '_\n*' + Lang.DLANG_SIMI + '* ' + '_' + cls4 + '_ \n'
    const res_5 = '#3 *' + Lang.DLANG_LANG + '* ' + '_' + cls5 + '_\n*' + Lang.DLANG_SIMI + '* ' + '_' + cls6 + '_ \n'
    const res_6 = '#4 *' + Lang.DLANG_LANG + '* ' + '_' + cls7 + '_\n*' + Lang.DLANG_SIMI + '* ' + '_' + cls8 + '_'
    const rep_7 = res_1 + res_2 + res_3 + res_4 + res_5 + res_6
    await message.sendReply(rep_7);
}));
