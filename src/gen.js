const fs = require('fs');
const { createReadStream } = require('node:fs');
const { createInterface } = require('node:readline');

console.log("Starting snippet generator")

const base = "../starlessumbra/starlessumbra/"
const partyChars = "amalia,illari,clydan,reene,esteri,vades,oskari"

const rooms = [];
fs.readdirSync(base + "rooms").forEach((f) => rooms.push(f));

const audio = { sfx: [], bgm: [], amb: [] }
fs.readdirSync(base + "sounds").forEach((f) => {
    const key = f.split("_")[0];
    const val = f.split("_").slice(1).join("_");
    audio[key].push(val);
});

const instances = partyChars.split(",");
instances.push("purple_guy", "o_player", "o_follower");
fs.readdirSync(base + "sprites").filter((f) => f.includes("npc")).forEach((f) => instances.push(f));

const sprites = fs.readdirSync(base + "sprites").filter((f) => !f.startsWith(".")); //.DS_Store go away!!!!

async function generateSnippets() {
    const fileStream = createReadStream('src/raw/umbrascript.code-snippets');
    const lines = [];

    const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    // Read lines to an array, swapping out our tokens
    for await (const line of rl) {
        lines.push(line.replaceAll("%PARTY_CHARACTER%", partyChars)
            .replaceAll("%MAP_NAME%", rooms.join(","))
            .replaceAll("%BGM%", audio.bgm.join(","))
            .replaceAll("%AMB%", audio.amb.join(","))
            .replaceAll("%SFX%", audio.sfx.join(","))
            .replaceAll("%INSTANCE%", instances.join(","))
            .replaceAll("%SPRITE%", sprites.join(","))
        )
    }

    // Write back the file
    fs.writeFile('snippets/umbrascript.code-snippets', lines.join("\r\n"), err => {
        if (err) {
            console.error(err);
        } else {
            console.log("All done!")
        }
    });
}

generateSnippets();