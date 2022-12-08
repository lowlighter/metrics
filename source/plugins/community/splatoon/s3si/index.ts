// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class APIError extends Error {
    response;
    json;
    constructor({ response , json , message  }){
        super(message);
        this.response = response;
        this.json = json;
    }
}
const AGENT_NAME = "s3si.ts";
const S3SI_VERSION = "0.2.1";
const NSOAPP_VERSION = "2.4.0";
const WEB_VIEW_VERSION = "2.0.0-18810d39";
const S3SI_LINK = "https://github.com/spacemeowx2/s3si.ts";
const USERAGENT = `${AGENT_NAME}/${S3SI_VERSION} (${S3SI_LINK})`;
const DEFAULT_APP_USER_AGENT = "Mozilla/5.0 (Linux; Android 11; Pixel 5) " + "AppleWebKit/537.36 (KHTML, like Gecko) " + "Chrome/94.0.4606.61 Mobile Safari/537.36";
const SPLATNET3_ENDPOINT = "https://api.lp1.av5ja.srv.nintendo.net/api/graphql";
const BATTLE_NAMESPACE = "b3a2dbf5-2c09-4792-b78c-00b548b70aeb";
const COOP_NAMESPACE = "f1911910-605e-11ed-a622-7085c2057a9d";
const S3SI_NAMESPACE = "63941e1c-e32e-4b56-9a1d-f6fbe19ef6e1";
const SPLATNET3_STATINK_MAP = {
    RULE: {
        TURF_WAR: "nawabari",
        AREA: "area",
        LOFT: "yagura",
        GOAL: "hoko",
        CLAM: "asari",
        TRI_COLOR: "nawabari"
    },
    RESULT: {
        WIN: "win",
        LOSE: "lose",
        DEEMED_LOSE: "lose",
        EXEMPTED_LOSE: "exempted_lose",
        DRAW: "draw"
    },
    DRAGON: {
        NORMAL: undefined,
        DECUPLE: "10x",
        DRAGON: "100x",
        DOUBLE_DRAGON: "333x"
    },
    COOP_EVENT_MAP: {
        1: "rush",
        2: "goldie_seeking",
        3: "griller",
        4: "mothership",
        5: "fog",
        6: "cohock_charge",
        7: "giant_tornado",
        8: "mudmouth_eruption"
    },
    COOP_UNIFORM_MAP: {
        1: "orange",
        2: "green",
        3: "yellow",
        4: "pink",
        5: "blue",
        6: "black",
        7: "white"
    },
    COOP_SPECIAL_MAP: {
        "bd327d1b64372dedefd32adb28bea62a5b6152d93aada5d9fc4f669a1955d6d4": "nicedama",
        "463eedc60013608666b260c79ac8c352f9795c3d0cce074d3fbbdbd2c054a56d": "hopsonar",
        "fa8d49e8c850ee69f0231976208a913384e73dc0a39e6fb00806f6aa3da8a1ee": "megaphone51",
        "252059408283fbcb69ca9c18b98effd3b8653ab73b7349c42472281e5a1c38f9": "jetpack",
        "680379f8b83e5f9e033b828360827bc2f0e08c34df1abcc23de3d059fe2ac435": "kanitank",
        "0785cb4979024a83aaa2196e287e232d5d7e4ac959895a650c30ed00fedbc714": "sameride",
        "380e541b5bc5e49d77ff1a616f1343aeba01d500fee36aaddf8f09d74bd3d3bc": "tripletornado"
    },
    WATER_LEVEL_MAP: {
        0: "low",
        1: "normal",
        2: "high"
    }
};
const CONTROL_CHARS = /[\x00-\x1F\x7F]/;
const COOKIE_NAME_BLOCKED = /[()<>@,;:\\"/[\]?={}]/;
const COOKIE_OCTET_BLOCKED = /[\s",;\\]/;
const COOKIE_OCTET = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/;
const TERMINATORS = [
    "\n",
    "\r",
    "\0"
];
function isSameDomainOrSubdomain(domainA, domainB) {
    if (!domainA || !domainB) {
        return false;
    }
    let longerDomain;
    let shorterDomain;
    if (domainB.length > domainA.length) {
        longerDomain = domainB;
        shorterDomain = domainA;
    } else {
        longerDomain = domainA;
        shorterDomain = domainB;
    }
    const indexOfDomain = longerDomain.indexOf(shorterDomain);
    if (indexOfDomain === -1) {
        return false;
    } else if (indexOfDomain > 0) {
        if (longerDomain.charAt(indexOfDomain - 1) !== ".") {
            return false;
        }
    }
    return true;
}
function trimTerminator(str) {
    if (str === undefined || str === "") return str;
    for(let t = 0; t < TERMINATORS.length; t++){
        const terminatorIdx = str.indexOf(TERMINATORS[t]);
        if (terminatorIdx !== -1) {
            str = str.substr(0, terminatorIdx);
        }
    }
    return str;
}
function isValidName(name) {
    if (!name) {
        return false;
    }
    if (CONTROL_CHARS.test(name) || COOKIE_NAME_BLOCKED.test(name)) {
        return false;
    }
    return true;
}
function trimWrappingDoubleQuotes(val) {
    if (val.length >= 2 && val.at(0) === '"' && val.at(-1) === '"') {
        return val.slice(1, -1);
    }
    return val;
}
function isValidValue(val) {
    if (val === "") {
        return true;
    }
    if (!val) {
        return false;
    }
    if (CONTROL_CHARS.test(val) || COOKIE_OCTET_BLOCKED.test(val) || !COOKIE_OCTET.test(val)) {
        return false;
    }
    return true;
}
function parseURL(input) {
    let copyUrl;
    if (input instanceof Request) {
        copyUrl = input.url;
    } else if (input instanceof URL) {
        copyUrl = input.toString();
    } else {
        copyUrl = input;
    }
    copyUrl = copyUrl.replace(/^\./, "");
    if (!copyUrl.includes("://")) {
        copyUrl = "http://" + copyUrl;
    }
    return new URL(copyUrl);
}
class Cookie {
    name;
    value;
    path;
    domain;
    expires;
    maxAge;
    secure;
    httpOnly;
    sameSite;
    creationDate = Date.now();
    creationIndex;
    static cookiesCreated = 0;
    constructor(options){
        if (options) {
            this.name = options.name;
            this.value = options.value;
            this.path = options.path;
            this.domain = options.domain;
            this.expires = options.expires;
            this.maxAge = options.maxAge;
            this.secure = options.secure;
            this.httpOnly = options.httpOnly;
            this.sameSite = options.sameSite;
            if (options.creationDate) {
                this.creationDate = options.creationDate;
            }
        }
        Object.defineProperty(this, "creationIndex", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: ++Cookie.cookiesCreated
        });
    }
    static from(cookieStr) {
        const options = {
            name: undefined,
            value: undefined,
            path: undefined,
            domain: undefined,
            expires: undefined,
            maxAge: undefined,
            secure: undefined,
            httpOnly: undefined,
            sameSite: undefined,
            creationDate: Date.now()
        };
        const unparsed = cookieStr.slice().trim();
        const attrAndValueList = unparsed.split(";");
        const keyValuePairString = trimTerminator(attrAndValueList.shift() || "").trim();
        const keyValuePairEqualsIndex = keyValuePairString.indexOf("=");
        if (keyValuePairEqualsIndex < 0) {
            return new Cookie();
        }
        const name = keyValuePairString.slice(0, keyValuePairEqualsIndex);
        const value = trimWrappingDoubleQuotes(keyValuePairString.slice(keyValuePairEqualsIndex + 1));
        if (!(isValidName(name) && isValidValue(value))) {
            return new Cookie();
        }
        options.name = name;
        options.value = value;
        while(attrAndValueList.length){
            const cookieAV = attrAndValueList.shift()?.trim();
            if (!cookieAV) {
                continue;
            }
            const avSeperatorIndex = cookieAV.indexOf("=");
            let attrKey, attrValue;
            if (avSeperatorIndex === -1) {
                attrKey = cookieAV;
                attrValue = "";
            } else {
                attrKey = cookieAV.substr(0, avSeperatorIndex);
                attrValue = cookieAV.substr(avSeperatorIndex + 1);
            }
            attrKey = attrKey.trim().toLowerCase();
            if (attrValue) {
                attrValue = attrValue.trim();
            }
            switch(attrKey){
                case "expires":
                    if (attrValue) {
                        const expires = new Date(attrValue).getTime();
                        if (expires && !isNaN(expires)) {
                            options.expires = expires;
                        }
                    }
                    break;
                case "max-age":
                    if (attrValue) {
                        const maxAge = parseInt(attrValue, 10);
                        if (!isNaN(maxAge)) {
                            options.maxAge = maxAge;
                        }
                    }
                    break;
                case "domain":
                    if (attrValue) {
                        const domain = parseURL(attrValue).host;
                        if (domain) {
                            options.domain = domain;
                        }
                    }
                    break;
                case "path":
                    if (attrValue) {
                        options.path = attrValue.startsWith("/") ? attrValue : "/" + attrValue;
                    }
                    break;
                case "secure":
                    options.secure = true;
                    break;
                case "httponly":
                    options.httpOnly = true;
                    break;
                case "samesite":
                    {
                        const lowerCasedSameSite = attrValue.toLowerCase();
                        switch(lowerCasedSameSite){
                            case "strict":
                                options.sameSite = "Strict";
                                break;
                            case "lax":
                                options.sameSite = "Lax";
                                break;
                            case "none":
                                options.sameSite = "None";
                                break;
                            default:
                                break;
                        }
                        break;
                    }
                default:
                    break;
            }
        }
        return new Cookie(options);
    }
    isValid() {
        return isValidName(this.name) && isValidValue(this.value);
    }
    canSendTo(url) {
        const urlObj = parseURL(url);
        if (this.secure && urlObj.protocol !== "https:") {
            return false;
        }
        if (this.sameSite === "None" && !this.secure) return false;
        if (this.path) {
            if (this.path === urlObj.pathname) {
                return true;
            }
            if (urlObj.pathname.startsWith(this.path) && this.path[this.path.length - 1] === "/") {
                return true;
            }
            if (this.path.length < urlObj.pathname.length && urlObj.pathname.startsWith(this.path) && urlObj.pathname[this.path.length] === "/") {
                return true;
            }
            return false;
        }
        if (this.domain) {
            const host = urlObj.host;
            if (isSameDomainOrSubdomain(this.domain, host)) {
                return true;
            }
        }
        return false;
    }
    getCookieString() {
        return `${this.name || ""}=${this.value || ""}`;
    }
    setDomain(url) {
        this.domain = parseURL(url).host;
    }
    setPath(url) {
        const uriPath = parseURL(url).pathname;
        if (!uriPath || uriPath[0] !== "/") {
            this.path = "/";
        } else {
            const rightmostSlashIdx = uriPath.lastIndexOf("/");
            if (rightmostSlashIdx <= 0) {
                this.path = "/";
            } else {
                this.path = uriPath.slice(0, rightmostSlashIdx);
            }
        }
    }
    setExpires(exp) {
        if (exp instanceof Date) {
            this.expires = exp.getTime();
        } else if (typeof exp === "number" && exp >= 0) {
            this.expires = exp;
        }
    }
    isExpired() {
        if (this.maxAge !== undefined) {
            if (Date.now() - this.creationDate >= this.maxAge * 1000) {
                return true;
            }
        }
        if (this.expires !== undefined) {
            if (Date.now() - this.expires >= 0) {
                return true;
            }
        }
        return false;
    }
    toString() {
        let str = this.getCookieString();
        if (this.expires && this.expires !== Infinity) {
            str += "; Expires=" + new Date(this.expires).toUTCString();
        }
        if (this.maxAge && this.maxAge !== Infinity) {
            str += `; Max-Age=${this.maxAge}`;
        }
        if (this.domain) {
            str += `; Domain=${this.domain}`;
        }
        if (this.path) {
            str += `; Path=${this.path}`;
        }
        if (this.secure) {
            str += "; Secure";
        }
        if (this.httpOnly) {
            str += "; HttpOnly";
        }
        if (this.sameSite) {
            str += `; SameSite=${this.sameSite}`;
        }
        return str;
    }
    clone() {
        return new Cookie(JSON.parse(JSON.stringify(this)));
    }
}
const strictMatchProps = [
    "value",
    "secure",
    "httpOnly",
    "maxAge",
    "expires",
    "sameSite"
];
function cookieMatches(options, comparedWith, strictMatch = false) {
    if (options.path !== undefined && !comparedWith.path?.startsWith(options.path)) {
        return false;
    }
    if (options.domain) {
        if (!isSameDomainOrSubdomain(options.domain, comparedWith.domain)) {
            return false;
        }
    }
    if (options.name !== undefined && options.name !== comparedWith.name) {
        return false;
    }
    if (strictMatch && strictMatchProps.some((propKey)=>options[propKey] !== undefined && options[propKey] !== comparedWith[propKey])) {
        return false;
    }
    return true;
}
function cookieCompare(a, b) {
    let cmp = 0;
    const aPathLen = a.path?.length || 0;
    const bPathLen = b.path?.length || 0;
    cmp = bPathLen - aPathLen;
    if (cmp !== 0) {
        return cmp;
    }
    const aTime = a.creationDate || 2147483647000;
    const bTime = b.creationDate || 2147483647000;
    cmp = aTime - bTime;
    if (cmp !== 0) {
        return cmp;
    }
    cmp = a.creationIndex - b.creationIndex;
    return cmp;
}
class CookieJar {
    cookies = Array();
    constructor(cookies){
        this.replaceCookies(cookies);
    }
    setCookie(cookie, url) {
        let cookieObj;
        if (typeof cookie === "string") {
            cookieObj = Cookie.from(cookie);
        } else {
            cookieObj = cookie;
        }
        if (url) {
            if (!cookieObj.domain) {
                cookieObj.setDomain(url);
            }
            if (!cookieObj.path) {
                cookieObj.setPath(url);
            }
        }
        if (!cookieObj.isValid()) {
            return;
        }
        const foundCookie = this.getCookie(cookieObj);
        if (foundCookie) {
            const indexOfCookie = this.cookies.indexOf(foundCookie);
            if (!cookieObj.isExpired()) {
                this.cookies.splice(indexOfCookie, 1, cookieObj);
            } else {
                this.cookies.splice(indexOfCookie, 1);
            }
        } else if (!cookieObj.isExpired()) {
            this.cookies.push(cookieObj);
        }
        this.cookies.sort(cookieCompare);
    }
    getCookie(options) {
        const strictMatch = typeof options.isValid !== "function";
        for (const [index, cookie] of this.cookies.entries()){
            if (cookieMatches(options, cookie, strictMatch)) {
                if (!cookie.isExpired()) {
                    return cookie;
                } else {
                    this.cookies.splice(index, 1);
                    return undefined;
                }
            }
        }
    }
    getCookies(options) {
        if (options) {
            const matchedCookies = [];
            const removeCookies = [];
            for (const cookie of this.cookies){
                if (cookieMatches(options, cookie)) {
                    if (!cookie.isExpired()) {
                        matchedCookies.push(cookie);
                    } else {
                        removeCookies.push(cookie);
                    }
                }
            }
            if (removeCookies.length) {
                this.cookies = this.cookies.filter((cookie)=>!removeCookies.includes(cookie));
            }
            return matchedCookies;
        } else {
            return this.cookies;
        }
    }
    getCookieString(url) {
        const searchCookie = new Cookie();
        searchCookie.setDomain(url);
        const cookiesToSend = this.getCookies(searchCookie).filter((cookie)=>{
            return cookie.canSendTo(parseURL(url));
        }).map((c)=>c.getCookieString()).join("; ");
        return cookiesToSend;
    }
    toJSON() {
        return this.cookies;
    }
    removeCookie(options) {
        for (const [index, cookie] of this.cookies.entries()){
            if (cookieMatches(options, cookie)) {
                return this.cookies.splice(index, 1)[0];
            }
        }
    }
    removeCookies(options) {
        if (options) {
            const deletedCookies = [];
            this.cookies = this.cookies.filter((cookie)=>{
                if (cookieMatches(options, cookie)) {
                    deletedCookies.push(cookie);
                    return false;
                }
                return true;
            });
            return deletedCookies.length ? deletedCookies : undefined;
        } else {
            this.cookies = [];
        }
    }
    replaceCookies(cookies) {
        if (cookies?.length) {
            if (typeof cookies[0].isValid === "function") {
                this.cookies = cookies;
            } else {
                this.cookies = [];
                for (const option of cookies){
                    this.cookies.push(new Cookie(option));
                }
            }
        } else {
            this.cookies = [];
        }
    }
}
function wrapFetch(options) {
    const { cookieJar =new CookieJar() , fetch =globalThis.fetch  } = options || {};
    async function wrappedFetch(input, init) {
        if (!input) {
            return await fetch(input);
        }
        const cookieString = cookieJar.getCookieString(input);
        let interceptedInit;
        if (init) {
            interceptedInit = init;
        } else if (input instanceof Request) {
            interceptedInit = input;
        } else {
            interceptedInit = {};
        }
        if (!(interceptedInit.headers instanceof Headers)) {
            interceptedInit.headers = new Headers(interceptedInit.headers || {});
        }
        interceptedInit.headers.set("cookie", cookieString);
        const response = await fetch(input, interceptedInit);
        response.headers.forEach((value, key)=>{
            if (key.toLowerCase() === "set-cookie") {
                cookieJar.setCookie(value, input);
            }
        });
        return response;
    }
    return wrappedFetch;
}
const base64abc = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "/"
];
function encode(data) {
    const uint8 = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data);
    let result = "", i;
    const l = uint8.length;
    for(i = 2; i < l; i += 3){
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2 | uint8[i] >> 6];
        result += base64abc[uint8[i] & 0x3f];
    }
    if (i === l + 1) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4];
        result += "==";
    }
    if (i === l) {
        result += base64abc[uint8[i - 2] >> 2];
        result += base64abc[(uint8[i - 2] & 0x03) << 4 | uint8[i - 1] >> 4];
        result += base64abc[(uint8[i - 1] & 0x0f) << 2];
        result += "=";
    }
    return result;
}
function decode(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
const mod = {
    encode: encode,
    decode: decode
};
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const { hasOwn  } = Object;
function get(obj, key) {
    if (hasOwn(obj, key)) {
        return obj[key];
    }
}
function getForce(obj, key) {
    const v = get(obj, key);
    assert(v != null);
    return v;
}
function isNumber(x) {
    if (typeof x === "number") return true;
    if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
function hasKey(obj, keys) {
    let o = obj;
    keys.slice(0, -1).forEach((key)=>{
        o = get(o, key) ?? {};
    });
    const key = keys[keys.length - 1];
    return hasOwn(o, key);
}
function parse(args, { "--": doubleDash = false , alias ={} , boolean: __boolean = false , default: defaults = {} , stopEarly =false , string =[] , collect =[] , negatable =[] , unknown =(i)=>i  } = {}) {
    const flags = {
        bools: {},
        strings: {},
        unknownFn: unknown,
        allBools: false,
        collect: {},
        negatable: {}
    };
    if (__boolean !== undefined) {
        if (typeof __boolean === "boolean") {
            flags.allBools = !!__boolean;
        } else {
            const booleanArgs = typeof __boolean === "string" ? [
                __boolean
            ] : __boolean;
            for (const key of booleanArgs.filter(Boolean)){
                flags.bools[key] = true;
            }
        }
    }
    const aliases = {};
    if (alias !== undefined) {
        for(const key1 in alias){
            const val = getForce(alias, key1);
            if (typeof val === "string") {
                aliases[key1] = [
                    val
                ];
            } else {
                aliases[key1] = val;
            }
            for (const alias1 of getForce(aliases, key1)){
                aliases[alias1] = [
                    key1
                ].concat(aliases[key1].filter((y)=>alias1 !== y));
            }
        }
    }
    if (string !== undefined) {
        const stringArgs = typeof string === "string" ? [
            string
        ] : string;
        for (const key2 of stringArgs.filter(Boolean)){
            flags.strings[key2] = true;
            const alias2 = get(aliases, key2);
            if (alias2) {
                for (const al of alias2){
                    flags.strings[al] = true;
                }
            }
        }
    }
    if (collect !== undefined) {
        const collectArgs = typeof collect === "string" ? [
            collect
        ] : collect;
        for (const key3 of collectArgs.filter(Boolean)){
            flags.collect[key3] = true;
            const alias3 = get(aliases, key3);
            if (alias3) {
                for (const al1 of alias3){
                    flags.collect[al1] = true;
                }
            }
        }
    }
    if (negatable !== undefined) {
        const negatableArgs = typeof negatable === "string" ? [
            negatable
        ] : negatable;
        for (const key4 of negatableArgs.filter(Boolean)){
            flags.negatable[key4] = true;
            const alias4 = get(aliases, key4);
            if (alias4) {
                for (const al2 of alias4){
                    flags.negatable[al2] = true;
                }
            }
        }
    }
    const argv = {
        _: []
    };
    function argDefined(key, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || get(flags.bools, key) || !!get(flags.strings, key) || !!get(aliases, key);
    }
    function setKey(obj, name, value, collect = true) {
        let o = obj;
        const keys = name.split(".");
        keys.slice(0, -1).forEach(function(key) {
            if (get(o, key) === undefined) {
                o[key] = {};
            }
            o = get(o, key);
        });
        const key = keys[keys.length - 1];
        const collectable = collect && !!get(flags.collect, name);
        if (!collectable) {
            o[key] = value;
        } else if (get(o, key) === undefined) {
            o[key] = [
                value
            ];
        } else if (Array.isArray(get(o, key))) {
            o[key].push(value);
        } else {
            o[key] = [
                get(o, key),
                value
            ];
        }
    }
    function setArg(key, val, arg = undefined, collect) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg, key, val) === false) return;
        }
        const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
        setKey(argv, key, value, collect);
        const alias = get(aliases, key);
        if (alias) {
            for (const x of alias){
                setKey(argv, x, value, collect);
            }
        }
    }
    function aliasIsBoolean(key) {
        return getForce(aliases, key).some((x)=>typeof get(flags.bools, x) === "boolean");
    }
    let notFlags = [];
    if (args.includes("--")) {
        notFlags = args.slice(args.indexOf("--") + 1);
        args = args.slice(0, args.indexOf("--"));
    }
    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        if (/^--.+=/.test(arg)) {
            const m = arg.match(/^--([^=]+)=(.*)$/s);
            assert(m != null);
            const [, key5, value] = m;
            if (flags.bools[key5]) {
                const booleanValue = value !== "false";
                setArg(key5, booleanValue, arg);
            } else {
                setArg(key5, value, arg);
            }
        } else if (/^--no-.+/.test(arg) && get(flags.negatable, arg.replace(/^--no-/, ""))) {
            const m1 = arg.match(/^--no-(.+)/);
            assert(m1 != null);
            setArg(m1[1], false, arg, false);
        } else if (/^--.+/.test(arg)) {
            const m2 = arg.match(/^--(.+)/);
            assert(m2 != null);
            const [, key6] = m2;
            const next = args[i + 1];
            if (next !== undefined && !/^-/.test(next) && !get(flags.bools, key6) && !flags.allBools && (get(aliases, key6) ? !aliasIsBoolean(key6) : true)) {
                setArg(key6, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key6, next === "true", arg);
                i++;
            } else {
                setArg(key6, get(flags.strings, key6) ? "" : true, arg);
            }
        } else if (/^-[^-]+/.test(arg)) {
            const letters = arg.slice(1, -1).split("");
            let broken = false;
            for(let j = 0; j < letters.length; j++){
                const next1 = arg.slice(j + 2);
                if (next1 === "-") {
                    setArg(letters[j], next1, arg);
                    continue;
                }
                if (/[A-Za-z]/.test(letters[j]) && /=/.test(next1)) {
                    setArg(letters[j], next1.split(/=(.+)/)[1], arg);
                    broken = true;
                    break;
                }
                if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next1)) {
                    setArg(letters[j], next1, arg);
                    broken = true;
                    break;
                }
                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                } else {
                    setArg(letters[j], get(flags.strings, letters[j]) ? "" : true, arg);
                }
            }
            const [key7] = arg.slice(-1);
            if (!broken && key7 !== "-") {
                if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) && !get(flags.bools, key7) && (get(aliases, key7) ? !aliasIsBoolean(key7) : true)) {
                    setArg(key7, args[i + 1], arg);
                    i++;
                } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                    setArg(key7, args[i + 1] === "true", arg);
                    i++;
                } else {
                    setArg(key7, get(flags.strings, key7) ? "" : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings["_"] ?? !isNumber(arg) ? arg : Number(arg));
            }
            if (stopEarly) {
                argv._.push(...args.slice(i + 1));
                break;
            }
        }
    }
    for (const [key8, value1] of Object.entries(defaults)){
        if (!hasKey(argv, key8.split("."))) {
            setKey(argv, key8, value1);
            if (aliases[key8]) {
                for (const x of aliases[key8]){
                    setKey(argv, x, value1);
                }
            }
        }
    }
    for (const key9 of Object.keys(flags.bools)){
        if (!hasKey(argv, key9.split("."))) {
            const value2 = get(flags.collect, key9) ? [] : false;
            setKey(argv, key9, value2, false);
        }
    }
    for (const key10 of Object.keys(flags.strings)){
        if (!hasKey(argv, key10.split(".")) && get(flags.collect, key10)) {
            setKey(argv, key10, [], false);
        }
    }
    if (doubleDash) {
        argv["--"] = [];
        for (const key11 of notFlags){
            argv["--"].push(key11);
        }
    } else {
        for (const key12 of notFlags){
            argv._.push(key12);
        }
    }
    return argv;
}
const mod1 = {
    parse: parse
};
class BytesList {
    #len = 0;
    #chunks = [];
    constructor(){}
    size() {
        return this.#len;
    }
    add(value, start = 0, end = value.byteLength) {
        if (value.byteLength === 0 || end - start === 0) {
            return;
        }
        checkRange(start, end, value.byteLength);
        this.#chunks.push({
            value,
            end,
            start,
            offset: this.#len
        });
        this.#len += end - start;
    }
    shift(n) {
        if (n === 0) {
            return;
        }
        if (this.#len <= n) {
            this.#chunks = [];
            this.#len = 0;
            return;
        }
        const idx = this.getChunkIndex(n);
        this.#chunks.splice(0, idx);
        const [chunk] = this.#chunks;
        if (chunk) {
            const diff = n - chunk.offset;
            chunk.start += diff;
        }
        let offset = 0;
        for (const chunk1 of this.#chunks){
            chunk1.offset = offset;
            offset += chunk1.end - chunk1.start;
        }
        this.#len = offset;
    }
    getChunkIndex(pos) {
        let max = this.#chunks.length;
        let min = 0;
        while(true){
            const i = min + Math.floor((max - min) / 2);
            if (i < 0 || this.#chunks.length <= i) {
                return -1;
            }
            const { offset , start , end  } = this.#chunks[i];
            const len = end - start;
            if (offset <= pos && pos < offset + len) {
                return i;
            } else if (offset + len <= pos) {
                min = i + 1;
            } else {
                max = i - 1;
            }
        }
    }
    get(i) {
        if (i < 0 || this.#len <= i) {
            throw new Error("out of range");
        }
        const idx = this.getChunkIndex(i);
        const { value , offset , start  } = this.#chunks[idx];
        return value[start + i - offset];
    }
    *iterator(start = 0) {
        const startIdx = this.getChunkIndex(start);
        if (startIdx < 0) return;
        const first = this.#chunks[startIdx];
        let firstOffset = start - first.offset;
        for(let i = startIdx; i < this.#chunks.length; i++){
            const chunk = this.#chunks[i];
            for(let j = chunk.start + firstOffset; j < chunk.end; j++){
                yield chunk.value[j];
            }
            firstOffset = 0;
        }
    }
    slice(start, end = this.#len) {
        if (end === start) {
            return new Uint8Array();
        }
        checkRange(start, end, this.#len);
        const result = new Uint8Array(end - start);
        const startIdx = this.getChunkIndex(start);
        const endIdx = this.getChunkIndex(end - 1);
        let written = 0;
        for(let i = startIdx; i < endIdx; i++){
            const chunk = this.#chunks[i];
            const len = chunk.end - chunk.start;
            result.set(chunk.value.subarray(chunk.start, chunk.end), written);
            written += len;
        }
        const last = this.#chunks[endIdx];
        const rest = end - start - written;
        result.set(last.value.subarray(last.start, last.start + rest), written);
        return result;
    }
    concat() {
        const result = new Uint8Array(this.#len);
        let sum = 0;
        for (const { value , start , end  } of this.#chunks){
            result.set(value.subarray(start, end), sum);
            sum += end - start;
        }
        return result;
    }
}
function checkRange(start, end, len) {
    if (start < 0 || len < start || end < 0 || len < end || end < start) {
        throw new Error("invalid range");
    }
}
function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b1 of buf){
        output.set(b1, index);
        index += b1.length;
    }
    return output;
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
const MIN_READ = 32 * 1024;
const MAX_SIZE = 2 ** 32 - 2;
class Buffer {
    #buf;
    #off = 0;
    constructor(ab){
        this.#buf = ab === undefined ? new Uint8Array(0) : new Uint8Array(ab);
    }
    bytes(options = {
        copy: true
    }) {
        if (options.copy === false) return this.#buf.subarray(this.#off);
        return this.#buf.slice(this.#off);
    }
    empty() {
        return this.#buf.byteLength <= this.#off;
    }
    get length() {
        return this.#buf.byteLength - this.#off;
    }
    get capacity() {
        return this.#buf.buffer.byteLength;
    }
    truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }
    reset() {
        this.#reslice(0);
        this.#off = 0;
    }
    #tryGrowByReslice(n) {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    }
    #reslice(len) {
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    }
    readSync(p) {
        if (this.empty()) {
            this.reset();
            if (p.byteLength === 0) {
                return 0;
            }
            return null;
        }
        const nread = copy(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }
    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }
    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copy(p, this.#buf, m);
    }
    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }
    #grow(n1) {
        const m = this.length;
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        const i = this.#tryGrowByReslice(n1);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n1 <= Math.floor(c / 2) - m) {
            copy(this.#buf.subarray(this.#off), this.#buf);
        } else if (c + n1 > MAX_SIZE) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            const buf = new Uint8Array(Math.min(2 * c + n1, MAX_SIZE));
            copy(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        this.#off = 0;
        this.#reslice(Math.min(m + n1, MAX_SIZE));
        return m;
    }
    grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }
    async readFrom(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = await r.read(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
    readFromSync(r) {
        let n = 0;
        const tmp = new Uint8Array(MIN_READ);
        while(true){
            const shouldGrow = this.capacity - this.length < MIN_READ;
            const buf = shouldGrow ? tmp : new Uint8Array(this.#buf.buffer, this.length);
            const nread = r.readSync(buf);
            if (nread === null) {
                return n;
            }
            if (shouldGrow) this.writeSync(buf.subarray(0, nread));
            else this.#reslice(this.length + nread);
            n += nread;
        }
    }
}
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    name;
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
        this.name = "BufferFullError";
    }
    partial;
}
class PartialReadError extends Error {
    name = "PartialReadError";
    partial;
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    #buf;
    #rd;
    #r = 0;
    #w = 0;
    #eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE;
        }
        this.#reset(new Uint8Array(size), rd);
    }
    size() {
        return this.#buf.byteLength;
    }
    buffered() {
        return this.#w - this.#r;
    }
    #fill = async ()=>{
        if (this.#r > 0) {
            this.#buf.copyWithin(0, this.#r, this.#w);
            this.#w -= this.#r;
            this.#r = 0;
        }
        if (this.#w >= this.#buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.#rd.read(this.#buf.subarray(this.#w));
            if (rr === null) {
                this.#eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.#w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    };
    reset(r) {
        this.#reset(this.#buf, r);
    }
    #reset = (buf, rd)=>{
        this.#buf = buf;
        this.#rd = rd;
        this.#eof = false;
    };
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.#r === this.#w) {
            if (p.byteLength >= this.#buf.byteLength) {
                const rr1 = await this.#rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.#r = 0;
            this.#w = 0;
            rr = await this.#rd.read(this.#buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.#w += rr;
        }
        const copied = copy(this.#buf.subarray(this.#r, this.#w), p, 0);
        this.#r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = p.subarray(0, bytesRead);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = p.subarray(0, bytesRead);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.#r === this.#w){
            if (this.#eof) return null;
            await this.#fill();
        }
        const c = this.#buf[this.#r];
        this.#r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line = null;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let partial;
            if (err instanceof PartialReadError) {
                partial = err.partial;
                assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            }
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            partial = err.partial;
            if (!this.#eof && partial && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
                assert(this.#r > 0, "bufio: tried to rewind past start of buffer");
                this.#r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            if (partial) {
                return {
                    line: partial,
                    more: !this.#eof
                };
            }
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.#buf.subarray(this.#r + s, this.#w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.#buf.subarray(this.#r, this.#r + i + 1);
                this.#r += i + 1;
                break;
            }
            if (this.#eof) {
                if (this.#r === this.#w) {
                    return null;
                }
                slice = this.#buf.subarray(this.#r, this.#w);
                this.#r = this.#w;
                break;
            }
            if (this.buffered() >= this.#buf.byteLength) {
                this.#r = this.#w;
                const oldbuf = this.#buf;
                const newbuf = this.#buf.slice(0);
                this.#buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.#w - this.#r;
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = slice;
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = slice;
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.#w - this.#r;
        while(avail < n && avail < this.#buf.byteLength && !this.#eof){
            try {
                await this.#fill();
            } catch (err) {
                if (err instanceof PartialReadError) {
                    err.partial = this.#buf.subarray(this.#r, this.#w);
                } else if (err instanceof Error) {
                    const e = new PartialReadError();
                    e.partial = this.#buf.subarray(this.#r, this.#w);
                    e.stack = err.stack;
                    e.message = err.message;
                    e.cause = err.cause;
                    throw err;
                }
                throw err;
            }
            avail = this.#w - this.#r;
        }
        if (avail === 0 && this.#eof) {
            return null;
        } else if (avail < n && this.#eof) {
            return this.#buf.subarray(this.#r, this.#r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.#buf.subarray(this.#r, this.#w));
        }
        return this.#buf.subarray(this.#r, this.#r + n);
    }
}
class AbstractBufBase {
    buf;
    usedBufferBytes = 0;
    err = null;
    constructor(buf){
        this.buf = buf;
    }
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += await this.#writer.write(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.#writer.write(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    #writer;
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer, size = 4096){
        super(new Uint8Array(size <= 0 ? 4096 : size));
        this.#writer = writer;
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.#writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            const p = this.buf.subarray(0, this.usedBufferBytes);
            let nwritten = 0;
            while(nwritten < p.length){
                nwritten += this.#writer.writeSync(p.subarray(nwritten));
            }
        } catch (e) {
            if (e instanceof Error) {
                this.err = e;
            }
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.#writer.writeSync(data);
                } catch (e) {
                    if (e instanceof Error) {
                        this.err = e;
                    }
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
function createLPS(pat) {
    const lps = new Uint8Array(pat.length);
    lps[0] = 0;
    let prefixEnd = 0;
    let i = 1;
    while(i < lps.length){
        if (pat[i] == pat[prefixEnd]) {
            prefixEnd++;
            lps[i] = prefixEnd;
            i++;
        } else if (prefixEnd === 0) {
            lps[i] = 0;
            i++;
        } else {
            prefixEnd = lps[prefixEnd - 1];
        }
    }
    return lps;
}
async function* readDelim(reader, delim) {
    const delimLen = delim.length;
    const delimLPS = createLPS(delim);
    const chunks = new BytesList();
    const bufSize = Math.max(1024, delimLen + 1);
    let inspectIndex = 0;
    let matchIndex = 0;
    while(true){
        const inspectArr = new Uint8Array(bufSize);
        const result = await reader.read(inspectArr);
        if (result === null) {
            yield chunks.concat();
            return;
        } else if (result < 0) {
            return;
        }
        chunks.add(inspectArr, 0, result);
        let localIndex = 0;
        while(inspectIndex < chunks.size()){
            if (inspectArr[localIndex] === delim[matchIndex]) {
                inspectIndex++;
                localIndex++;
                matchIndex++;
                if (matchIndex === delimLen) {
                    const matchEnd = inspectIndex - delimLen;
                    const readyBytes = chunks.slice(0, matchEnd);
                    yield readyBytes;
                    chunks.shift(inspectIndex);
                    inspectIndex = 0;
                    matchIndex = 0;
                }
            } else {
                if (matchIndex === 0) {
                    inspectIndex++;
                    localIndex++;
                } else {
                    matchIndex = delimLPS[matchIndex - 1];
                }
            }
        }
    }
}
async function* readStringDelim(reader, delim, decoderOpts) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
    for await (const chunk of readDelim(reader, encoder.encode(delim))){
        yield decoder.decode(chunk);
    }
}
async function* readLines(reader, decoderOpts) {
    const bufReader = new BufReader(reader);
    let chunks = [];
    const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
    while(true){
        const res = await bufReader.readLine();
        if (!res) {
            if (chunks.length > 0) {
                yield decoder.decode(concat(...chunks));
            }
            break;
        }
        chunks.push(res.line);
        if (!res.more) {
            yield decoder.decode(concat(...chunks));
            chunks = [];
        }
    }
}
class StringReader extends Buffer {
    constructor(s){
        super(new TextEncoder().encode(s).buffer);
    }
}
class MultiReader {
    #readers;
    #currentIndex = 0;
    constructor(readers){
        this.#readers = [
            ...readers
        ];
    }
    async read(p) {
        const r = this.#readers[this.#currentIndex];
        if (!r) return null;
        const result = await r.read(p);
        if (result === null) {
            this.#currentIndex++;
            return 0;
        }
        return result;
    }
}
class LimitedReader {
    constructor(reader, limit){
        this.reader = reader;
        this.limit = limit;
    }
    async read(p) {
        if (this.limit <= 0) {
            return null;
        }
        if (p.length > this.limit) {
            p = p.subarray(0, this.limit);
        }
        const n = await this.reader.read(p);
        if (n == null) {
            return null;
        }
        this.limit -= n;
        return n;
    }
    reader;
    limit;
}
const DEFAULT_BUFFER_SIZE = 32 * 1024;
async function copyN(r, dest, size) {
    let bytesRead = 0;
    let buf = new Uint8Array(DEFAULT_BUFFER_SIZE);
    while(bytesRead < size){
        if (size - bytesRead < DEFAULT_BUFFER_SIZE) {
            buf = new Uint8Array(size - bytesRead);
        }
        const result = await r.read(buf);
        const nread = result ?? 0;
        bytesRead += nread;
        if (nread > 0) {
            let n = 0;
            while(n < nread){
                n += await dest.write(buf.slice(n, nread));
            }
            assert(n === nread, "could not write");
        }
        if (result === null) {
            break;
        }
    }
    return bytesRead;
}
async function readShort(buf) {
    const high = await buf.readByte();
    if (high === null) return null;
    const low = await buf.readByte();
    if (low === null) throw new Deno.errors.UnexpectedEof();
    return high << 8 | low;
}
async function readInt(buf) {
    const high = await readShort(buf);
    if (high === null) return null;
    const low = await readShort(buf);
    if (low === null) throw new Deno.errors.UnexpectedEof();
    return high << 16 | low;
}
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
async function readLong(buf) {
    const high = await readInt(buf);
    if (high === null) return null;
    const low = await readInt(buf);
    if (low === null) throw new Deno.errors.UnexpectedEof();
    const big = BigInt(high) << 32n | BigInt(low);
    if (big > MAX_SAFE_INTEGER) {
        throw new RangeError("Long value too big to be represented as a JavaScript number.");
    }
    return Number(big);
}
function sliceLongToBytes(d, dest = Array.from({
    length: 8
})) {
    let big = BigInt(d);
    for(let i = 0; i < 8; i++){
        dest[7 - i] = Number(big & 0xffn);
        big >>= 8n;
    }
    return dest;
}
const decoder = new TextDecoder();
class StringWriter {
    #chunks;
    #byteLength;
    #cache;
    constructor(base = ""){
        this.base = base;
        this.#chunks = [];
        this.#byteLength = 0;
        const c = new TextEncoder().encode(base);
        this.#chunks.push(c);
        this.#byteLength += c.byteLength;
    }
    write(p) {
        return Promise.resolve(this.writeSync(p));
    }
    writeSync(p) {
        this.#chunks.push(new Uint8Array(p));
        this.#byteLength += p.byteLength;
        this.#cache = undefined;
        return p.byteLength;
    }
    toString() {
        if (this.#cache) {
            return this.#cache;
        }
        const buf = new Uint8Array(this.#byteLength);
        let offs = 0;
        for (const chunk of this.#chunks){
            buf.set(chunk, offs);
            offs += chunk.byteLength;
        }
        this.#cache = decoder.decode(buf);
        return this.#cache;
    }
    base;
}
const mod2 = {
    copyN: copyN,
    readInt: readInt,
    readLong: readLong,
    readShort: readShort,
    sliceLongToBytes: sliceLongToBytes,
    Buffer,
    BufferFullError,
    PartialReadError,
    BufReader,
    BufWriter,
    BufWriterSync,
    readDelim,
    readStringDelim,
    readLines,
    StringReader,
    MultiReader,
    LimitedReader,
    StringWriter
};
function bytesToUuid(bytes) {
    const bits = [
        ...bytes
    ].map((bit)=>{
        const s = bit.toString(16);
        return bit < 0x10 ? "0" + s : s;
    });
    return [
        ...bits.slice(0, 4),
        "-",
        ...bits.slice(4, 6),
        "-",
        ...bits.slice(6, 8),
        "-",
        ...bits.slice(8, 10),
        "-",
        ...bits.slice(10, 16)
    ].join("");
}
function uuidToBytes(uuid) {
    const bytes = [];
    uuid.replace(/[a-fA-F0-9]{2}/g, (hex)=>{
        bytes.push(parseInt(hex, 16));
        return "";
    });
    return bytes;
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validate(id) {
    return UUID_RE.test(id);
}
let _nodeId;
let _clockseq;
let _lastMSecs = 0;
let _lastNSecs = 0;
function generate(options, buf, offset) {
    let i = buf && offset || 0;
    const b = buf ?? [];
    options ??= {};
    let { node =_nodeId , clockseq =_clockseq  } = options;
    if (node === undefined || clockseq === undefined) {
        const seedBytes = options.random ?? options.rng ?? crypto.getRandomValues(new Uint8Array(16));
        if (node === undefined) {
            node = _nodeId = [
                seedBytes[0] | 0x01,
                seedBytes[1],
                seedBytes[2],
                seedBytes[3],
                seedBytes[4],
                seedBytes[5]
            ];
        }
        if (clockseq === undefined) {
            clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
        }
    }
    let { msecs =new Date().getTime() , nsecs =_lastNSecs + 1  } = options;
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
    if (dt < 0 && options.clockseq === undefined) {
        clockseq = clockseq + 1 & 0x3fff;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
        nsecs = 0;
    }
    if (nsecs > 10000) {
        throw new Error("Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;
    const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;
    b[i++] = tmh >>> 24 & 0xf | 0x10;
    b[i++] = tmh >>> 16 & 0xff;
    b[i++] = clockseq >>> 8 | 0x80;
    b[i++] = clockseq & 0xff;
    for(let n = 0; n < 6; ++n){
        b[i + n] = node[n];
    }
    return buf ?? bytesToUuid(b);
}
const mod3 = {
    validate: validate,
    generate: generate
};
const UUID_RE1 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validate1(id) {
    return UUID_RE1.test(id);
}
const mod4 = {
    validate: validate1
};
const UUID_RE2 = /^[0-9a-f]{8}-[0-9a-f]{4}-[5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validate2(id) {
    return UUID_RE2.test(id);
}
async function generate1(namespace, data) {
    const space = uuidToBytes(namespace);
    assert(space.length === 16, "namespace must be a valid UUID");
    const toHash = concat(new Uint8Array(space), data);
    const buffer = await crypto.subtle.digest("sha-1", toHash);
    const bytes = new Uint8Array(buffer);
    bytes[6] = bytes[6] & 0x0f | 0x50;
    bytes[8] = bytes[8] & 0x3f | 0x80;
    return bytesToUuid(bytes);
}
const mod5 = {
    validate: validate2,
    generate: generate1
};
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
function isNil(id) {
    return id === NIL_UUID;
}
function validate3(uuid) {
    return /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i.test(uuid);
}
function version(uuid) {
    if (!validate3(uuid)) {
        throw new TypeError("Invalid UUID");
    }
    return parseInt(uuid[14], 16);
}
const mod6 = {
    v1: mod3,
    v4: mod4,
    v5: mod5,
    NIL_UUID: NIL_UUID,
    isNil: isNil,
    validate: validate3,
    version: version
};
function utf8Count(str) {
    const strLength = str.length;
    let byteLength = 0;
    let pos = 0;
    while(pos < strLength){
        let value = str.charCodeAt(pos++);
        if ((value & 0xffffff80) === 0) {
            byteLength++;
            continue;
        } else if ((value & 0xfffff800) === 0) {
            byteLength += 2;
        } else {
            if (value >= 0xd800 && value <= 0xdbff) {
                if (pos < strLength) {
                    const extra = str.charCodeAt(pos);
                    if ((extra & 0xfc00) === 0xdc00) {
                        ++pos;
                        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                    }
                }
            }
            if ((value & 0xffff0000) === 0) {
                byteLength += 3;
            } else {
                byteLength += 4;
            }
        }
    }
    return byteLength;
}
function utf8EncodeJs(str, output, outputOffset) {
    const strLength = str.length;
    let offset = outputOffset;
    let pos = 0;
    while(pos < strLength){
        let value = str.charCodeAt(pos++);
        if ((value & 0xffffff80) === 0) {
            output[offset++] = value;
            continue;
        } else if ((value & 0xfffff800) === 0) {
            output[offset++] = value >> 6 & 0x1f | 0xc0;
        } else {
            if (value >= 0xd800 && value <= 0xdbff) {
                if (pos < strLength) {
                    const extra = str.charCodeAt(pos);
                    if ((extra & 0xfc00) === 0xdc00) {
                        ++pos;
                        value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
                    }
                }
            }
            if ((value & 0xffff0000) === 0) {
                output[offset++] = value >> 12 & 0x0f | 0xe0;
                output[offset++] = value >> 6 & 0x3f | 0x80;
            } else {
                output[offset++] = value >> 18 & 0x07 | 0xf0;
                output[offset++] = value >> 12 & 0x3f | 0x80;
                output[offset++] = value >> 6 & 0x3f | 0x80;
            }
        }
        output[offset++] = value & 0x3f | 0x80;
    }
}
const sharedTextEncoder = new TextEncoder();
function utf8EncodeTEencodeInto(str, output, outputOffset) {
    sharedTextEncoder.encodeInto(str, output.subarray(outputOffset));
}
const utf8EncodeTE = utf8EncodeTEencodeInto;
function utf8DecodeJs(bytes, inputOffset, byteLength) {
    let offset = inputOffset;
    const end = offset + byteLength;
    const units = [];
    let result = "";
    while(offset < end){
        const byte1 = bytes[offset++];
        if ((byte1 & 0x80) === 0) {
            units.push(byte1);
        } else if ((byte1 & 0xe0) === 0xc0) {
            const byte2 = bytes[offset++] & 0x3f;
            units.push((byte1 & 0x1f) << 6 | byte2);
        } else if ((byte1 & 0xf0) === 0xe0) {
            const byte21 = bytes[offset++] & 0x3f;
            const byte3 = bytes[offset++] & 0x3f;
            units.push((byte1 & 0x1f) << 12 | byte21 << 6 | byte3);
        } else if ((byte1 & 0xf8) === 0xf0) {
            const byte22 = bytes[offset++] & 0x3f;
            const byte31 = bytes[offset++] & 0x3f;
            const byte4 = bytes[offset++] & 0x3f;
            let unit = (byte1 & 0x07) << 0x12 | byte22 << 0x0c | byte31 << 0x06 | byte4;
            if (unit > 0xffff) {
                unit -= 0x10000;
                units.push(unit >>> 10 & 0x3ff | 0xd800);
                unit = 0xdc00 | unit & 0x3ff;
            }
            units.push(unit);
        } else {
            units.push(byte1);
        }
        if (units.length >= 0x1_000) {
            result += String.fromCharCode(...units);
            units.length = 0;
        }
    }
    if (units.length > 0) {
        result += String.fromCharCode(...units);
    }
    return result;
}
const sharedTextDecoder = new TextDecoder();
function utf8DecodeTD(bytes, inputOffset, byteLength) {
    const stringBytes = bytes.subarray(inputOffset, inputOffset + byteLength);
    return sharedTextDecoder.decode(stringBytes);
}
class ExtData {
    constructor(type, data){
        this.type = type;
        this.data = data;
    }
    type;
    data;
}
function setUint64(view, offset, value) {
    const high = value / 0x1_0000_0000;
    const low = value;
    view.setUint32(offset, high);
    view.setUint32(offset + 4, low);
}
function setInt64(view, offset, value) {
    const high = Math.floor(value / 0x1_0000_0000);
    const low = value;
    view.setUint32(offset, high);
    view.setUint32(offset + 4, low);
}
function getInt64(view, offset) {
    const high = view.getInt32(offset);
    const low = view.getUint32(offset + 4);
    return high * 0x1_0000_0000 + low;
}
function getUint64(view, offset) {
    const high = view.getUint32(offset);
    const low = view.getUint32(offset + 4);
    return high * 0x1_0000_0000 + low;
}
const EXT_TIMESTAMP = -1;
const TIMESTAMP32_MAX_SEC = 0x100000000 - 1;
const TIMESTAMP64_MAX_SEC = 0x400000000 - 1;
function encodeTimeSpecToTimestamp({ sec , nsec  }) {
    if (sec >= 0 && nsec >= 0 && sec <= TIMESTAMP64_MAX_SEC) {
        if (nsec === 0 && sec <= TIMESTAMP32_MAX_SEC) {
            const rv = new Uint8Array(4);
            const view = new DataView(rv.buffer);
            view.setUint32(0, sec);
            return rv;
        } else {
            const secHigh = sec / 0x100000000;
            const secLow = sec & 0xffffffff;
            const rv1 = new Uint8Array(8);
            const view1 = new DataView(rv1.buffer);
            view1.setUint32(0, nsec << 2 | secHigh & 0x3);
            view1.setUint32(4, secLow);
            return rv1;
        }
    } else {
        const rv2 = new Uint8Array(12);
        const view2 = new DataView(rv2.buffer);
        view2.setUint32(0, nsec);
        setInt64(view2, 4, sec);
        return rv2;
    }
}
function encodeDateToTimeSpec(date) {
    const msec = date.getTime();
    const sec = Math.floor(msec / 1e3);
    const nsec = (msec - sec * 1e3) * 1e6;
    const nsecInSec = Math.floor(nsec / 1e9);
    return {
        sec: sec + nsecInSec,
        nsec: nsec - nsecInSec * 1e9
    };
}
function encodeTimestampExtension(object) {
    if (object instanceof Date) {
        const timeSpec = encodeDateToTimeSpec(object);
        return encodeTimeSpecToTimestamp(timeSpec);
    } else {
        return null;
    }
}
function decodeTimestampToTimeSpec(data) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    switch(data.byteLength){
        case 4:
            {
                const sec = view.getUint32(0);
                return {
                    sec,
                    nsec: 0
                };
            }
        case 8:
            {
                const nsec30AndSecHigh2 = view.getUint32(0);
                const secLow32 = view.getUint32(4);
                const sec1 = (nsec30AndSecHigh2 & 0x3) * 0x100000000 + secLow32;
                const nsec1 = nsec30AndSecHigh2 >>> 2;
                return {
                    sec: sec1,
                    nsec: nsec1
                };
            }
        case 12:
            {
                const sec2 = getInt64(view, 4);
                const nsec2 = view.getUint32(0);
                return {
                    sec: sec2,
                    nsec: nsec2
                };
            }
        default:
            throw new Error(`Unrecognized data size for timestamp: ${data.length}`);
    }
}
function decodeTimestampExtension(data) {
    const timeSpec = decodeTimestampToTimeSpec(data);
    return new Date(timeSpec.sec * 1e3 + timeSpec.nsec / 1e6);
}
const timestampExtension = {
    type: EXT_TIMESTAMP,
    encode: encodeTimestampExtension,
    decode: decodeTimestampExtension
};
class ExtensionCodec {
    static defaultCodec = new ExtensionCodec();
    __brand;
    builtInEncoders = [];
    builtInDecoders = [];
    encoders = [];
    decoders = [];
    constructor(){
        this.register(timestampExtension);
    }
    register({ type , encode , decode  }) {
        if (type >= 0) {
            this.encoders[type] = encode;
            this.decoders[type] = decode;
        } else {
            const index = 1 + type;
            this.builtInEncoders[index] = encode;
            this.builtInDecoders[index] = decode;
        }
    }
    tryToEncode(object, context) {
        for(let i = 0; i < this.builtInEncoders.length; i++){
            const encoder = this.builtInEncoders[i];
            if (encoder != null) {
                const data = encoder(object, context);
                if (data != null) {
                    const type = -1 - i;
                    return new ExtData(type, data);
                }
            }
        }
        for(let i1 = 0; i1 < this.encoders.length; i1++){
            const encoder1 = this.encoders[i1];
            if (encoder1 != null) {
                const data1 = encoder1(object, context);
                if (data1 != null) {
                    const type1 = i1;
                    return new ExtData(type1, data1);
                }
            }
        }
        if (object instanceof ExtData) {
            return object;
        }
        return null;
    }
    decode(data, type, context) {
        const decoder = type < 0 ? this.builtInDecoders[-1 - type] : this.decoders[type];
        if (decoder) {
            return decoder(data, type, context);
        } else {
            return new ExtData(type, data);
        }
    }
}
function ensureUint8Array(buffer) {
    if (buffer instanceof Uint8Array) {
        return buffer;
    } else if (ArrayBuffer.isView(buffer)) {
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    } else if (buffer instanceof ArrayBuffer) {
        return new Uint8Array(buffer);
    } else {
        return Uint8Array.from(buffer);
    }
}
function createDataView(buffer) {
    if (buffer instanceof ArrayBuffer) {
        return new DataView(buffer);
    }
    const bufferView = ensureUint8Array(buffer);
    return new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
}
class Encoder {
    pos;
    view;
    bytes;
    constructor(extensionCodec = ExtensionCodec.defaultCodec, context = undefined, maxDepth = 100, initialBufferSize = 2048, sortKeys = false, forceFloat32 = false, ignoreUndefined = false){
        this.extensionCodec = extensionCodec;
        this.context = context;
        this.maxDepth = maxDepth;
        this.initialBufferSize = initialBufferSize;
        this.sortKeys = sortKeys;
        this.forceFloat32 = forceFloat32;
        this.ignoreUndefined = ignoreUndefined;
        this.pos = 0;
        this.view = new DataView(new ArrayBuffer(this.initialBufferSize));
        this.bytes = new Uint8Array(this.view.buffer);
    }
    getUint8Array() {
        return this.bytes.subarray(0, this.pos);
    }
    reinitializeState() {
        this.pos = 0;
    }
    encode(object) {
        this.reinitializeState();
        this.doEncode(object, 1);
        return this.getUint8Array();
    }
    doEncode(object, depth) {
        if (depth > this.maxDepth) {
            throw new Error(`Too deep objects in depth ${depth}`);
        }
        if (object == null) {
            this.encodeNil();
        } else if (typeof object === "boolean") {
            this.encodeBoolean(object);
        } else if (typeof object === "number") {
            this.encodeNumber(object);
        } else if (typeof object === "string") {
            this.encodeString(object);
        } else {
            this.encodeObject(object, depth);
        }
    }
    ensureBufferSizeToWrite(sizeToWrite) {
        const requiredSize = this.pos + sizeToWrite;
        if (this.view.byteLength < requiredSize) {
            this.resizeBuffer(requiredSize * 2);
        }
    }
    resizeBuffer(newSize) {
        const newBuffer = new ArrayBuffer(newSize);
        const newBytes = new Uint8Array(newBuffer);
        const newView = new DataView(newBuffer);
        newBytes.set(this.bytes);
        this.view = newView;
        this.bytes = newBytes;
    }
    encodeNil() {
        this.writeU8(0xc0);
    }
    encodeBoolean(object) {
        if (object === false) {
            this.writeU8(0xc2);
        } else {
            this.writeU8(0xc3);
        }
    }
    encodeNumber(object) {
        if (Number.isSafeInteger(object)) {
            if (object >= 0) {
                if (object < 0x80) {
                    this.writeU8(object);
                } else if (object < 0x100) {
                    this.writeU8(0xcc);
                    this.writeU8(object);
                } else if (object < 0x10000) {
                    this.writeU8(0xcd);
                    this.writeU16(object);
                } else if (object < 0x100000000) {
                    this.writeU8(0xce);
                    this.writeU32(object);
                } else {
                    this.writeU8(0xcf);
                    this.writeU64(object);
                }
            } else {
                if (object >= -0x20) {
                    this.writeU8(0xe0 | object + 0x20);
                } else if (object >= -0x80) {
                    this.writeU8(0xd0);
                    this.writeI8(object);
                } else if (object >= -0x8000) {
                    this.writeU8(0xd1);
                    this.writeI16(object);
                } else if (object >= -0x80000000) {
                    this.writeU8(0xd2);
                    this.writeI32(object);
                } else {
                    this.writeU8(0xd3);
                    this.writeI64(object);
                }
            }
        } else {
            if (this.forceFloat32) {
                this.writeU8(0xca);
                this.writeF32(object);
            } else {
                this.writeU8(0xcb);
                this.writeF64(object);
            }
        }
    }
    writeStringHeader(byteLength) {
        if (byteLength < 32) {
            this.writeU8(0xa0 + byteLength);
        } else if (byteLength < 0x100) {
            this.writeU8(0xd9);
            this.writeU8(byteLength);
        } else if (byteLength < 0x10000) {
            this.writeU8(0xda);
            this.writeU16(byteLength);
        } else if (byteLength < 0x100000000) {
            this.writeU8(0xdb);
            this.writeU32(byteLength);
        } else {
            throw new Error(`Too long string: ${byteLength} bytes in UTF-8`);
        }
    }
    encodeString(object) {
        const maxHeaderSize = 1 + 4;
        const strLength = object.length;
        if (strLength > 200) {
            const byteLength = utf8Count(object);
            this.ensureBufferSizeToWrite(maxHeaderSize + byteLength);
            this.writeStringHeader(byteLength);
            utf8EncodeTE(object, this.bytes, this.pos);
            this.pos += byteLength;
        } else {
            const byteLength1 = utf8Count(object);
            this.ensureBufferSizeToWrite(maxHeaderSize + byteLength1);
            this.writeStringHeader(byteLength1);
            utf8EncodeJs(object, this.bytes, this.pos);
            this.pos += byteLength1;
        }
    }
    encodeObject(object, depth) {
        const ext = this.extensionCodec.tryToEncode(object, this.context);
        if (ext != null) {
            this.encodeExtension(ext);
        } else if (Array.isArray(object)) {
            this.encodeArray(object, depth);
        } else if (ArrayBuffer.isView(object)) {
            this.encodeBinary(object);
        } else if (typeof object === "object") {
            this.encodeMap(object, depth);
        } else {
            throw new Error(`Unrecognized object: ${Object.prototype.toString.apply(object)}`);
        }
    }
    encodeBinary(object) {
        const size = object.byteLength;
        if (size < 0x100) {
            this.writeU8(0xc4);
            this.writeU8(size);
        } else if (size < 0x10000) {
            this.writeU8(0xc5);
            this.writeU16(size);
        } else if (size < 0x100000000) {
            this.writeU8(0xc6);
            this.writeU32(size);
        } else {
            throw new Error(`Too large binary: ${size}`);
        }
        const bytes = ensureUint8Array(object);
        this.writeU8a(bytes);
    }
    encodeArray(object, depth) {
        const size = object.length;
        if (size < 16) {
            this.writeU8(0x90 + size);
        } else if (size < 0x10000) {
            this.writeU8(0xdc);
            this.writeU16(size);
        } else if (size < 0x100000000) {
            this.writeU8(0xdd);
            this.writeU32(size);
        } else {
            throw new Error(`Too large array: ${size}`);
        }
        for (const item of object){
            this.doEncode(item, depth + 1);
        }
    }
    countWithoutUndefined(object, keys) {
        let count = 0;
        for (const key of keys){
            if (object[key] !== undefined) {
                count++;
            }
        }
        return count;
    }
    encodeMap(object, depth) {
        const keys = Object.keys(object);
        if (this.sortKeys) {
            keys.sort();
        }
        const size = this.ignoreUndefined ? this.countWithoutUndefined(object, keys) : keys.length;
        if (size < 16) {
            this.writeU8(0x80 + size);
        } else if (size < 0x10000) {
            this.writeU8(0xde);
            this.writeU16(size);
        } else if (size < 0x100000000) {
            this.writeU8(0xdf);
            this.writeU32(size);
        } else {
            throw new Error(`Too large map object: ${size}`);
        }
        for (const key of keys){
            const value = object[key];
            if (!(this.ignoreUndefined && value === undefined)) {
                this.encodeString(key);
                this.doEncode(value, depth + 1);
            }
        }
    }
    encodeExtension(ext) {
        const size = ext.data.length;
        if (size === 1) {
            this.writeU8(0xd4);
        } else if (size === 2) {
            this.writeU8(0xd5);
        } else if (size === 4) {
            this.writeU8(0xd6);
        } else if (size === 8) {
            this.writeU8(0xd7);
        } else if (size === 16) {
            this.writeU8(0xd8);
        } else if (size < 0x100) {
            this.writeU8(0xc7);
            this.writeU8(size);
        } else if (size < 0x10000) {
            this.writeU8(0xc8);
            this.writeU16(size);
        } else if (size < 0x100000000) {
            this.writeU8(0xc9);
            this.writeU32(size);
        } else {
            throw new Error(`Too large extension object: ${size}`);
        }
        this.writeI8(ext.type);
        this.writeU8a(ext.data);
    }
    writeU8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setUint8(this.pos, value);
        this.pos++;
    }
    writeU8a(values) {
        const size = values.length;
        this.ensureBufferSizeToWrite(size);
        this.bytes.set(values, this.pos);
        this.pos += size;
    }
    writeI8(value) {
        this.ensureBufferSizeToWrite(1);
        this.view.setInt8(this.pos, value);
        this.pos++;
    }
    writeU16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setUint16(this.pos, value);
        this.pos += 2;
    }
    writeI16(value) {
        this.ensureBufferSizeToWrite(2);
        this.view.setInt16(this.pos, value);
        this.pos += 2;
    }
    writeU32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setUint32(this.pos, value);
        this.pos += 4;
    }
    writeI32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setInt32(this.pos, value);
        this.pos += 4;
    }
    writeF32(value) {
        this.ensureBufferSizeToWrite(4);
        this.view.setFloat32(this.pos, value);
        this.pos += 4;
    }
    writeF64(value) {
        this.ensureBufferSizeToWrite(8);
        this.view.setFloat64(this.pos, value);
        this.pos += 8;
    }
    writeU64(value) {
        this.ensureBufferSizeToWrite(8);
        setUint64(this.view, this.pos, value);
        this.pos += 8;
    }
    writeI64(value) {
        this.ensureBufferSizeToWrite(8);
        setInt64(this.view, this.pos, value);
        this.pos += 8;
    }
    extensionCodec;
    context;
    maxDepth;
    initialBufferSize;
    sortKeys;
    forceFloat32;
    ignoreUndefined;
}
const defaultEncodeOptions = {};
function encode1(value, options = defaultEncodeOptions) {
    const encoder = new Encoder(options.extensionCodec, options.context, options.maxDepth, options.initialBufferSize, options.sortKeys, options.forceFloat32, options.ignoreUndefined);
    return encoder.encode(value);
}
function prettyByte(__byte) {
    return `${__byte < 0 ? "-" : ""}0x${Math.abs(__byte).toString(16).padStart(2, "0")}`;
}
class CachedKeyDecoder {
    hit;
    miss;
    caches;
    constructor(maxKeyLength = 16, maxLengthPerKey = 16){
        this.maxKeyLength = maxKeyLength;
        this.maxLengthPerKey = maxLengthPerKey;
        this.hit = 0;
        this.miss = 0;
        this.caches = [];
        for(let i = 0; i < this.maxKeyLength; i++){
            this.caches.push([]);
        }
    }
    canBeCached(byteLength) {
        return byteLength > 0 && byteLength <= this.maxKeyLength;
    }
    get(bytes, inputOffset, byteLength) {
        const records = this.caches[byteLength - 1];
        const recordsLength = records.length;
        FIND_CHUNK: for(let i = 0; i < recordsLength; i++){
            const record = records[i];
            const recordBytes = record.bytes;
            for(let j = 0; j < byteLength; j++){
                if (recordBytes[j] !== bytes[inputOffset + j]) {
                    continue FIND_CHUNK;
                }
            }
            return record.value;
        }
        return null;
    }
    store(bytes, value) {
        const records = this.caches[bytes.length - 1];
        const record = {
            bytes,
            value
        };
        if (records.length >= this.maxLengthPerKey) {
            records[Math.random() * records.length | 0] = record;
        } else {
            records.push(record);
        }
    }
    decode(bytes, inputOffset, byteLength) {
        const cachedValue = this.get(bytes, inputOffset, byteLength);
        if (cachedValue != null) {
            this.hit++;
            return cachedValue;
        }
        this.miss++;
        const value = utf8DecodeJs(bytes, inputOffset, byteLength);
        const slicedCopyOfBytes = Uint8Array.prototype.slice.call(bytes, inputOffset, inputOffset + byteLength);
        this.store(slicedCopyOfBytes, value);
        return value;
    }
    maxKeyLength;
    maxLengthPerKey;
}
var State;
(function(State) {
    State[State["ARRAY"] = 0] = "ARRAY";
    State[State["MAP_KEY"] = 1] = "MAP_KEY";
    State[State["MAP_VALUE"] = 2] = "MAP_VALUE";
})(State || (State = {}));
const isValidMapKeyType = (key)=>{
    const keyType = typeof key;
    return keyType === "string" || keyType === "number";
};
const HEAD_BYTE_REQUIRED = -1;
const EMPTY_VIEW = new DataView(new ArrayBuffer(0));
const EMPTY_BYTES = new Uint8Array(EMPTY_VIEW.buffer);
const DataViewIndexOutOfBoundsError = (()=>{
    try {
        EMPTY_VIEW.getInt8(0);
    } catch (e) {
        return e.constructor;
    }
    throw new Error("never reached");
})();
const MORE_DATA = new DataViewIndexOutOfBoundsError("Insufficient data");
const sharedCachedKeyDecoder = new CachedKeyDecoder();
class Decoder {
    totalPos;
    pos;
    view;
    bytes;
    headByte;
    stack;
    constructor(extensionCodec = ExtensionCodec.defaultCodec, context = undefined, maxStrLength = 0xffff_ffff, maxBinLength = 0xffff_ffff, maxArrayLength = 0xffff_ffff, maxMapLength = 0xffff_ffff, maxExtLength = 0xffff_ffff, keyDecoder = sharedCachedKeyDecoder){
        this.extensionCodec = extensionCodec;
        this.context = context;
        this.maxStrLength = maxStrLength;
        this.maxBinLength = maxBinLength;
        this.maxArrayLength = maxArrayLength;
        this.maxMapLength = maxMapLength;
        this.maxExtLength = maxExtLength;
        this.keyDecoder = keyDecoder;
        this.totalPos = 0;
        this.pos = 0;
        this.view = EMPTY_VIEW;
        this.bytes = EMPTY_BYTES;
        this.headByte = HEAD_BYTE_REQUIRED;
        this.stack = [];
    }
    reinitializeState() {
        this.totalPos = 0;
        this.headByte = HEAD_BYTE_REQUIRED;
    }
    setBuffer(buffer) {
        this.bytes = ensureUint8Array(buffer);
        this.view = createDataView(this.bytes);
        this.pos = 0;
    }
    appendBuffer(buffer) {
        buffer = ensureUint8Array(buffer).slice();
        if (this.headByte === HEAD_BYTE_REQUIRED && !this.hasRemaining()) {
            this.setBuffer(buffer);
        } else {
            const remainingData = this.bytes.subarray(this.pos);
            const newData = ensureUint8Array(buffer);
            const concated = new Uint8Array(remainingData.length + newData.length);
            concated.set(remainingData);
            concated.set(newData, remainingData.length);
            this.setBuffer(concated);
        }
    }
    hasRemaining(size = 1) {
        return this.view.byteLength - this.pos >= size;
    }
    createNoExtraBytesError(posToShow) {
        const { view , pos  } = this;
        return new RangeError(`Extra ${view.byteLength - pos} of ${view.byteLength} byte(s) found at buffer[${posToShow}]`);
    }
    decode(buffer) {
        this.reinitializeState();
        this.setBuffer(buffer);
        return this.doDecodeSingleSync();
    }
    doDecodeSingleSync() {
        const object = this.doDecodeSync();
        if (this.hasRemaining()) {
            throw this.createNoExtraBytesError(this.pos);
        }
        return object;
    }
    async decodeAsync(stream) {
        let decoded = false;
        let object;
        for await (const buffer of stream){
            if (decoded) {
                throw this.createNoExtraBytesError(this.totalPos);
            }
            this.appendBuffer(buffer);
            try {
                object = this.doDecodeSync();
                decoded = true;
            } catch (e) {
                if (!(e instanceof DataViewIndexOutOfBoundsError)) {
                    throw e;
                }
            }
            this.totalPos += this.pos;
        }
        if (decoded) {
            if (this.hasRemaining()) {
                throw this.createNoExtraBytesError(this.totalPos);
            }
            return object;
        }
        const { headByte , pos , totalPos  } = this;
        throw new RangeError(`Insufficient data in parcing ${prettyByte(headByte)} at ${totalPos} (${pos} in the current buffer)`);
    }
    decodeArrayStream(stream) {
        return this.decodeMultiAsync(stream, true);
    }
    decodeStream(stream) {
        return this.decodeMultiAsync(stream, false);
    }
    async *decodeMultiAsync(stream, isArray) {
        let isArrayHeaderRequired = isArray;
        let arrayItemsLeft = -1;
        for await (const buffer of stream){
            if (isArray && arrayItemsLeft === 0) {
                throw this.createNoExtraBytesError(this.totalPos);
            }
            this.appendBuffer(buffer);
            if (isArrayHeaderRequired) {
                arrayItemsLeft = this.readArraySize();
                isArrayHeaderRequired = false;
                this.complete();
            }
            try {
                while(true){
                    yield this.doDecodeSync();
                    if (--arrayItemsLeft === 0) {
                        break;
                    }
                }
            } catch (e) {
                if (!(e instanceof DataViewIndexOutOfBoundsError)) {
                    throw e;
                }
            }
            this.totalPos += this.pos;
        }
    }
    doDecodeSync() {
        DECODE: while(true){
            const headByte = this.readHeadByte();
            let object;
            if (headByte >= 0xe0) {
                object = headByte - 0x100;
            } else if (headByte < 0xc0) {
                if (headByte < 0x80) {
                    object = headByte;
                } else if (headByte < 0x90) {
                    const size = headByte - 0x80;
                    if (size !== 0) {
                        this.pushMapState(size);
                        this.complete();
                        continue DECODE;
                    } else {
                        object = {};
                    }
                } else if (headByte < 0xa0) {
                    const size1 = headByte - 0x90;
                    if (size1 !== 0) {
                        this.pushArrayState(size1);
                        this.complete();
                        continue DECODE;
                    } else {
                        object = [];
                    }
                } else {
                    const byteLength = headByte - 0xa0;
                    object = this.decodeUtf8String(byteLength, 0);
                }
            } else if (headByte === 0xc0) {
                object = null;
            } else if (headByte === 0xc2) {
                object = false;
            } else if (headByte === 0xc3) {
                object = true;
            } else if (headByte === 0xca) {
                object = this.readF32();
            } else if (headByte === 0xcb) {
                object = this.readF64();
            } else if (headByte === 0xcc) {
                object = this.readU8();
            } else if (headByte === 0xcd) {
                object = this.readU16();
            } else if (headByte === 0xce) {
                object = this.readU32();
            } else if (headByte === 0xcf) {
                object = this.readU64();
            } else if (headByte === 0xd0) {
                object = this.readI8();
            } else if (headByte === 0xd1) {
                object = this.readI16();
            } else if (headByte === 0xd2) {
                object = this.readI32();
            } else if (headByte === 0xd3) {
                object = this.readI64();
            } else if (headByte === 0xd9) {
                const byteLength1 = this.lookU8();
                object = this.decodeUtf8String(byteLength1, 1);
            } else if (headByte === 0xda) {
                const byteLength2 = this.lookU16();
                object = this.decodeUtf8String(byteLength2, 2);
            } else if (headByte === 0xdb) {
                const byteLength3 = this.lookU32();
                object = this.decodeUtf8String(byteLength3, 4);
            } else if (headByte === 0xdc) {
                const size2 = this.readU16();
                if (size2 !== 0) {
                    this.pushArrayState(size2);
                    this.complete();
                    continue DECODE;
                } else {
                    object = [];
                }
            } else if (headByte === 0xdd) {
                const size3 = this.readU32();
                if (size3 !== 0) {
                    this.pushArrayState(size3);
                    this.complete();
                    continue DECODE;
                } else {
                    object = [];
                }
            } else if (headByte === 0xde) {
                const size4 = this.readU16();
                if (size4 !== 0) {
                    this.pushMapState(size4);
                    this.complete();
                    continue DECODE;
                } else {
                    object = {};
                }
            } else if (headByte === 0xdf) {
                const size5 = this.readU32();
                if (size5 !== 0) {
                    this.pushMapState(size5);
                    this.complete();
                    continue DECODE;
                } else {
                    object = {};
                }
            } else if (headByte === 0xc4) {
                const size6 = this.lookU8();
                object = this.decodeBinary(size6, 1);
            } else if (headByte === 0xc5) {
                const size7 = this.lookU16();
                object = this.decodeBinary(size7, 2);
            } else if (headByte === 0xc6) {
                const size8 = this.lookU32();
                object = this.decodeBinary(size8, 4);
            } else if (headByte === 0xd4) {
                object = this.decodeExtension(1, 0);
            } else if (headByte === 0xd5) {
                object = this.decodeExtension(2, 0);
            } else if (headByte === 0xd6) {
                object = this.decodeExtension(4, 0);
            } else if (headByte === 0xd7) {
                object = this.decodeExtension(8, 0);
            } else if (headByte === 0xd8) {
                object = this.decodeExtension(16, 0);
            } else if (headByte === 0xc7) {
                const size9 = this.lookU8();
                object = this.decodeExtension(size9, 1);
            } else if (headByte === 0xc8) {
                const size10 = this.lookU16();
                object = this.decodeExtension(size10, 2);
            } else if (headByte === 0xc9) {
                const size11 = this.lookU32();
                object = this.decodeExtension(size11, 4);
            } else {
                throw new Error(`Unrecognized type byte: ${prettyByte(headByte)}`);
            }
            this.complete();
            const stack = this.stack;
            while(stack.length > 0){
                const state = stack[stack.length - 1];
                if (state.type === 0) {
                    state.array[state.position] = object;
                    state.position++;
                    if (state.position === state.size) {
                        stack.pop();
                        object = state.array;
                    } else {
                        continue DECODE;
                    }
                } else if (state.type === 1) {
                    if (!isValidMapKeyType(object)) {
                        throw new Error("The type of key must be string or number but " + typeof object);
                    }
                    state.key = object;
                    state.type = 2;
                    continue DECODE;
                } else {
                    state.map[state.key] = object;
                    state.readCount++;
                    if (state.readCount === state.size) {
                        stack.pop();
                        object = state.map;
                    } else {
                        state.key = null;
                        state.type = 1;
                        continue DECODE;
                    }
                }
            }
            return object;
        }
    }
    readHeadByte() {
        if (this.headByte === HEAD_BYTE_REQUIRED) {
            this.headByte = this.readU8();
        }
        return this.headByte;
    }
    complete() {
        this.headByte = HEAD_BYTE_REQUIRED;
    }
    readArraySize() {
        const headByte = this.readHeadByte();
        switch(headByte){
            case 0xdc:
                return this.readU16();
            case 0xdd:
                return this.readU32();
            default:
                {
                    if (headByte < 0xa0) {
                        return headByte - 0x90;
                    } else {
                        throw new Error(`Unrecognized array type byte: ${prettyByte(headByte)}`);
                    }
                }
        }
    }
    pushMapState(size) {
        if (size > this.maxMapLength) {
            throw new Error(`Max length exceeded: map length (${size}) > maxMapLengthLength (${this.maxMapLength})`);
        }
        this.stack.push({
            type: 1,
            size,
            key: null,
            readCount: 0,
            map: {}
        });
    }
    pushArrayState(size) {
        if (size > this.maxArrayLength) {
            throw new Error(`Max length exceeded: array length (${size}) > maxArrayLength (${this.maxArrayLength})`);
        }
        this.stack.push({
            type: 0,
            size,
            array: new Array(size),
            position: 0
        });
    }
    decodeUtf8String(byteLength, headerOffset) {
        if (byteLength > this.maxStrLength) {
            throw new Error(`Max length exceeded: UTF-8 byte length (${byteLength}) > maxStrLength (${this.maxStrLength})`);
        }
        if (this.bytes.byteLength < this.pos + headerOffset + byteLength) {
            throw MORE_DATA;
        }
        const offset = this.pos + headerOffset;
        let object;
        if (this.stateIsMapKey() && this.keyDecoder?.canBeCached(byteLength)) {
            object = this.keyDecoder.decode(this.bytes, offset, byteLength);
        } else if (byteLength > 200) {
            object = utf8DecodeTD(this.bytes, offset, byteLength);
        } else {
            object = utf8DecodeJs(this.bytes, offset, byteLength);
        }
        this.pos += headerOffset + byteLength;
        return object;
    }
    stateIsMapKey() {
        if (this.stack.length > 0) {
            const state = this.stack[this.stack.length - 1];
            return state.type === 1;
        }
        return false;
    }
    decodeBinary(byteLength, headOffset) {
        if (byteLength > this.maxBinLength) {
            throw new Error(`Max length exceeded: bin length (${byteLength}) > maxBinLength (${this.maxBinLength})`);
        }
        if (!this.hasRemaining(byteLength + headOffset)) {
            throw MORE_DATA;
        }
        const offset = this.pos + headOffset;
        const object = this.bytes.subarray(offset, offset + byteLength);
        this.pos += headOffset + byteLength;
        return object;
    }
    decodeExtension(size, headOffset) {
        if (size > this.maxExtLength) {
            throw new Error(`Max length exceeded: ext length (${size}) > maxExtLength (${this.maxExtLength})`);
        }
        const extType = this.view.getInt8(this.pos + headOffset);
        const data = this.decodeBinary(size, headOffset + 1);
        return this.extensionCodec.decode(data, extType, this.context);
    }
    lookU8() {
        return this.view.getUint8(this.pos);
    }
    lookU16() {
        return this.view.getUint16(this.pos);
    }
    lookU32() {
        return this.view.getUint32(this.pos);
    }
    readU8() {
        const value = this.view.getUint8(this.pos);
        this.pos++;
        return value;
    }
    readI8() {
        const value = this.view.getInt8(this.pos);
        this.pos++;
        return value;
    }
    readU16() {
        const value = this.view.getUint16(this.pos);
        this.pos += 2;
        return value;
    }
    readI16() {
        const value = this.view.getInt16(this.pos);
        this.pos += 2;
        return value;
    }
    readU32() {
        const value = this.view.getUint32(this.pos);
        this.pos += 4;
        return value;
    }
    readI32() {
        const value = this.view.getInt32(this.pos);
        this.pos += 4;
        return value;
    }
    readU64() {
        const value = getUint64(this.view, this.pos);
        this.pos += 8;
        return value;
    }
    readI64() {
        const value = getInt64(this.view, this.pos);
        this.pos += 8;
        return value;
    }
    readF32() {
        const value = this.view.getFloat32(this.pos);
        this.pos += 4;
        return value;
    }
    readF64() {
        const value = this.view.getFloat64(this.pos);
        this.pos += 8;
        return value;
    }
    extensionCodec;
    context;
    maxStrLength;
    maxBinLength;
    maxArrayLength;
    maxMapLength;
    maxExtLength;
    keyDecoder;
}
const defaultDecodeOptions = {};
function decode1(buffer, options = defaultDecodeOptions) {
    const decoder = new Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
    return decoder.decode(buffer);
}
function isAsyncIterable(object) {
    return object[Symbol.asyncIterator] != null;
}
function assertNonNull(value) {
    if (value == null) {
        throw new Error("Assertion Failure: value must not be null nor undefined");
    }
}
async function* asyncIterableFromStream(stream) {
    const reader = stream.getReader();
    try {
        while(true){
            const { done , value  } = await reader.read();
            if (done) {
                return;
            }
            assertNonNull(value);
            yield value;
        }
    } finally{
        reader.releaseLock();
    }
}
function ensureAsyncIterabe(streamLike) {
    if (isAsyncIterable(streamLike)) {
        return streamLike;
    } else {
        return asyncIterableFromStream(streamLike);
    }
}
function decodeAsync(streamLike, options = defaultDecodeOptions) {
    const stream = ensureAsyncIterabe(streamLike);
    const decoder = new Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
    return decoder.decodeAsync(stream);
}
function decodeArrayStream(streamLike, options = defaultDecodeOptions) {
    const stream = ensureAsyncIterabe(streamLike);
    const decoder = new Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
    return decoder.decodeArrayStream(stream);
}
function decodeStream(streamLike, options = defaultDecodeOptions) {
    const stream = ensureAsyncIterabe(streamLike);
    const decoder = new Decoder(options.extensionCodec, options.context, options.maxStrLength, options.maxBinLength, options.maxArrayLength, options.maxMapLength, options.maxExtLength);
    return decoder.decodeStream(stream);
}
const mod7 = {
    encode: encode1,
    decode: decode1,
    decodeArrayStream: decodeArrayStream,
    decodeAsync: decodeAsync,
    decodeStream: decodeStream,
    Decoder: Decoder,
    Encoder: Encoder,
    ExtensionCodec: ExtensionCodec,
    ExtData: ExtData,
    decodeTimestampExtension: decodeTimestampExtension,
    decodeTimestampToTimeSpec: decodeTimestampToTimeSpec,
    encodeDateToTimeSpec: encodeDateToTimeSpec,
    encodeTimeSpecToTimestamp: encodeTimeSpecToTimestamp,
    encodeTimestampExtension: encodeTimestampExtension,
    EXT_TIMESTAMP: EXT_TIMESTAMP
};
const osType = (()=>{
    const { Deno: Deno1  } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        const { Deno: Deno1  } = globalThis;
        if (i >= 0) {
            path = pathSegments[i];
        } else if (!resolvedDevice) {
            if (typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno1.cwd();
        } else {
            if (typeof Deno1?.env?.get !== "function" || typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno1.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code = path.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path) {
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = resolve(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
function dirname(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path.slice(0, end);
}
function basename(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= start; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname(path) {
    assertPath(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path.length - 1; i >= start; --i){
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse1(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
function toFileUrl(path) {
    if (!isAbsolute(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod8 = {
    sep: sep,
    delimiter: delimiter,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse1,
    fromFileUrl: fromFileUrl,
    toFileUrl: toFileUrl
};
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            const { Deno: Deno1  } = globalThis;
            if (typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno1.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path) {
    return path;
}
function dirname1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path.length - 1; i >= 1; --i){
        if (path.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path.slice(0, end);
}
function basename1(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= 0; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname1(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse2(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path.length === 0) return ret;
    const isAbsolute = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path) {
    if (!isAbsolute1(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod9 = {
    sep: sep1,
    delimiter: delimiter1,
    resolve: resolve1,
    normalize: normalize1,
    isAbsolute: isAbsolute1,
    join: join1,
    relative: relative1,
    toNamespacedPath: toNamespacedPath1,
    dirname: dirname1,
    basename: basename1,
    extname: extname1,
    format: format1,
    parse: parse2,
    fromFileUrl: fromFileUrl1,
    toFileUrl: toFileUrl1
};
const SEP = isWindows ? "\\" : "/";
const SEP_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
function common(paths, sep = SEP) {
    const [first = "", ...remaining] = paths;
    if (first === "" || remaining.length === 0) {
        return first.substring(0, first.lastIndexOf(sep) + 1);
    }
    const parts = first.split(sep);
    let endOfPrefix = parts.length;
    for (const path of remaining){
        const compare = path.split(sep);
        for(let i = 0; i < endOfPrefix; i++){
            if (compare[i] !== parts[i]) {
                endOfPrefix = i;
            }
        }
        if (endOfPrefix === 0) {
            return "";
        }
    }
    const prefix = parts.slice(0, endOfPrefix).join(sep);
    return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
}
const path = isWindows ? mod8 : mod9;
const { join: join2 , normalize: normalize2  } = path;
const regExpEscapeChars = [
    "!",
    "$",
    "(",
    ")",
    "*",
    "+",
    ".",
    "=",
    "?",
    "[",
    "\\",
    "^",
    "{",
    "|"
];
const rangeEscapeChars = [
    "-",
    "\\",
    "]"
];
function globToRegExp(glob, { extended =true , globstar: globstarOption = true , os =osType , caseInsensitive =false  } = {}) {
    if (glob == "") {
        return /(?!)/;
    }
    const sep = os == "windows" ? "(?:\\\\|/)+" : "/+";
    const sepMaybe = os == "windows" ? "(?:\\\\|/)*" : "/*";
    const seps = os == "windows" ? [
        "\\",
        "/"
    ] : [
        "/"
    ];
    const globstar = os == "windows" ? "(?:[^\\\\/]*(?:\\\\|/|$)+)*" : "(?:[^/]*(?:/|$)+)*";
    const wildcard = os == "windows" ? "[^\\\\/]*" : "[^/]*";
    const escapePrefix = os == "windows" ? "`" : "\\";
    let newLength = glob.length;
    for(; newLength > 1 && seps.includes(glob[newLength - 1]); newLength--);
    glob = glob.slice(0, newLength);
    let regExpString = "";
    for(let j = 0; j < glob.length;){
        let segment = "";
        const groupStack = [];
        let inRange = false;
        let inEscape = false;
        let endsWithSep = false;
        let i = j;
        for(; i < glob.length && !seps.includes(glob[i]); i++){
            if (inEscape) {
                inEscape = false;
                const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
                segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
                continue;
            }
            if (glob[i] == escapePrefix) {
                inEscape = true;
                continue;
            }
            if (glob[i] == "[") {
                if (!inRange) {
                    inRange = true;
                    segment += "[";
                    if (glob[i + 1] == "!") {
                        i++;
                        segment += "^";
                    } else if (glob[i + 1] == "^") {
                        i++;
                        segment += "\\^";
                    }
                    continue;
                } else if (glob[i + 1] == ":") {
                    let k = i + 1;
                    let value = "";
                    while(glob[k + 1] != null && glob[k + 1] != ":"){
                        value += glob[k + 1];
                        k++;
                    }
                    if (glob[k + 1] == ":" && glob[k + 2] == "]") {
                        i = k + 2;
                        if (value == "alnum") segment += "\\dA-Za-z";
                        else if (value == "alpha") segment += "A-Za-z";
                        else if (value == "ascii") segment += "\x00-\x7F";
                        else if (value == "blank") segment += "\t ";
                        else if (value == "cntrl") segment += "\x00-\x1F\x7F";
                        else if (value == "digit") segment += "\\d";
                        else if (value == "graph") segment += "\x21-\x7E";
                        else if (value == "lower") segment += "a-z";
                        else if (value == "print") segment += "\x20-\x7E";
                        else if (value == "punct") {
                            segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
                        } else if (value == "space") segment += "\\s\v";
                        else if (value == "upper") segment += "A-Z";
                        else if (value == "word") segment += "\\w";
                        else if (value == "xdigit") segment += "\\dA-Fa-f";
                        continue;
                    }
                }
            }
            if (glob[i] == "]" && inRange) {
                inRange = false;
                segment += "]";
                continue;
            }
            if (inRange) {
                if (glob[i] == "\\") {
                    segment += `\\\\`;
                } else {
                    segment += glob[i];
                }
                continue;
            }
            if (glob[i] == ")" && groupStack.length > 0 && groupStack[groupStack.length - 1] != "BRACE") {
                segment += ")";
                const type = groupStack.pop();
                if (type == "!") {
                    segment += wildcard;
                } else if (type != "@") {
                    segment += type;
                }
                continue;
            }
            if (glob[i] == "|" && groupStack.length > 0 && groupStack[groupStack.length - 1] != "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] == "+" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("+");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "@" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("@");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "?") {
                if (extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("?");
                    segment += "(?:";
                } else {
                    segment += ".";
                }
                continue;
            }
            if (glob[i] == "!" && extended && glob[i + 1] == "(") {
                i++;
                groupStack.push("!");
                segment += "(?!";
                continue;
            }
            if (glob[i] == "{") {
                groupStack.push("BRACE");
                segment += "(?:";
                continue;
            }
            if (glob[i] == "}" && groupStack[groupStack.length - 1] == "BRACE") {
                groupStack.pop();
                segment += ")";
                continue;
            }
            if (glob[i] == "," && groupStack[groupStack.length - 1] == "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] == "*") {
                if (extended && glob[i + 1] == "(") {
                    i++;
                    groupStack.push("*");
                    segment += "(?:";
                } else {
                    const prevChar = glob[i - 1];
                    let numStars = 1;
                    while(glob[i + 1] == "*"){
                        i++;
                        numStars++;
                    }
                    const nextChar = glob[i + 1];
                    if (globstarOption && numStars == 2 && [
                        ...seps,
                        undefined
                    ].includes(prevChar) && [
                        ...seps,
                        undefined
                    ].includes(nextChar)) {
                        segment += globstar;
                        endsWithSep = true;
                    } else {
                        segment += wildcard;
                    }
                }
                continue;
            }
            segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        }
        if (groupStack.length > 0 || inRange || inEscape) {
            segment = "";
            for (const c of glob.slice(j, i)){
                segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
                endsWithSep = false;
            }
        }
        regExpString += segment;
        if (!endsWithSep) {
            regExpString += i < glob.length ? sep : sepMaybe;
            endsWithSep = true;
        }
        while(seps.includes(glob[i]))i++;
        if (!(i > j)) {
            throw new Error("Assertion failure: i > j (potential infinite loop)");
        }
        j = i;
    }
    regExpString = `^${regExpString}$`;
    return new RegExp(regExpString, caseInsensitive ? "i" : "");
}
function isGlob(str) {
    const chars = {
        "{": "}",
        "(": ")",
        "[": "]"
    };
    const regex = /\\(.)|(^!|\*|\?|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    if (str === "") {
        return false;
    }
    let match;
    while(match = regex.exec(str)){
        if (match[2]) return true;
        let idx = match.index + match[0].length;
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
            const n = str.indexOf(close, idx);
            if (n !== -1) {
                idx = n + 1;
            }
        }
        str = str.slice(idx);
    }
    return false;
}
function normalizeGlob(glob, { globstar =false  } = {}) {
    if (glob.match(/\0/g)) {
        throw new Error(`Glob contains invalid characters: "${glob}"`);
    }
    if (!globstar) {
        return normalize2(glob);
    }
    const s = SEP_PATTERN.source;
    const badParentPattern = new RegExp(`(?<=(${s}|^)\\*\\*${s})\\.\\.(?=${s}|$)`, "g");
    return normalize2(glob.replace(badParentPattern, "\0")).replace(/\0/g, "..");
}
function joinGlobs(globs, { extended =true , globstar =false  } = {}) {
    if (!globstar || globs.length == 0) {
        return join2(...globs);
    }
    if (globs.length === 0) return ".";
    let joined;
    for (const glob of globs){
        const path = glob;
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `${SEP}${path}`;
        }
    }
    if (!joined) return ".";
    return normalizeGlob(joined, {
        extended,
        globstar
    });
}
const path1 = isWindows ? mod8 : mod9;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join3 , normalize: normalize3 , parse: parse3 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2  } = path1;
const mod10 = {
    SEP: SEP,
    SEP_PATTERN: SEP_PATTERN,
    win32: mod8,
    posix: mod9,
    basename: basename2,
    delimiter: delimiter2,
    dirname: dirname2,
    extname: extname2,
    format: format2,
    fromFileUrl: fromFileUrl2,
    isAbsolute: isAbsolute2,
    join: join3,
    normalize: normalize3,
    parse: parse3,
    relative: relative2,
    resolve: resolve2,
    sep: sep2,
    toFileUrl: toFileUrl2,
    toNamespacedPath: toNamespacedPath2,
    common,
    globToRegExp,
    isGlob,
    normalizeGlob,
    joinGlobs
};
const { Deno: Deno1  } = globalThis;
const noColor = typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
let enabled = !noColor;
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
function bgGreen(str) {
    return run(str, code([
        42
    ], 49));
}
function bgWhite(str) {
    return run(str, code([
        47
    ], 49));
}
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
].join("|"), "g");
function writeAllSync(w, arr) {
    let nwritten = 0;
    while(nwritten < arr.length){
        nwritten += w.writeSync(arr.subarray(nwritten));
    }
}
const isTTY = Deno.stdout && Deno.isatty(Deno.stdout.rid);
const isWindow = Deno.build.os === "windows";
class MultiProgressBar {
    width;
    complete;
    incomplete;
    clear;
    interval;
    display;
    #end = false;
    #startIndex = 0;
    #lastRows = 0;
    #strs = [];
    lastStr = "";
    start = Date.now();
    lastRender = 0;
    encoder = new TextEncoder();
    constructor({ title ="" , width =50 , complete =bgGreen(" ") , incomplete =bgWhite(" ") , clear =false , interval , display  } = {}){
        if (title != "") {
            this.#strs.push(title);
            this.#startIndex = 1;
        }
        this.width = width;
        this.complete = complete;
        this.incomplete = incomplete;
        this.clear = clear;
        this.interval = interval ?? 16;
        this.display = display ?? ":bar :text :percent :time :completed/:total";
    }
    render(bars) {
        if (this.#end || !isTTY) return;
        const now = Date.now();
        const ms = now - this.lastRender;
        this.lastRender = now;
        const time = ((now - this.start) / 1000).toFixed(1) + "s";
        let end = true;
        let index = this.#startIndex;
        for (const { completed , total =100 , text ="" , ...options } of bars){
            if (completed < 0) {
                throw new Error(`completed must greater than or equal to 0`);
            }
            if (!Number.isInteger(total)) throw new Error(`total must be 'number'`);
            if (completed > total && this.#strs[index] != undefined) continue;
            end = false;
            const percent = (completed / total * 100).toFixed(2) + "%";
            const eta = completed == 0 ? "-" : (completed >= total ? 0 : (total / completed - 1) * (now - this.start) / 1000).toFixed(1) + "s";
            let str = this.display.replace(":text", text).replace(":time", time).replace(":eta", eta).replace(":percent", percent).replace(":completed", completed + "").replace(":total", total + "");
            let availableSpace = Math.max(0, this.ttyColumns - str.replace(":bar", "").length);
            if (availableSpace && isWindow) availableSpace -= 1;
            const width = Math.min(this.width, availableSpace);
            const completeLength = Math.round(width * completed / total);
            const complete = new Array(completeLength).fill(options.complete ?? this.complete).join("");
            const incomplete = new Array(width - completeLength).fill(options.incomplete ?? this.incomplete).join("");
            str = str.replace(":bar", complete + incomplete);
            if (this.#strs[index] && str.length < this.#strs[index].length) {
                str += " ".repeat(this.#strs[index].length - str.length);
            }
            this.#strs[index++] = str;
        }
        if (ms < this.interval && end == false) return;
        const renderStr = this.#strs.join("\n");
        if (renderStr !== this.lastStr) {
            this.resetScreen();
            this.write(renderStr);
            this.lastStr = renderStr;
            this.#lastRows = this.#strs.length;
        }
        if (end) this.end();
    }
    end() {
        this.#end = true;
        if (this.clear) {
            this.resetScreen();
        } else {
            this.breakLine();
        }
        this.showCursor();
    }
    console(message) {
        this.resetScreen();
        this.write(`${message}`);
        this.breakLine();
        this.write(this.lastStr);
    }
    write(msg) {
        msg = `${msg}\x1b[?25l`;
        this.stdoutWrite(msg);
    }
    resetScreen() {
        if (this.#lastRows > 0) {
            this.stdoutWrite("\x1b[" + (this.#lastRows - 1) + "A\r\x1b[?0J");
        }
    }
    get ttyColumns() {
        return 100;
    }
    breakLine() {
        this.stdoutWrite("\r\n");
    }
    stdoutWrite(msg) {
        writeAllSync(Deno.stdout, this.encoder.encode(msg));
    }
    showCursor() {
        this.stdoutWrite("\x1b[?25h");
    }
}
const isTTY1 = Deno.stdout && Deno.isatty(Deno.stdout.rid);
const isWindow1 = Deno.build.os === "windows";
var Direction;
(function(Direction) {
    Direction[Direction["left"] = 0] = "left";
    Direction[Direction["right"] = 1] = "right";
    Direction[Direction["all"] = 2] = "all";
})(Direction || (Direction = {}));
class ProgressBar {
    title;
    total;
    width;
    complete;
    preciseBar;
    incomplete;
    clear;
    interval;
    display;
    isCompleted = false;
    lastStr = "";
    start = Date.now();
    lastRender = 0;
    encoder = new TextEncoder();
    constructor({ title ="" , total , width =50 , complete =bgGreen(" ") , preciseBar =[] , incomplete =bgWhite(" ") , clear =false , interval =16 , display  } = {}){
        this.title = title;
        this.total = total;
        this.width = width;
        this.complete = complete;
        this.preciseBar = preciseBar.concat(complete);
        this.incomplete = incomplete;
        this.clear = clear;
        this.interval = interval;
        this.display = display ?? ":title :percent :bar :time :completed/:total";
    }
    render(completed, options = {}) {
        if (this.isCompleted || !isTTY1) return;
        if (completed < 0) {
            throw new Error(`completed must greater than or equal to 0`);
        }
        const total = options.total ?? this.total ?? 100;
        const now = Date.now();
        const ms = now - this.lastRender;
        if (ms < this.interval && completed < total) return;
        this.lastRender = now;
        const time = ((now - this.start) / 1000).toFixed(1) + "s";
        const eta = completed == 0 ? "-" : (completed >= total ? 0 : (total / completed - 1) * (now - this.start) / 1000).toFixed(1) + "s";
        const percent = (completed / total * 100).toFixed(2) + "%";
        let str = this.display.replace(":title", options.title ?? this.title).replace(":time", time).replace(":eta", eta).replace(":percent", percent).replace(":completed", completed + "").replace(":total", total + "");
        let availableSpace = Math.max(0, this.ttyColumns - str.replace(":bar", "").length);
        if (availableSpace && isWindow1) availableSpace -= 1;
        const width = Math.min(this.width, availableSpace);
        const finished = completed >= total;
        const preciseBar = options.preciseBar ?? this.preciseBar;
        const precision = preciseBar.length > 1;
        const completeLength = width * completed / total;
        const roundedCompleteLength = Math.floor(completeLength);
        let precise = "";
        if (precision) {
            const preciseLength = completeLength - roundedCompleteLength;
            precise = finished ? "" : preciseBar[Math.floor(preciseBar.length * preciseLength)];
        }
        const complete = new Array(roundedCompleteLength).fill(options.complete ?? this.complete).join("");
        const incomplete = new Array(Math.max(width - roundedCompleteLength - (precision ? 1 : 0), 0)).fill(options.incomplete ?? this.incomplete).join("");
        str = str.replace(":bar", complete + precise + incomplete);
        if (str.length < this.lastStr.length) {
            str += " ".repeat(this.lastStr.length - str.length);
        }
        if (str !== this.lastStr) {
            this.write(str);
            this.lastStr = str;
        }
        if (finished) this.end();
    }
    end() {
        this.isCompleted = true;
        if (this.clear) {
            this.stdoutWrite("\r");
            this.clearLine();
        } else {
            this.breakLine();
        }
        this.showCursor();
    }
    console(message) {
        this.clearLine();
        this.write(`${message}`);
        this.breakLine();
        this.write(this.lastStr);
    }
    write(msg) {
        msg = `\r${msg}\x1b[?25l`;
        this.stdoutWrite(msg);
    }
    get ttyColumns() {
        return 100;
    }
    breakLine() {
        this.stdoutWrite("\r\n");
    }
    stdoutWrite(msg) {
        writeAllSync(Deno.stdout, this.encoder.encode(msg));
    }
    clearLine(direction = 2) {
        switch(direction){
            case 2:
                this.stdoutWrite("\x1b[2K");
                break;
            case 0:
                this.stdoutWrite("\x1b[1K");
                break;
            case 1:
                this.stdoutWrite("\x1b[0K");
                break;
        }
    }
    showCursor() {
        this.stdoutWrite("\x1b[?25h");
    }
}
class Semaphore {
    tasks = [];
    count;
    constructor(count){
        this.count = count;
    }
    schedule() {
        if (this.count > 0 && this.tasks.length > 0) {
            this.count--;
            const next = this.tasks.shift();
            if (next === undefined) {
                throw "Unexpected undefined value in tasks list";
            }
            next();
        }
    }
    get length() {
        return this.tasks.length;
    }
    acquire() {
        return new Promise((resolve)=>{
            const task = ()=>{
                let released = false;
                resolve(()=>{
                    if (!released) {
                        released = true;
                        this.count++;
                        this.schedule();
                    }
                });
            };
            this.tasks.push(task);
            queueMicrotask(this.schedule.bind(this));
        });
    }
    async use(fn) {
        const release = await this.acquire();
        try {
            const res = await fn();
            release();
            return res;
        } catch (err) {
            release();
            throw err;
        }
    }
}
class Mutex extends Semaphore {
    constructor(){
        super(1);
    }
}
const stdinLines = mod2.readLines(Deno.stdin);
async function readline({ skipEmpty =true  } = {}) {
    for await (const line of stdinLines){
        if (!skipEmpty || line !== "") {
            return line;
        }
    }
    throw new Error("EOF");
}
function urlBase64Encode(data) {
    return mod.encode(data).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function retry(f, times = 2) {
    let lastError;
    for(let i = 0; i < times; i++){
        try {
            return await f();
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError;
}
async function showError(env, p) {
    try {
        return await p;
    } catch (e) {
        if (e instanceof APIError) {
            env.logger.error(`\n\nAPIError: ${e.message}`, "\nResponse: ", e.response, "\nBody: ", e.json);
        } else {
            env.logger.error(e);
        }
        throw e;
    }
}
function gameId(id) {
    const parsed = parseHistoryDetailId(id);
    if (parsed.type === "VsHistoryDetail") {
        const content = new TextEncoder().encode(`${parsed.timestamp}_${parsed.uuid}`);
        return mod6.v5.generate(BATTLE_NAMESPACE, content);
    } else if (parsed.type === "CoopHistoryDetail") {
        return mod6.v5.generate(COOP_NAMESPACE, mod.decode(id));
    } else {
        throw new Error("Unknown type");
    }
}
function s3siGameId(id) {
    const fullId = mod.decode(id);
    const tsUuid = fullId.slice(fullId.length - 52, fullId.length);
    return mod6.v5.generate(S3SI_NAMESPACE, tsUuid);
}
function s3sCoopGameId(id) {
    const fullId = mod.decode(id);
    const tsUuid = fullId.slice(fullId.length - 52, fullId.length);
    return mod6.v5.generate(COOP_NAMESPACE, tsUuid);
}
function parseHistoryDetailId(id) {
    const plainText = new TextDecoder().decode(mod.decode(id));
    const vsRE = /VsHistoryDetail-([a-z0-9-]+):(\w+):(\d{8}T\d{6})_([0-9a-f-]{36})/;
    const coopRE = /CoopHistoryDetail-([a-z0-9-]+):(\d{8}T\d{6})_([0-9a-f-]{36})/;
    if (vsRE.test(plainText)) {
        const [, uid, listType, timestamp, uuid] = plainText.match(vsRE);
        return {
            type: "VsHistoryDetail",
            uid,
            listType,
            timestamp,
            uuid
        };
    } else if (coopRE.test(plainText)) {
        const [, uid1, timestamp1, uuid1] = plainText.match(coopRE);
        return {
            type: "CoopHistoryDetail",
            uid: uid1,
            timestamp: timestamp1,
            uuid: uuid1
        };
    } else {
        throw new Error(`Invalid ID: ${plainText}`);
    }
}
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
function b64Number(id) {
    const text = new TextDecoder().decode(mod.decode(id));
    const [_, num] = text.split("-");
    return parseInt(num);
}
function nonNullable(v) {
    return v !== null && v !== undefined;
}
function urlSimplify(url) {
    try {
        const { pathname  } = new URL(url);
        return {
            pathname
        };
    } catch (_e) {
        return url;
    }
}
async function loginManually({ newFetcher , prompts: { promptLogin  }  }) {
    const fetch = newFetcher();
    const state = urlBase64Encode(random(36));
    const authCodeVerifier = urlBase64Encode(random(32));
    const authCvHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(authCodeVerifier));
    const authCodeChallenge = urlBase64Encode(authCvHash);
    const body = {
        "state": state,
        "redirect_uri": "npf71b963c1b7b6d119://auth",
        "client_id": "71b963c1b7b6d119",
        "scope": "openid user user.birthday user.mii user.screenName",
        "response_type": "session_token_code",
        "session_token_code_challenge": authCodeChallenge,
        "session_token_code_challenge_method": "S256",
        "theme": "login_form"
    };
    const url = "https://accounts.nintendo.com/connect/1.0.0/authorize?" + new URLSearchParams(body);
    const res = await fetch.get({
        url,
        headers: {
            "Host": "accounts.nintendo.com",
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Mobile Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8n",
            "DNT": "1",
            "Accept-Encoding": "gzip,deflate,br"
        }
    });
    const login = (await promptLogin(res.url)).trim();
    if (!login) {
        throw new Error("No login URL provided");
    }
    const loginURL = new URL(login);
    const params = new URLSearchParams(loginURL.hash.substring(1));
    const sessionTokenCode = params.get("session_token_code");
    if (!sessionTokenCode) {
        throw new Error("No session token code provided");
    }
    const sessionToken = await getSessionToken({
        fetch,
        sessionTokenCode,
        authCodeVerifier
    });
    if (!sessionToken) {
        throw new Error("No session token found");
    }
    return sessionToken;
}
async function getGToken({ fApi , sessionToken , env  }) {
    const fetch = env.newFetcher();
    const idResp = await fetch.post({
        url: "https://accounts.nintendo.com/connect/1.0.0/api/token",
        headers: {
            "Host": "accounts.nintendo.com",
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Connection": "Keep-Alive",
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 7.1.2)"
        },
        body: JSON.stringify({
            "client_id": "71b963c1b7b6d119",
            "session_token": sessionToken,
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token"
        })
    });
    const idRespJson = await idResp.json();
    const { access_token: accessToken , id_token: idToken  } = idRespJson;
    if (!accessToken || !idToken) {
        throw new APIError({
            response: idResp,
            json: idRespJson,
            message: "No access_token or id_token found"
        });
    }
    const uiResp = await fetch.get({
        url: "https://api.accounts.nintendo.com/2.0.0/users/me",
        headers: {
            "User-Agent": "NASDKAPI; Android",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "Host": "api.accounts.nintendo.com",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
        }
    });
    const uiRespJson = await uiResp.json();
    const { nickname , birthday , language , country  } = uiRespJson;
    const getIdToken2 = async (idToken)=>{
        const { f , request_id: requestId , timestamp  } = await callImink({
            fApi,
            step: 1,
            idToken,
            env
        });
        const resp = await fetch.post({
            url: "https://api-lp1.znc.srv.nintendo.net/v3/Account/Login",
            headers: {
                "X-Platform": "Android",
                "X-ProductVersion": NSOAPP_VERSION,
                "Content-Type": "application/json; charset=utf-8",
                "Connection": "Keep-Alive",
                "Accept-Encoding": "gzip",
                "User-Agent": `com.nintendo.znca/${NSOAPP_VERSION}(Android/7.1.2)`
            },
            body: JSON.stringify({
                parameter: {
                    "f": f,
                    "language": language,
                    "naBirthday": birthday,
                    "naCountry": country,
                    "naIdToken": idToken,
                    "requestId": requestId,
                    "timestamp": timestamp
                }
            })
        });
        const respJson = await resp.json();
        const idToken2 = respJson?.result?.webApiServerCredential?.accessToken;
        if (!idToken2) {
            throw new APIError({
                response: resp,
                json: respJson,
                message: "No idToken2 found"
            });
        }
        return idToken2;
    };
    const getGToken = async (idToken)=>{
        const { f , request_id: requestId , timestamp  } = await callImink({
            step: 2,
            idToken,
            fApi,
            env
        });
        const resp = await fetch.post({
            url: "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken",
            headers: {
                "X-Platform": "Android",
                "X-ProductVersion": NSOAPP_VERSION,
                "Authorization": `Bearer ${idToken}`,
                "Content-Type": "application/json; charset=utf-8",
                "Accept-Encoding": "gzip",
                "User-Agent": `com.nintendo.znca/${NSOAPP_VERSION}(Android/7.1.2)`
            },
            body: JSON.stringify({
                parameter: {
                    "f": f,
                    "id": 4834290508791808,
                    "registrationToken": idToken,
                    "requestId": requestId,
                    "timestamp": timestamp
                }
            })
        });
        const respJson = await resp.json();
        const webServiceToken = respJson?.result?.accessToken;
        if (!webServiceToken) {
            throw new APIError({
                response: resp,
                json: respJson,
                message: "No webServiceToken found"
            });
        }
        return webServiceToken;
    };
    const idToken2 = await retry(()=>getIdToken2(idToken));
    const webServiceToken = await retry(()=>getGToken(idToken2));
    return {
        webServiceToken,
        nickname,
        userCountry: country,
        userLang: language
    };
}
async function getBulletToken({ webServiceToken , appUserAgent =DEFAULT_APP_USER_AGENT , userLang , userCountry , env  }) {
    const { post  } = env.newFetcher({
        cookies: [
            {
                name: "_gtoken",
                value: webServiceToken,
                domain: "api.lp1.av5ja.srv.nintendo.net"
            }
        ]
    });
    const resp = await post({
        url: "https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens",
        headers: {
            "Content-Type": "application/json",
            "Accept-Language": userLang,
            "User-Agent": appUserAgent,
            "X-Web-View-Ver": WEB_VIEW_VERSION,
            "X-NACOUNTRY": userCountry,
            "Accept": "*/*",
            "Origin": "https://api.lp1.av5ja.srv.nintendo.net",
            "X-Requested-With": "com.nintendo.znca"
        }
    });
    if (resp.status == 401) {
        throw new APIError({
            response: resp,
            message: "Unauthorized error (ERROR_INVALID_GAME_WEB_TOKEN). Cannot fetch tokens at this time."
        });
    }
    if (resp.status == 403) {
        throw new APIError({
            response: resp,
            message: "Forbidden error (ERROR_OBSOLETE_VERSION). Cannot fetch tokens at this time."
        });
    }
    if (resp.status == 204) {
        throw new APIError({
            response: resp,
            message: "Cannot access SplatNet 3 without having played online."
        });
    }
    if (resp.status !== 201) {
        throw new APIError({
            response: resp,
            message: "Not 201"
        });
    }
    const respJson = await resp.json();
    const { bulletToken  } = respJson;
    if (typeof bulletToken !== "string") {
        throw new APIError({
            response: resp,
            json: respJson,
            message: "No bulletToken found"
        });
    }
    return bulletToken;
}
function random(size) {
    return crypto.getRandomValues(new Uint8Array(size)).buffer;
}
async function getSessionToken({ fetch , sessionTokenCode , authCodeVerifier  }) {
    const resp = await fetch.post({
        url: "https://accounts.nintendo.com/connect/1.0.0/api/session_token",
        headers: {
            "User-Agent": `OnlineLounge/${NSOAPP_VERSION} NASDKAPI Android`,
            "Accept-Language": "en-US",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "accounts.nintendo.com",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip"
        },
        body: new URLSearchParams({
            "client_id": "71b963c1b7b6d119",
            "session_token_code": sessionTokenCode,
            "session_token_code_verifier": authCodeVerifier
        })
    });
    const json = await resp.json();
    if (json.error) {
        throw new APIError({
            response: resp,
            json,
            message: "Error getting session token"
        });
    }
    return json["session_token"];
}
async function callImink({ fApi , step , idToken , env  }) {
    const { post  } = env.newFetcher();
    const resp = await post({
        url: fApi,
        headers: {
            "User-Agent": USERAGENT,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "token": idToken,
            "hash_method": step
        })
    });
    return await resp.json();
}
const DEFAULT_ENV = {
    prompts: {
        promptLogin: async (url)=>{
            console.log("Navigate to this URL in your browser:");
            console.log(url);
            console.log('Log in, right click the "Select this account" button, copy the link address, and paste it below:');
            return await readline();
        },
        prompt: async (tips)=>{
            console.log(tips);
            return await readline();
        }
    },
    logger: {
        debug: console.debug,
        log: console.log,
        warn: console.warn,
        error: console.error
    },
    newFetcher: ({ cookies  } = {})=>{
        const cookieJar = new CookieJar(cookies);
        const fetch = wrapFetch({
            cookieJar
        });
        return {
            async get ({ url , headers  }) {
                return await fetch(url, {
                    method: "GET",
                    headers
                });
            },
            async post ({ url , body , headers  }) {
                return await fetch(url, {
                    method: "POST",
                    headers,
                    body
                });
            }
        };
    }
};
const DEFAULT_STATE = {
    cacheDir: "./cache",
    fGen: "https://api.imink.app/f",
    fileExportPath: "./export",
    monitorInterval: 500
};
class FileStateBackend {
    constructor(path){
        this.path = path;
    }
    async read() {
        const data = await Deno.readTextFile(this.path);
        const json = JSON.parse(data);
        return json;
    }
    async write(newState) {
        const data = JSON.stringify(newState, undefined, 2);
        const swapPath = `${this.path}.swap`;
        await Deno.writeTextFile(swapPath, data);
        await Deno.rename(swapPath, this.path);
    }
    path;
}
class Profile {
    _state;
    stateBackend;
    env;
    constructor({ stateBackend , env =DEFAULT_ENV  }){
        this.stateBackend = stateBackend;
        this.env = env;
    }
    get state() {
        if (!this._state) {
            throw new Error("state is not initialized");
        }
        return this._state;
    }
    async writeState(newState) {
        this._state = newState;
        await this.stateBackend.write(newState);
    }
    async readState() {
        try {
            const json = await this.stateBackend.read();
            this._state = {
                ...DEFAULT_STATE,
                ...json
            };
        } catch (e) {
            this.env.logger.warn(`Failed to read config file, create new config file. (${e})`);
            await this.writeState(DEFAULT_STATE);
        }
    }
}
var Queries;
(function(Queries) {
    Queries["HomeQuery"] = "dba47124d5ec3090c97ba17db5d2f4b3";
    Queries["LatestBattleHistoriesQuery"] = "4f5f26e64bca394b45345a65a2f383bd";
    Queries["RegularBattleHistoriesQuery"] = "d5b795d09e67ce153e622a184b7e7dfa";
    Queries["BankaraBattleHistoriesQuery"] = "de4754588109b77dbcb90fbe44b612ee";
    Queries["XBattleHistoriesQuery"] = "45c74fefb45a49073207229ca65f0a62";
    Queries["PrivateBattleHistoriesQuery"] = "1d6ed57dc8b801863126ad4f351dfb9a";
    Queries["VsHistoryDetailQuery"] = "291295ad311b99a6288fc95a5c4cb2d2";
    Queries["CoopHistoryQuery"] = "6ed02537e4a65bbb5e7f4f23092f6154";
    Queries["CoopHistoryDetailQuery"] = "3cc5f826a6646b85f3ae45db51bd0707";
    Queries["myOutfitCommonDataFilteringConditionQuery"] = "d02ab22c9dccc440076055c8baa0fa7a";
    Queries["myOutfitCommonDataEquipmentsQuery"] = "d29cd0c2b5e6bac90dd5b817914832f8";
    Queries["HistoryRecordQuery"] = "32b6771f94083d8f04848109b7300af5";
    Queries["ConfigureAnalyticsQuery"] = "f8ae00773cc412a50dd41a6d9a159ddd";
})(Queries || (Queries = {}));
var BattleListType;
(function(BattleListType) {
    BattleListType[BattleListType["Latest"] = 0] = "Latest";
    BattleListType[BattleListType["Regular"] = 1] = "Regular";
    BattleListType[BattleListType["Bankara"] = 2] = "Bankara";
    BattleListType[BattleListType["Private"] = 3] = "Private";
    BattleListType[BattleListType["Coop"] = 4] = "Coop";
})(BattleListType || (BattleListType = {}));
var SummaryEnum;
(function(SummaryEnum) {
    SummaryEnum[SummaryEnum["ConfigureAnalyticsQuery"] = Queries.ConfigureAnalyticsQuery] = "ConfigureAnalyticsQuery";
    SummaryEnum[SummaryEnum["HistoryRecordQuery"] = Queries.HistoryRecordQuery] = "HistoryRecordQuery";
    SummaryEnum[SummaryEnum["CoopHistoryQuery"] = Queries.CoopHistoryQuery] = "CoopHistoryQuery";
})(SummaryEnum || (SummaryEnum = {}));
class Splatnet3 {
    profile;
    env;
    constructor({ profile , env =DEFAULT_ENV  }){
        this.profile = profile;
        this.env = env;
    }
    async request(query, ...rest) {
        const doRequest = async ()=>{
            const state = this.profile.state;
            const variables = rest?.[0] ?? {};
            const body = {
                extensions: {
                    persistedQuery: {
                        sha256Hash: query,
                        version: 1
                    }
                },
                variables
            };
            const { post  } = this.env.newFetcher();
            const resp = await post({
                url: SPLATNET3_ENDPOINT,
                headers: {
                    "Authorization": `Bearer ${state.loginState?.bulletToken}`,
                    "Accept-Language": state.userLang ?? "en-US",
                    "User-Agent": state.appUserAgent ?? DEFAULT_APP_USER_AGENT,
                    "X-Web-View-Ver": WEB_VIEW_VERSION,
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Origin": "https://api.lp1.av5ja.srv.nintendo.net",
                    "X-Requested-With": "com.nintendo.znca",
                    "Referer": `https://api.lp1.av5ja.srv.nintendo.net/?lang=${state.userLang}&na_country=${state.userCountry}&na_lang=${state.userLang}`,
                    "Accept-Encoding": "gzip, deflate",
                    "Cookie": `_gtoken: ${state.loginState?.gToken}`
                },
                body: JSON.stringify(body)
            });
            if (resp.status !== 200) {
                throw new APIError({
                    response: resp,
                    message: "Splatnet3 request failed"
                });
            }
            const json = await resp.json();
            if ("errors" in json) {
                throw new APIError({
                    response: resp,
                    json,
                    message: `Splatnet3 request failed(${json.errors?.[0].message})`
                });
            }
            return json.data;
        };
        try {
            return await doRequest();
        } catch (e) {
            if (isTokenExpired(e)) {
                await this.fetchToken();
                return await doRequest();
            }
            throw e;
        }
    }
    async fetchToken() {
        const state = this.profile.state;
        const sessionToken = state.loginState?.sessionToken;
        if (!sessionToken) {
            throw new Error("Session token is not set.");
        }
        const { webServiceToken , userCountry , userLang  } = await getGToken({
            fApi: state.fGen,
            sessionToken,
            env: this.env
        });
        const bulletToken = await getBulletToken({
            webServiceToken,
            userLang,
            userCountry,
            appUserAgent: state.appUserAgent,
            env: this.env
        });
        await this.profile.writeState({
            ...state,
            loginState: {
                ...state.loginState,
                gToken: webServiceToken,
                bulletToken
            },
            userLang: state.userLang ?? userLang,
            userCountry: state.userCountry ?? userCountry
        });
    }
    BATTLE_LIST_TYPE_MAP = {
        [BattleListType.Latest]: ()=>this.request(Queries.LatestBattleHistoriesQuery).then((r)=>getIdsFromGroups(r.latestBattleHistories)),
        [BattleListType.Regular]: ()=>this.request(Queries.RegularBattleHistoriesQuery).then((r)=>getIdsFromGroups(r.regularBattleHistories)),
        [BattleListType.Bankara]: ()=>this.request(Queries.BankaraBattleHistoriesQuery).then((r)=>getIdsFromGroups(r.bankaraBattleHistories)),
        [BattleListType.Private]: ()=>this.request(Queries.PrivateBattleHistoriesQuery).then((r)=>getIdsFromGroups(r.privateBattleHistories)),
        [BattleListType.Coop]: ()=>this.request(Queries.CoopHistoryQuery).then((r)=>getIdsFromGroups(r.coopResult))
    };
    async checkToken() {
        const state = this.profile.state;
        if (!state.loginState?.sessionToken || !state.loginState?.bulletToken || !state.loginState?.gToken) {
            return false;
        }
        try {
            await this.request(Queries.HomeQuery);
            return true;
        } catch (_e) {
            return false;
        }
    }
    async getBattleList(battleListType = BattleListType.Latest) {
        return await this.BATTLE_LIST_TYPE_MAP[battleListType]();
    }
    getBattleDetail(id) {
        return this.request(Queries.VsHistoryDetailQuery, {
            vsResultId: id
        });
    }
    getCoopDetail(id) {
        return this.request(Queries.CoopHistoryDetailQuery, {
            coopHistoryDetailId: id
        });
    }
    async getBankaraBattleHistories() {
        const resp = await this.request(Queries.BankaraBattleHistoriesQuery);
        return resp;
    }
    async getXBattleHistories() {
        return await this.request(Queries.XBattleHistoriesQuery);
    }
    async getCoopHistories() {
        const resp = await this.request(Queries.CoopHistoryQuery);
        return resp;
    }
    async getGearPower() {
        const resp = await this.request(Queries.myOutfitCommonDataFilteringConditionQuery);
        return resp;
    }
    async getLatestBattleHistoriesQuery() {
        const resp = await this.request(Queries.LatestBattleHistoriesQuery);
        return resp;
    }
    async getGears() {
        const resp = await this.request(Queries.myOutfitCommonDataEquipmentsQuery);
        return resp;
    }
    async getSummary() {
        const ConfigureAnalyticsQuery = await this.request(Queries.ConfigureAnalyticsQuery);
        const HistoryRecordQuery = await this.request(Queries.HistoryRecordQuery);
        const CoopHistoryQuery = await this.request(Queries.CoopHistoryQuery);
        const getFirstBattleId = async ()=>{
            const latest = await this.request(Queries.LatestBattleHistoriesQuery);
            const id = latest?.latestBattleHistories?.historyGroups?.nodes?.[0]?.historyDetails?.nodes?.[0]?.id;
            return id;
        };
        const id = CoopHistoryQuery?.coopResult?.historyGroups?.nodes?.[0]?.historyDetails?.nodes?.[0]?.id ?? await getFirstBattleId();
        if (!id) {
            throw new Error("No battle id found");
        }
        const { uid  } = parseHistoryDetailId(id);
        return {
            uid,
            ConfigureAnalyticsQuery,
            HistoryRecordQuery,
            CoopHistoryQuery
        };
    }
}
function getIdsFromGroups({ historyGroups  }) {
    return historyGroups.nodes.flatMap((i)=>i.historyDetails.nodes).map((i)=>i.id);
}
function isTokenExpired(e) {
    if (e instanceof APIError) {
        return e.response.status === 401;
    } else {
        return false;
    }
}
class MemoryCache {
    cache = {};
    async read(key) {
        return this.cache[key];
    }
    async write(key, value) {
        this.cache[key] = value;
    }
}
class FileCache {
    constructor(path){
        this.path = path;
    }
    async getPath(key) {
        await Deno.mkdir(this.path, {
            recursive: true
        });
        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
        const hashHex = Array.from(new Uint8Array(hash)).map((b)=>b.toString(16).padStart(2, "0")).join("");
        return mod10.join(this.path, hashHex);
    }
    async read(key) {
        const path = await this.getPath(key);
        try {
            const data = await Deno.readTextFile(path);
            return JSON.parse(data);
        } catch (e) {
            if (e instanceof Deno.errors.NotFound) {
                return undefined;
            }
            throw e;
        }
    }
    async write(key, value) {
        const path = await this.getPath(key);
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(value));
        const swapPath = `${path}.swap`;
        await Deno.writeFile(swapPath, data);
        await Deno.rename(swapPath, path);
    }
    path;
}
const COOP_POINT_MAP = {
    0: -20,
    1: -10,
    2: 0,
    3: 20
};
async function checkResponse(resp) {
    if (Math.floor(resp.status / 100) !== 2) {
        const json = await resp.json().catch(()=>undefined);
        throw new APIError({
            response: resp,
            json,
            message: "Failed to fetch data from stat.ink"
        });
    }
}
class StatInkAPI {
    statInk;
    FETCH_LOCK;
    cache;
    constructor(statInkApiKey, env){
        this.statInkApiKey = statInkApiKey;
        this.env = env;
        this.statInk = "https://stat.ink";
        this.FETCH_LOCK = new Mutex();
        this.cache = {};
        this._salmonWeaponMap = new Map();
        this.getSalmonWeapon = ()=>this._getCached(`${this.statInk}/api/v3/salmon/weapon?full=1`);
        this.getWeapon = ()=>this._getCached(`${this.statInk}/api/v3/weapon?full=1`);
        this.getAbility = ()=>this._getCached(`${this.statInk}/api/v3/ability?full=1`);
        this.getStage = ()=>this._getCached(`${this.statInk}/api/v3/stage`);
        if (statInkApiKey.length !== 43) {
            throw new Error("Invalid stat.ink API key");
        }
    }
    requestHeaders() {
        return {
            "User-Agent": USERAGENT,
            "Authorization": `Bearer ${this.statInkApiKey}`
        };
    }
    async uuidList(type) {
        const fetch = this.env.newFetcher();
        const response = await fetch.get({
            url: type === "VsInfo" ? `${this.statInk}/api/v3/s3s/uuid-list` : `${this.statInk}/api/v3/salmon/uuid-list`,
            headers: this.requestHeaders()
        });
        await checkResponse(response);
        const uuidResult = await response.json();
        if (!Array.isArray(uuidResult)) {
            throw new APIError({
                response,
                json: uuidResult,
                message: uuidResult.message
            });
        }
        return uuidResult;
    }
    async postBattle(body) {
        const fetch = this.env.newFetcher();
        const resp = await fetch.post({
            url: `${this.statInk}/api/v3/battle`,
            headers: {
                ...this.requestHeaders(),
                "Content-Type": "application/x-msgpack"
            },
            body: mod7.encode(body)
        });
        const json = await resp.json().catch(()=>({}));
        if (resp.status !== 200 && resp.status !== 201) {
            throw new APIError({
                response: resp,
                message: "Failed to export battle",
                json
            });
        }
        if (json.error) {
            throw new APIError({
                response: resp,
                message: "Failed to export battle",
                json
            });
        }
        return json;
    }
    async postCoop(body) {
        const fetch = this.env.newFetcher();
        const resp = await fetch.post({
            url: `${this.statInk}/api/v3/salmon`,
            headers: {
                ...this.requestHeaders(),
                "Content-Type": "application/x-msgpack"
            },
            body: mod7.encode(body)
        });
        const json = await resp.json().catch(()=>({}));
        if (resp.status !== 200 && resp.status !== 201) {
            throw new APIError({
                response: resp,
                message: "Failed to export battle",
                json
            });
        }
        if (json.error) {
            throw new APIError({
                response: resp,
                message: "Failed to export battle",
                json
            });
        }
        return json;
    }
    async _getCached(url) {
        const release = await this.FETCH_LOCK.acquire();
        try {
            if (this.cache[url]) {
                return this.cache[url];
            }
            const fetch = this.env.newFetcher();
            const resp = await fetch.get({
                url,
                headers: this.requestHeaders()
            });
            await checkResponse(resp);
            const json = await resp.json();
            this.cache[url] = json;
            return json;
        } finally{
            release();
        }
    }
    _getAliasName(name) {
        const STAT_INK_DOT = "·";
        const SPLATNET_DOT = "‧";
        if (name.includes(STAT_INK_DOT)) {
            return [
                name,
                name.replaceAll(STAT_INK_DOT, SPLATNET_DOT)
            ];
        } else {
            return [
                name
            ];
        }
    }
    _salmonWeaponMap;
    async getSalmonWeaponMap() {
        if (this._salmonWeaponMap.size === 0) {
            const weapons = await this.getSalmonWeapon();
            for (const weapon of weapons){
                for (const name of Object.values(weapon.name).flatMap((n)=>this._getAliasName(n))){
                    const prevKey = this._salmonWeaponMap.get(name);
                    if (prevKey !== undefined && prevKey !== weapon.key) {
                        console.warn(`Duplicate weapon name: ${name}`);
                    }
                    this._salmonWeaponMap.set(name, weapon.key);
                }
            }
            if (this._salmonWeaponMap.size === 0) {
                throw new Error("Failed to get salmon weapon map");
            }
        }
        return this._salmonWeaponMap;
    }
    getSalmonWeapon;
    getWeapon;
    getAbility;
    getStage;
    statInkApiKey;
    env;
}
class StatInkExporter {
    name = "stat.ink";
    api;
    uploadMode;
    constructor({ statInkApiKey , uploadMode , env  }){
        this.api = new StatInkAPI(statInkApiKey, env);
        this.uploadMode = uploadMode;
    }
    isTriColor({ vsMode  }) {
        return vsMode.mode === "FEST" && b64Number(vsMode.id) === 8;
    }
    async exportGame(game) {
        if (game.type === "VsInfo" && this.isTriColor(game.detail)) {
            return {
                status: "skip",
                reason: "Tri-color fest is not supported"
            };
        }
        if (game.type === "VsInfo") {
            const body = await this.mapBattle(game);
            const { url  } = await this.api.postBattle(body);
            return {
                status: "success",
                url
            };
        } else {
            const body1 = await this.mapCoop(game);
            const { url: url1  } = await this.api.postCoop(body1);
            return {
                status: "success",
                url: url1
            };
        }
    }
    async notExported({ type , list  }) {
        const uuid = await this.api.uuidList(type);
        const out = [];
        for (const id of list){
            const s3sId = await gameId(id);
            const s3siId = await s3siGameId(id);
            const s3sCoopId = await s3sCoopGameId(id);
            if (!uuid.includes(s3sId) && !uuid.includes(s3siId) && !uuid.includes(s3sCoopId)) {
                out.push(id);
            }
        }
        return out;
    }
    mapLobby(vsDetail) {
        const { mode: vsMode  } = vsDetail.vsMode;
        if (vsMode === "REGULAR") {
            return "regular";
        } else if (vsMode === "BANKARA") {
            const { mode  } = vsDetail.bankaraMatch ?? {
                mode: "UNKNOWN"
            };
            const map = {
                OPEN: "bankara_open",
                CHALLENGE: "bankara_challenge",
                UNKNOWN: ""
            };
            const result = map[mode];
            if (result) {
                return result;
            }
        } else if (vsMode === "PRIVATE") {
            return "private";
        } else if (vsMode === "FEST") {
            const modeId = b64Number(vsDetail.vsMode.id);
            if (modeId === 6) {
                return "splatfest_open";
            } else if (modeId === 7) {
                return "splatfest_challenge";
            } else if (modeId === 8) {
                throw new Error("Tri-color battle is not supported");
            }
        } else if (vsMode === "X_MATCH") {
            return "xmatch";
        }
        throw new TypeError(`Unknown vsMode ${vsMode}`);
    }
    async mapStage({ vsStage  }) {
        const id = b64Number(vsStage.id).toString();
        const stage = await this.api.getStage();
        const result = stage.find((s)=>s.aliases.includes(id));
        if (!result) {
            throw new Error("Unknown stage: " + vsStage.name);
        }
        return result.key;
    }
    async mapGears({ headGear , clothingGear , shoesGear  }) {
        const amap = (await this.api.getAbility()).map((i)=>({
                ...i,
                names: Object.values(i.name)
            }));
        const mapAbility = ({ name  })=>{
            const result = amap.find((a)=>a.names.includes(name));
            if (!result) {
                return null;
            }
            return result.key;
        };
        const mapGear = ({ primaryGearPower , additionalGearPowers  })=>{
            const primary = mapAbility(primaryGearPower);
            if (!primary) {
                throw new Error("Unknown ability: " + primaryGearPower.name);
            }
            return {
                primary_ability: primary,
                secondary_abilities: additionalGearPowers.map(mapAbility)
            };
        };
        return {
            headgear: mapGear(headGear),
            clothing: mapGear(clothingGear),
            shoes: mapGear(shoesGear)
        };
    }
    mapPlayer = async (player, index)=>{
        const result = {
            me: player.isMyself ? "yes" : "no",
            rank_in_team: index + 1,
            name: player.name,
            number: player.nameId ?? undefined,
            splashtag_title: player.byname,
            weapon: b64Number(player.weapon.id).toString(),
            inked: player.paint,
            gears: await this.mapGears(player),
            disconnected: player.result ? "no" : "yes"
        };
        if (player.result) {
            result.kill_or_assist = player.result.kill;
            result.assist = player.result.assist;
            result.kill = result.kill_or_assist - result.assist;
            result.death = player.result.death;
            result.special = player.result.special;
        }
        return result;
    };
    async mapBattle({ groupInfo , challengeProgress , bankaraMatchChallenge , listNode , detail: vsDetail , rankBeforeState , rankState  }) {
        const { knockout , vsRule: { rule  } , myTeam , otherTeams , bankaraMatch , festMatch , playedTime  } = vsDetail;
        const self = vsDetail.myTeam.players.find((i)=>i.isMyself);
        if (!self) {
            throw new Error("Self not found");
        }
        const startedAt = Math.floor(new Date(playedTime).getTime() / 1000);
        const result = {
            uuid: await gameId(vsDetail.id),
            lobby: this.mapLobby(vsDetail),
            rule: SPLATNET3_STATINK_MAP.RULE[vsDetail.vsRule.rule],
            stage: await this.mapStage(vsDetail),
            result: SPLATNET3_STATINK_MAP.RESULT[vsDetail.judgement],
            weapon: b64Number(self.weapon.id).toString(),
            inked: self.paint,
            rank_in_team: vsDetail.myTeam.players.indexOf(self) + 1,
            medals: vsDetail.awards.map((i)=>i.name),
            our_team_players: await Promise.all(myTeam.players.map(this.mapPlayer)),
            their_team_players: await Promise.all(otherTeams.flatMap((i)=>i.players).map(this.mapPlayer)),
            agent: AGENT_NAME,
            agent_version: S3SI_VERSION,
            agent_variables: {
                "Upload Mode": this.uploadMode
            },
            automated: "yes",
            start_at: startedAt,
            end_at: startedAt + vsDetail.duration
        };
        if (self.result) {
            result.kill_or_assist = self.result.kill;
            result.assist = self.result.assist;
            result.kill = result.kill_or_assist - result.assist;
            result.death = self.result.death;
            result.special = self.result.special;
        }
        if (festMatch) {
            result.fest_dragon = SPLATNET3_STATINK_MAP.DRAGON[festMatch.dragonMatchType];
            result.clout_change = festMatch.contribution;
            result.fest_power = festMatch.myFestPower ?? undefined;
        }
        if (rule === "TURF_WAR") {
            result.our_team_percent = (myTeam?.result?.paintRatio ?? 0) * 100;
            result.their_team_percent = (otherTeams?.[0]?.result?.paintRatio ?? 0) * 100;
            result.our_team_inked = myTeam.players.reduce((acc, i)=>acc + i.paint, 0);
            result.their_team_inked = otherTeams?.[0].players.reduce((acc, i)=>acc + i.paint, 0);
        }
        if (knockout) {
            result.knockout = knockout === "NEITHER" ? "no" : "yes";
        }
        result.our_team_count = myTeam?.result?.score ?? undefined;
        result.their_team_count = otherTeams?.[0]?.result?.score ?? undefined;
        result.rank_exp_change = bankaraMatch?.earnedUdemaePoint ?? undefined;
        if (listNode?.udemae) {
            [result.rank_before, result.rank_before_s_plus] = parseUdemae(listNode.udemae);
        }
        if (bankaraMatchChallenge && challengeProgress) {
            result.rank_up_battle = bankaraMatchChallenge.isPromo ? "yes" : "no";
            if (challengeProgress.index === 0 && bankaraMatchChallenge.udemaeAfter) {
                [result.rank_after, result.rank_after_s_plus] = parseUdemae(bankaraMatchChallenge.udemaeAfter);
                result.rank_exp_change = bankaraMatchChallenge.earnedUdemaePoint ?? undefined;
            } else {
                result.rank_after = result.rank_before;
                result.rank_after_s_plus = result.rank_before_s_plus;
            }
        }
        if (challengeProgress) {
            result.challenge_win = challengeProgress.winCount;
            result.challenge_lose = challengeProgress.loseCount;
        }
        if (vsDetail.xMatch) {
            result.x_power_before = result.x_power_after = vsDetail.xMatch.lastXPower;
            if (groupInfo?.xMatchMeasurement && groupInfo?.xMatchMeasurement.state === "COMPLETED" && challengeProgress?.index === 0) {
                result.x_power_after = groupInfo.xMatchMeasurement.xPowerAfter;
            }
        }
        if (rankBeforeState && rankState) {
            result.rank_before_exp = rankBeforeState.rankPoint;
            result.rank_after_exp = rankState.rankPoint;
            if (!bankaraMatchChallenge?.isUdemaeUp && result.rank_exp_change === undefined) {
                result.rank_exp_change = result.rank_after_exp - result.rank_before_exp;
            } else if (bankaraMatchChallenge?.isUdemaeUp && bankaraMatchChallenge.earnedUdemaePoint) {
                result.rank_before_exp = result.rank_after_exp - bankaraMatchChallenge.earnedUdemaePoint;
                result.rank_exp_change = undefined;
            }
            if (!result.rank_after) {
                [result.rank_after, result.rank_after_s_plus] = parseUdemae(rankState.rank);
            }
        }
        return result;
    }
    isRandom(image) {
        const RANDOM_FILENAME = "473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1";
        const url = image?.url;
        if (typeof url === "string") {
            return url.includes(RANDOM_FILENAME);
        } else if (url === undefined || url === null) {
            return false;
        } else {
            return url.pathname.includes(RANDOM_FILENAME);
        }
    }
    async mapCoopWeapon({ name , image  }) {
        const weaponMap = await this.api.getSalmonWeaponMap();
        const weapon = weaponMap.get(name);
        if (!weapon) {
            if (this.isRandom(image)) {
                return null;
            }
            throw new Error(`Weapon not found: ${name}`);
        }
        return weapon;
    }
    mapSpecial({ name , image  }) {
        const { url  } = image;
        const imageName = typeof url === "object" ? url.pathname : url ?? "";
        const hash = /\/(\w+)_0\.\w+/.exec(imageName)?.[1] ?? "";
        const special = SPLATNET3_STATINK_MAP.COOP_SPECIAL_MAP[hash];
        if (!special) {
            if (this.isRandom(image)) {
                return Promise.resolve(undefined);
            }
            throw new Error(`Special not found: ${name} (${imageName})`);
        }
        return Promise.resolve(special);
    }
    async mapCoopPlayer(isMyself, { player , weapons , specialWeapon , defeatEnemyCount , deliverCount , goldenAssistCount , goldenDeliverCount , rescueCount , rescuedCount  }) {
        const disconnected = [
            goldenDeliverCount,
            deliverCount,
            rescueCount,
            rescuedCount,
            defeatEnemyCount
        ].every((v)=>v === 0) || !specialWeapon;
        return {
            me: isMyself ? "yes" : "no",
            name: player.name,
            number: player.nameId,
            splashtag_title: player.byname,
            uniform: SPLATNET3_STATINK_MAP.COOP_UNIFORM_MAP[b64Number(player.uniform.id)],
            special: specialWeapon ? await this.mapSpecial(specialWeapon) : undefined,
            weapons: await Promise.all(weapons.map((w)=>this.mapCoopWeapon(w))),
            golden_eggs: goldenDeliverCount,
            golden_assist: goldenAssistCount,
            power_eggs: deliverCount,
            rescue: rescueCount,
            rescued: rescuedCount,
            defeat_boss: defeatEnemyCount,
            disconnected: disconnected ? "yes" : "no"
        };
    }
    mapKing(id) {
        if (!id) {
            return undefined;
        }
        const nid = b64Number(id).toString();
        return nid;
    }
    async mapWave(wave) {
        const event = wave.eventWave ? SPLATNET3_STATINK_MAP.COOP_EVENT_MAP[b64Number(wave.eventWave.id)] : undefined;
        const special_uses = (await Promise.all(wave.specialWeapons.map((w)=>this.mapSpecial(w)))).flatMap((key)=>key ? [
                key
            ] : []).reduce((p, key)=>({
                ...p,
                [key]: (p[key] ?? 0) + 1
            }), {});
        return {
            tide: SPLATNET3_STATINK_MAP.WATER_LEVEL_MAP[wave.waterLevel],
            event,
            golden_quota: wave.deliverNorm,
            golden_appearances: wave.goldenPopCount,
            golden_delivered: wave.teamDeliverCount,
            special_uses
        };
    }
    async mapCoop({ groupInfo , detail  }) {
        const { dangerRate , resultWave , bossResult , myResult , memberResults , scale , playedTime , enemyResults , smellMeter  } = detail;
        const startedAt = Math.floor(new Date(playedTime).getTime() / 1000);
        const golden_eggs = myResult.goldenDeliverCount + memberResults.reduce((acc, i)=>acc + i.goldenDeliverCount, 0);
        const power_eggs = myResult.deliverCount + memberResults.reduce((p, i)=>p + i.deliverCount, 0);
        const bosses = Object.fromEntries(enemyResults.map((i)=>[
                b64Number(i.enemy.id),
                {
                    appearances: i.popCount,
                    defeated: i.teamDefeatCount,
                    defeated_by_me: i.defeatCount
                }
            ]));
        const title_after = detail.afterGrade ? b64Number(detail.afterGrade.id).toString() : undefined;
        const title_exp_after = detail.afterGradePoint;
        let clear_waves;
        if (detail.waveResults.length > 0) {
            clear_waves = detail.waveResults.filter((i)=>i.waveNumber < 4).length - 1 + (resultWave === 0 ? 1 : 0);
        } else {
            clear_waves = 0;
        }
        let title_before = undefined;
        let title_exp_before = undefined;
        const expDiff = COOP_POINT_MAP[clear_waves];
        if (nonNullable(title_after) && nonNullable(title_exp_after) && nonNullable(expDiff)) {
            if (title_exp_after === 40 && expDiff === 20) {} else if (title_exp_after === 40 && expDiff < 0 && title_after !== "8") {} else if (title_exp_after === 999 && expDiff !== 0) {
                title_before = title_after;
            } else {
                if (title_exp_after - expDiff >= 0) {
                    title_before = title_after;
                    title_exp_before = title_exp_after - expDiff;
                } else {
                    title_before = (parseInt(title_after) - 1).toString();
                }
            }
        }
        let fail_reason = null;
        if (clear_waves !== 3 && detail.waveResults.length > 0) {
            const lastWave = detail.waveResults[detail.waveResults.length - 1];
            if (lastWave.teamDeliverCount >= lastWave.deliverNorm) {
                fail_reason = "wipe_out";
            }
        }
        const result = {
            uuid: await gameId(detail.id),
            private: groupInfo?.mode === "PRIVATE_CUSTOM" ? "yes" : "no",
            big_run: "no",
            stage: b64Number(detail.coopStage.id).toString(),
            danger_rate: dangerRate * 100,
            clear_waves,
            fail_reason,
            king_smell: smellMeter,
            king_salmonid: this.mapKing(detail.bossResult?.boss.id),
            clear_extra: bossResult?.hasDefeatBoss ? "yes" : "no",
            title_before,
            title_exp_before,
            title_after,
            title_exp_after,
            golden_eggs,
            power_eggs,
            gold_scale: scale?.gold,
            silver_scale: scale?.silver,
            bronze_scale: scale?.bronze,
            job_point: detail.jobPoint,
            job_score: detail.jobScore,
            job_rate: detail.jobRate,
            job_bonus: detail.jobBonus,
            waves: await Promise.all(detail.waveResults.map((w)=>this.mapWave(w))),
            players: await Promise.all([
                this.mapCoopPlayer(true, myResult),
                ...memberResults.map((p)=>this.mapCoopPlayer(false, p))
            ]),
            bosses,
            agent: AGENT_NAME,
            agent_version: S3SI_VERSION,
            agent_variables: {
                "Upload Mode": this.uploadMode
            },
            automated: "yes",
            start_at: startedAt
        };
        return result;
    }
}
function parseUdemae(udemae) {
    const [rank, rankNum] = udemae.split(/([0-9]+)/);
    return [
        rank.toLowerCase(),
        rankNum === undefined ? undefined : parseInt(rankNum)
    ];
}
function replacer(key, value) {
    if (![
        "url",
        "maskImageUrl",
        "overlayImageUrl"
    ].includes(key)) {
        return value;
    }
    return typeof value === "string" ? urlSimplify(value) : undefined;
}
class FileExporter {
    name;
    constructor(exportPath){
        this.exportPath = exportPath;
        this.name = "file";
    }
    getFilenameById(id) {
        const { uid , timestamp  } = parseHistoryDetailId(id);
        return `${uid}_${timestamp}Z.json`;
    }
    async exportedGames({ uid , type  }) {
        const out = [];
        for await (const entry of Deno.readDir(this.exportPath)){
            const filename = entry.name;
            const [fileUid, timestamp] = filename.split("_", 2);
            if (!entry.isFile || fileUid !== uid) {
                continue;
            }
            const filepath = mod10.join(this.exportPath, filename);
            const content = await Deno.readTextFile(filepath);
            const body = JSON.parse(content);
            if (body.type === "SUMMARY") {
                continue;
            }
            if (body.type === "VS" && type === "VsInfo") {
                out.push({
                    id: body.data.detail.id,
                    filepath,
                    timestamp
                });
            } else if (body.type === "COOP" && type === "CoopInfo") {
                out.push({
                    id: body.data.detail.id,
                    filepath,
                    timestamp
                });
            }
        }
        return out.sort((a, b)=>b.timestamp.localeCompare(a.timestamp)).map(({ id , filepath  })=>({
                id,
                getContent: async ()=>{
                    const content = await Deno.readTextFile(filepath);
                    const body = JSON.parse(content);
                    return body.data;
                }
            }));
    }
    async exportSummary(summary) {
        const filename = `${summary.uid}_summary.json`;
        const filepath = mod10.join(this.exportPath, filename);
        const body = {
            type: "SUMMARY",
            nsoVersion: NSOAPP_VERSION,
            s3siVersion: S3SI_VERSION,
            exportTime: new Date().toISOString(),
            data: summary
        };
        await Deno.writeTextFile(filepath, JSON.stringify(body));
        return {
            status: "success",
            url: filepath
        };
    }
    async exportGame(info) {
        await Deno.mkdir(this.exportPath, {
            recursive: true
        });
        const filename = this.getFilenameById(info.detail.id);
        const filepath = mod10.join(this.exportPath, filename);
        const common = {
            nsoVersion: NSOAPP_VERSION,
            s3siVersion: S3SI_VERSION,
            exportTime: new Date().toISOString()
        };
        const dataType = info.type === "VsInfo" ? {
            type: "VS",
            data: info
        } : {
            type: "COOP",
            data: info
        };
        const body = {
            ...common,
            ...dataType
        };
        await Deno.writeTextFile(filepath, JSON.stringify(body, replacer));
        return {
            status: "success",
            url: filepath
        };
    }
    async notExported({ list  }) {
        const out = [];
        for (const id of list){
            const filename = this.getFilenameById(id);
            const filepath = mod10.join(this.exportPath, filename);
            const isFile = await Deno.stat(filepath).then((f)=>f.isFile).catch(()=>false);
            if (!isFile) {
                out.push(id);
            }
        }
        return out;
    }
    exportPath;
}
const splusParams = ()=>{
    const out = [];
    for(let i = 0; i < 50; i++){
        const level = i % 10;
        const item = {
            rank: `S+${i}`,
            pointRange: [
                300 + level * 350,
                300 + (level + 1) * 350
            ],
            charge: 180
        };
        if (level === 9) {
            item.promotion = true;
        }
        out.push(item);
    }
    out.push({
        rank: "S+50",
        pointRange: [
            0,
            9999
        ],
        charge: 180
    });
    return out;
};
const RANK_PARAMS = [
    {
        rank: "C-",
        pointRange: [
            0,
            200
        ],
        charge: 0
    },
    {
        rank: "C",
        pointRange: [
            200,
            400
        ],
        charge: 20
    },
    {
        rank: "C+",
        pointRange: [
            400,
            600
        ],
        charge: 40,
        promotion: true
    },
    {
        rank: "B-",
        pointRange: [
            100,
            350
        ],
        charge: 55
    },
    {
        rank: "B",
        pointRange: [
            350,
            600
        ],
        charge: 70
    },
    {
        rank: "B+",
        pointRange: [
            600,
            850
        ],
        charge: 85,
        promotion: true
    },
    {
        rank: "A-",
        pointRange: [
            200,
            500
        ],
        charge: 110
    },
    {
        rank: "A",
        pointRange: [
            500,
            800
        ],
        charge: 120
    },
    {
        rank: "A+",
        pointRange: [
            800,
            1100
        ],
        charge: 130,
        promotion: true
    },
    {
        rank: "S",
        pointRange: [
            300,
            1000
        ],
        charge: 170,
        promotion: true
    },
    ...splusParams()
];
function addRank(state, delta) {
    const { rank , rankPoint  } = state;
    const { gameId , timestamp , rankAfter , isPromotion , isRankUp , isChallengeFirst  } = delta;
    const rankIndex = RANK_PARAMS.findIndex((r)=>r.rank === rank);
    if (rankIndex === -1) {
        throw new Error(`Rank not found: ${rank}`);
    }
    const rankParam = RANK_PARAMS[rankIndex];
    if (isChallengeFirst) {
        return {
            gameId,
            timestamp,
            rank,
            rankPoint: rankPoint - rankParam.charge
        };
    }
    if (rankIndex === RANK_PARAMS.length - 1) {
        return {
            timestamp,
            gameId,
            rank,
            rankPoint: Math.min(rankPoint + delta.rankPoint, rankParam.pointRange[1])
        };
    }
    if (isPromotion && isRankUp) {
        const nextRankParam = RANK_PARAMS[rankIndex + 1];
        return {
            gameId,
            timestamp,
            rank: nextRankParam.rank,
            rankPoint: nextRankParam.pointRange[0]
        };
    }
    return {
        gameId,
        timestamp,
        rank: rankAfter ?? rank,
        rankPoint: rankPoint + delta.rankPoint
    };
}
const battleTime = (id)=>{
    const { timestamp  } = parseHistoryDetailId(id);
    const dateStr = timestamp.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6Z");
    return new Date(dateStr);
};
function generateDeltaList(state, flatten) {
    const index = flatten.findIndex((i)=>i.gameId === state.gameId);
    if (index === -1) {
        return;
    }
    const unProcessed = flatten.slice(index);
    const deltaList = [];
    let beforeGameId = state.gameId;
    for (const i of unProcessed.slice(1)){
        if (!i.detail.bankaraMatch) {
            throw new TypeError("bankaraMatch must be defined");
        }
        let delta = {
            beforeGameId,
            gameId: i.gameId,
            timestamp: Math.floor(i.time.getTime() / 1000),
            rankPoint: 0,
            isPromotion: false,
            isRankUp: false,
            isChallengeFirst: false
        };
        beforeGameId = i.gameId;
        if (i.bankaraMatchChallenge) {
            if (i.index === 0 && i.bankaraMatchChallenge.state !== "INPROGRESS") {
                delta = {
                    ...delta,
                    rankAfter: i.bankaraMatchChallenge.udemaeAfter ?? undefined,
                    rankPoint: i.bankaraMatchChallenge.earnedUdemaePoint ?? 0,
                    isPromotion: i.bankaraMatchChallenge.isPromo ?? false,
                    isRankUp: i.bankaraMatchChallenge.isUdemaeUp ?? false,
                    isChallengeFirst: false
                };
            } else if (i.index === i.groupLength - 1) {
                delta = {
                    ...delta,
                    isChallengeFirst: true
                };
            }
        } else {
            delta = {
                ...delta,
                rankAfter: i.detail.udemae,
                rankPoint: i.detail.bankaraMatch?.earnedUdemaePoint ?? 0
            };
        }
        deltaList.push(delta);
    }
    return deltaList;
}
function getRankState(i) {
    const rank = i.detail.udemae;
    if (!rank) {
        throw new Error("rank must be defined");
    }
    const param = RANK_PARAMS.find((i)=>i.rank === rank);
    if (!param) {
        throw new Error(`Rank not found: ${rank}`);
    }
    return {
        gameId: i.gameId,
        timestamp: Math.floor(i.time.getTime() / 1000),
        rank,
        rankPoint: -1
    };
}
class RankTracker {
    deltaMap;
    constructor(state){
        this.state = state;
        this.deltaMap = new Map();
    }
    async getRankStateById(id) {
        if (!this.state) {
            return;
        }
        const gid = await gameId(id);
        let cur = this.state;
        let before = cur;
        if (cur.gameId === gid) {
            return;
        }
        while(cur.gameId !== gid){
            const delta = this.deltaMap.get(cur.gameId);
            if (!delta) {
                return;
            }
            before = cur;
            cur = addRank(cur, delta);
        }
        return {
            before,
            after: cur
        };
    }
    setState(state) {
        this.state = state;
    }
    async updateState(history) {
        const flatten = await Promise.all(history.flatMap(({ historyDetails , bankaraMatchChallenge  })=>{
            return historyDetails.nodes.map((j, index)=>({
                    id: j.id,
                    time: battleTime(j.id),
                    gameId: gameId(j.id),
                    bankaraMatchChallenge,
                    index,
                    groupLength: historyDetails.nodes.length,
                    detail: j
                }));
        }).sort((a, b)=>a.time.getTime() - b.time.getTime()).map((i)=>i.gameId.then((gameId)=>({
                    ...i,
                    gameId
                }))));
        const gameIdTime = new Map(flatten.map((i)=>[
                i.gameId,
                i.time
            ]));
        let curState;
        const oldestPromotion = flatten.find((i)=>i.bankaraMatchChallenge?.isPromo && i.bankaraMatchChallenge.isUdemaeUp);
        const thisStateTime = gameIdTime.get(this.state?.gameId);
        if (!thisStateTime && !oldestPromotion) {
            return;
        } else if (thisStateTime && !oldestPromotion) {
            curState = this.state;
        } else if (!thisStateTime && oldestPromotion) {
            curState = getRankState(oldestPromotion);
        } else if (thisStateTime && oldestPromotion) {
            if (thisStateTime <= oldestPromotion.time) {
                curState = this.state;
            } else {
                curState = getRankState(oldestPromotion);
            }
        }
        if (!curState) {
            return;
        }
        this.state = curState;
        const deltaList = generateDeltaList(curState, flatten);
        if (!deltaList) {
            return;
        }
        for (const delta of deltaList){
            this.deltaMap.set(delta.beforeGameId, delta);
            curState = addRank(curState, delta);
        }
        return curState;
    }
    state;
}
class GameFetcher {
    _splatnet;
    cache;
    rankTracker;
    lock = {};
    bankaraLock = new Mutex();
    bankaraHistory;
    coopLock = new Mutex();
    coopHistory;
    xMatchLock = new Mutex();
    xMatchHistory;
    constructor({ cache =new MemoryCache() , splatnet , state  }){
        this._splatnet = splatnet;
        this.cache = cache;
        this.rankTracker = new RankTracker(state.rankState);
    }
    get splatnet() {
        if (!this._splatnet) {
            throw new Error("splatnet is not set");
        }
        return this._splatnet;
    }
    getLock(id) {
        let cur = this.lock[id];
        if (!cur) {
            cur = new Mutex();
            this.lock[id] = cur;
        }
        return cur;
    }
    setRankState(state) {
        this.rankTracker.setState(state);
    }
    async updateRank() {
        const finalState = await this.rankTracker.updateState(await this.getBankaraHistory());
        return finalState;
    }
    getRankStateById(id) {
        return this.rankTracker.getRankStateById(id);
    }
    getXMatchHistory() {
        if (!this._splatnet) {
            return [];
        }
        return this.xMatchLock.use(async ()=>{
            if (this.xMatchHistory) {
                return this.xMatchHistory;
            }
            const { xBattleHistories: { historyGroups  }  } = await this.splatnet.getXBattleHistories();
            this.xMatchHistory = historyGroups.nodes;
            return this.xMatchHistory;
        });
    }
    getBankaraHistory() {
        if (!this._splatnet) {
            return [];
        }
        return this.bankaraLock.use(async ()=>{
            if (this.bankaraHistory) {
                return this.bankaraHistory;
            }
            const { bankaraBattleHistories: { historyGroups  }  } = await this.splatnet.getBankaraBattleHistories();
            this.bankaraHistory = historyGroups.nodes;
            return this.bankaraHistory;
        });
    }
    getCoopHistory() {
        if (!this._splatnet) {
            return [];
        }
        return this.coopLock.use(async ()=>{
            if (this.coopHistory) {
                return this.coopHistory;
            }
            const { coopResult: { historyGroups  }  } = await this.splatnet.getCoopHistories();
            this.coopHistory = historyGroups.nodes;
            return this.coopHistory;
        });
    }
    async getCoopMetaById(id) {
        const coopHistory = this._splatnet ? await this.getCoopHistory() : [];
        const group = coopHistory.find((i)=>i.historyDetails.nodes.some((i)=>i.id === id));
        if (!group) {
            return {
                type: "CoopInfo",
                listNode: null,
                groupInfo: null
            };
        }
        const { historyDetails , ...groupInfo } = group;
        const listNode = historyDetails.nodes.find((i)=>i.id === id) ?? null;
        return {
            type: "CoopInfo",
            listNode,
            groupInfo
        };
    }
    async getBattleMetaById(id, vsMode) {
        const gid = await gameId(id);
        const gameIdMap = new Map();
        let group = null;
        let listNode = null;
        if (vsMode === "BANKARA" || vsMode === "X_MATCH") {
            const bankaraHistory = vsMode === "BANKARA" ? await this.getBankaraHistory() : await this.getXMatchHistory();
            for (const i of bankaraHistory){
                for (const j of i.historyDetails.nodes){
                    gameIdMap.set(j, await gameId(j.id));
                }
            }
            group = bankaraHistory.find((i)=>i.historyDetails.nodes.some((i)=>gameIdMap.get(i) === gid)) ?? null;
        }
        if (!group) {
            return {
                type: "VsInfo",
                challengeProgress: null,
                bankaraMatchChallenge: null,
                listNode: null,
                rankState: null,
                rankBeforeState: null,
                groupInfo: null
            };
        }
        const { bankaraMatchChallenge , xMatchMeasurement  } = group;
        const { historyDetails , ...groupInfo } = group;
        listNode = historyDetails.nodes.find((i)=>gameIdMap.get(i) === gid) ?? null;
        const index = historyDetails.nodes.indexOf(listNode);
        let challengeProgress = null;
        const challengeOrMeasurement = bankaraMatchChallenge || xMatchMeasurement;
        if (challengeOrMeasurement) {
            const pastBattles = historyDetails.nodes.slice(0, index);
            const { winCount , loseCount  } = challengeOrMeasurement;
            challengeProgress = {
                index,
                winCount: winCount - pastBattles.filter((i)=>i.judgement == "WIN").length,
                loseCount: loseCount - pastBattles.filter((i)=>[
                        "LOSE",
                        "DEEMED_LOSE"
                    ].includes(i.judgement)).length
            };
        }
        const { before , after  } = await this.rankTracker.getRankStateById(id) ?? {};
        return {
            type: "VsInfo",
            bankaraMatchChallenge,
            listNode,
            challengeProgress,
            rankState: after ?? null,
            rankBeforeState: before ?? null,
            groupInfo
        };
    }
    cacheDetail(id, getter) {
        const lock = this.getLock(id);
        return lock.use(async ()=>{
            const cached = await this.cache.read(id);
            if (cached) {
                return cached;
            }
            const detail = await getter();
            await this.cache.write(id, detail);
            return detail;
        });
    }
    fetch(type, id) {
        switch(type){
            case "VsInfo":
                return this.fetchBattle(id);
            case "CoopInfo":
                return this.fetchCoop(id);
            default:
                throw new Error(`Unknown game type: ${type}`);
        }
    }
    async fetchBattle(id) {
        const detail = await this.cacheDetail(id, ()=>this.splatnet.getBattleDetail(id).then((r)=>r.vsHistoryDetail));
        const metadata = await this.getBattleMetaById(id, detail.vsMode.mode);
        const game = {
            ...metadata,
            detail
        };
        return game;
    }
    async fetchCoop(id) {
        const detail = await this.cacheDetail(id, ()=>this.splatnet.getCoopDetail(id).then((r)=>r.coopHistoryDetail));
        const metadata = await this.getCoopMetaById(id);
        const game = {
            ...metadata,
            detail
        };
        return game;
    }
}
const DEFAULT_OPTS = {
    profilePath: "./profile.json",
    exporter: "stat.ink",
    noProgress: false,
    monitor: false,
    withSummary: false,
    env: DEFAULT_ENV
};
class StepProgress {
    currentUrl;
    total;
    exported;
    done;
    skipped;
    constructor(){
        this.total = 1;
        this.exported = 0;
        this.done = 0;
        this.skipped = {};
    }
}
function progress({ total , currentUrl , done  }) {
    return {
        total,
        currentUrl,
        current: done
    };
}
class App {
    profile;
    env;
    constructor(opts){
        this.opts = opts;
        const stateBackend = opts.stateBackend ?? new FileStateBackend(opts.profilePath);
        this.profile = new Profile({
            stateBackend,
            env: opts.env
        });
        this.env = opts.env;
    }
    getSkipMode() {
        const mode = this.opts.skipMode;
        if (mode === "vs") {
            return [
                "vs"
            ];
        } else if (mode === "coop") {
            return [
                "coop"
            ];
        }
        return [];
    }
    async getExporters() {
        const state = this.profile.state;
        const exporters = this.opts.exporter.split(",");
        const out = [];
        if (exporters.includes("stat.ink")) {
            if (!state.statInkApiKey) {
                const key = (await this.env.prompts.prompt("stat.ink API key is not set. Please enter below.")).trim();
                if (!key) {
                    this.env.logger.error("API key is required.");
                    Deno.exit(1);
                }
                await this.profile.writeState({
                    ...state,
                    statInkApiKey: key
                });
            }
            out.push(new StatInkExporter({
                statInkApiKey: this.profile.state.statInkApiKey,
                uploadMode: this.opts.monitor ? "Monitoring" : "Manual",
                env: this.env
            }));
        }
        if (exporters.includes("file")) {
            out.push(new FileExporter(state.fileExportPath));
        }
        return out;
    }
    exporterProgress(title) {
        const bar = !this.opts.noProgress ? new MultiProgressBar({
            title,
            display: "[:bar] :text :percent :time eta: :eta :completed/:total"
        }) : undefined;
        const allProgress = {};
        const redraw = (name, progress)=>{
            allProgress[name] = progress;
            if (bar) {
                bar.render(Object.entries(allProgress).map(([name, progress])=>({
                        completed: progress.current,
                        total: progress.total,
                        text: name
                    })));
            } else if (progress.currentUrl) {
                this.env.logger.log(`Battle exported to ${progress.currentUrl} (${progress.current}/${progress.total})`);
            }
        };
        const endBar = ()=>{
            bar?.end();
        };
        return {
            redraw,
            endBar
        };
    }
    async exportOnce() {
        const splatnet = new Splatnet3({
            profile: this.profile,
            env: this.env
        });
        const exporters = await this.getExporters();
        const initStats = ()=>Object.fromEntries(exporters.map((e)=>[
                    e.name,
                    new StepProgress()
                ]));
        let stats = initStats();
        const skipMode = this.getSkipMode();
        const errors = [];
        if (skipMode.includes("vs") || exporters.length === 0) {
            this.env.logger.log("Skip exporting VS games.");
        } else {
            this.env.logger.log("Fetching battle list...");
            const gameList = await splatnet.getBattleList();
            const { redraw , endBar  } = this.exporterProgress("Export vs games");
            const fetcher = new GameFetcher({
                cache: this.opts.cache ?? new FileCache(this.profile.state.cacheDir),
                state: this.profile.state,
                splatnet
            });
            const finalRankState = await fetcher.updateRank();
            await Promise.all(exporters.map((e)=>showError(this.env, this.exportGameList({
                    type: "VsInfo",
                    fetcher,
                    exporter: e,
                    gameList,
                    stepProgress: stats[e.name],
                    onStep: ()=>{
                        redraw(e.name, progress(stats[e.name]));
                    }
                })).catch((err)=>{
                    errors.push(err);
                    this.env.logger.error(`\nFailed to export to ${e.name}:`, err);
                })));
            endBar();
            this.printStats(stats);
            if (errors.length > 0) {
                throw errors[0];
            }
            fetcher.setRankState(finalRankState);
            await this.profile.writeState({
                ...this.profile.state,
                rankState: finalRankState
            });
        }
        stats = initStats();
        if (skipMode.includes("coop") || exporters.length === 0) {
            this.env.logger.log("Skip exporting coop games.");
        } else {
            this.env.logger.log("Fetching coop battle list...");
            const coopBattleList = await splatnet.getBattleList(BattleListType.Coop);
            const { redraw: redraw1 , endBar: endBar1  } = this.exporterProgress("Export coop games");
            const fetcher1 = new GameFetcher({
                cache: this.opts.cache ?? new FileCache(this.profile.state.cacheDir),
                state: this.profile.state,
                splatnet
            });
            await Promise.all(exporters.map((e)=>showError(this.env, this.exportGameList({
                    type: "CoopInfo",
                    fetcher: fetcher1,
                    exporter: e,
                    gameList: coopBattleList,
                    stepProgress: stats[e.name],
                    onStep: ()=>{
                        redraw1(e.name, progress(stats[e.name]));
                    }
                })).catch((err)=>{
                    errors.push(err);
                    this.env.logger.error(`\nFailed to export to ${e.name}:`, err);
                })));
            endBar1();
            this.printStats(stats);
            if (errors.length > 0) {
                throw errors[0];
            }
        }
        const summaryExporters = exporters.filter((e)=>e.exportSummary);
        if (!this.opts.withSummary || summaryExporters.length === 0) {
            this.env.logger.log("Skip exporting summary.");
        } else {
            this.env.logger.log("Fetching summary...");
            const summary = await splatnet.getSummary();
            await Promise.all(summaryExporters.map((e)=>showError(this.env, e.exportSummary(summary)).then((result)=>{
                    if (result.status === "success") {
                        this.env.logger.log(`Exported summary to ${result.url}`);
                    } else if (result.status === "skip") {
                        this.env.logger.log(`Skipped exporting summary to ${e.name}`);
                    } else {}
                }).catch((err)=>{
                    errors.push(err);
                    this.env.logger.error(`\nFailed to export to ${e.name}:`, err);
                })));
            if (errors.length > 0) {
                throw errors[0];
            }
        }
    }
    async monitor() {
        while(true){
            await this.exportOnce();
            await this.countDown(this.profile.state.monitorInterval);
        }
    }
    async countDown(sec) {
        const bar = !this.opts.noProgress ? new MultiProgressBar({
            title: "Killing time...",
            display: "[:bar] :completed/:total"
        }) : undefined;
        for (const i of Array(sec).keys()){
            bar?.render([
                {
                    completed: i,
                    total: sec
                }
            ]);
            await delay(1000);
        }
        bar?.end();
    }
    async run() {
        await this.profile.readState();
        if (!this.profile.state.loginState?.sessionToken) {
            const sessionToken = await loginManually(this.env);
            await this.profile.writeState({
                ...this.profile.state,
                loginState: {
                    ...this.profile.state.loginState,
                    sessionToken
                }
            });
        }
        if (this.opts.monitor) {
            await this.monitor();
        } else {
            await this.exportOnce();
        }
    }
    async exportGameList({ type , fetcher , exporter , gameList , stepProgress , onStep  }) {
        onStep?.();
        const workQueue = [
            ...await exporter.notExported({
                type,
                list: gameList
            })
        ].reverse();
        const step = async (id)=>{
            const detail = await fetcher.fetch(type, id);
            const result = await exporter.exportGame(detail);
            stepProgress.done += 1;
            stepProgress.currentUrl = undefined;
            if (result.status === "success") {
                stepProgress.exported += 1;
                stepProgress.currentUrl = result.url;
            } else if (result.status === "skip") {
                const { skipped  } = stepProgress;
                skipped[result.reason] = (skipped[result.reason] ?? 0) + 1;
            } else {}
            onStep?.();
        };
        if (workQueue.length > 0) {
            stepProgress.total = workQueue.length;
            onStep?.();
            for (const battle of workQueue){
                await step(battle);
            }
        } else {
            stepProgress.done = 1;
            onStep?.();
        }
        return stepProgress;
    }
    printStats(stats) {
        this.env.logger.log(`Exported ${Object.entries(stats).map(([name, { exported  }])=>`${name}: ${exported}`).join(", ")}`);
        if (Object.values(stats).some((i)=>Object.keys(i.skipped).length > 0)) {
            this.env.logger.log(`Skipped ${Object.entries(stats).map(([name, { skipped  }])=>Object.entries(skipped).map(([reason, count])=>`${name}: ${reason} (${count})`).join(", "))}`);
        }
    }
    opts;
}
const parseArgs = (args)=>{
    const parsed = mod1.parse(args, {
        string: [
            "profilePath",
            "exporter",
            "skipMode"
        ],
        boolean: [
            "help",
            "noProgress",
            "monitor",
            "withSummary"
        ],
        alias: {
            "help": "h",
            "profilePath": [
                "p",
                "profile-path"
            ],
            "exporter": [
                "e"
            ],
            "noProgress": [
                "n",
                "no-progress"
            ],
            "monitor": [
                "m"
            ],
            "skipMode": [
                "s",
                "skip-mode"
            ],
            "withSummary": "with-summary"
        }
    });
    return parsed;
};
const opts = parseArgs(Deno.args);
if (opts.help) {
    console.log(`Usage: deno run -A ${Deno.mainModule} [options]

Options:
    --profile-path <path>, -p    Path to config file (default: ./profile.json)
    --exporter <exporter>, -e    Exporter list to use (default: stat.ink)
                                 Multiple exporters can be separated by commas
                                 (e.g. "stat.ink,file")
    --no-progress, -n            Disable progress bar
    --monitor, -m                Monitor mode
    --skip-mode <mode>, -s       Skip mode (default: null)
                                 ("vs", "coop")
    --with-summary               Include summary in the output
    --help                       Show this help message and exit`);
    Deno.exit(0);
}
const app = new App({
    ...DEFAULT_OPTS,
    ...opts
});
await showError(app.env, app.run());
