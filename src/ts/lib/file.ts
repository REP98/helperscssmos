export default async function saveFile(filename: string, content: any) {
    const front = require('android').from;
    await front.send("save-file", filename, content)
}