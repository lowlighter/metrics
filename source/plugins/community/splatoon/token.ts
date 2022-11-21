#!/usr/bin/env -S deno run --allow-run --allow-read=profile.json --allow-write=profile.json --unstable
import { cyan, green, yellow, magenta, bgWhite, black, italic, red, white } from "https://deno.land/std@0.165.0/fmt/colors.ts";
console.log([
  "",
  yellow('THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'),
  "",
  cyan(`This script will help you to create ${italic("Nintendo API")} token that can be used to access data from ${italic("Nintendo Switch Online")} such as ${italic("Splatnet 3")}. While these tokens are read-only and cannot perform any action on your behave, their usage is not explicitely allowed by ${italic("Nintendo")}`),
  "",
].join("\n"))
const agreement = prompt("I understand the risks and I understand that I will not be able to held the script authors as responsible for any damage caused by the usage of this script\nAgree? [y/n]");
if (agreement !== "y")
  Deno.exit(1)

//Generate token
console.log([
  "",
  bgWhite(black(`0. Follow the instructions below to generate a new token`)),
  "",
].join("\n"))
const allowed = {
  files:["profile.json", "profile.json.swap", "cache", "export"],
  net:["api.imink.app", "accounts.nintendo.com", "api.accounts.nintendo.com", "api-lp1.znc.srv.nintendo.net", "api.lp1.av5ja.srv.nintendo.net"]
}
const args = [
  "run", "--no-prompt", "--cached-only", "--no-remote",
  `--allow-read="${allowed.files}"`,
  `--allow-write="${allowed.files}"`,
  `--allow-net="${allowed.net}"`,
  "s3si/index.ts",
  '--exporter=none'
]
try {
  await Deno.spawn("deno", {
    args,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    windowsRawArguments:true
  })
}
catch {}

//Extract profile.json and print instructions
try {
  const profile = JSON.parse(await Deno.readTextFile("profile.json"))
  console.log([
    "",
    green(`Succesfully authenticated to ${italic("Nintendo API")}!`),
    green(`Complete your integration with ${italic("metrics")} by performing the following steps:`),
    "",
    bgWhite(black(`1. Create a new secret ${cyan("SPLATOON_TOKEN")} in your repository and set its value to:`)),
    "",
    yellow(JSON.stringify(profile)),
    "",
    "",
    bgWhite(black(`2. Add the following to your ${cyan("workflow.yml")}:`)),
    "",
    cyan("with"),
    `  ${cyan("plugin_splatoon")}: ${magenta("yes")}`,
    `  ${cyan("plugin_splatoon_token")}: ${magenta("${{ secrets.SPLATOON_TOKEN }}")}`,
    "",
  ].join("\n"))
  await Deno.remove("profile.json")
}
catch (error) {
  console.log([
    red(`Failed to authenticate to ${italic("Nintendo API")}!`),
    red(`${error}`),
  ].join("\n"))
}