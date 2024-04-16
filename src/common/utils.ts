import { promises as fs } from "fs";
import { join } from "path";
import { Readable } from "stream";
import { GenericObject } from "moleculer";


export default class Utils {
    public static isNumber(n: any) {
        return typeof n === "number" && !isNaN(n - n);
    }

    public static isEmpty(obj: any) {
        obj === null || undefined
            ? true
            : (() => {
                for (const prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        return false;
                    }
                }

                return true;
            })();
    }

    public static async rmRf(path: string): Promise<void> {
        const entries = await fs.readdir(path, { withFileTypes: true });
        await Promise.all(entries.map(async (entry) => {
            const entryPath = join(path, entry.name);

            return entry.isFile() ? fs.unlink(entryPath) : Utils.rmRf(entryPath);
        }));
        await fs.rmdir(path);
    }

    public static async streamToBuffer(readable: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const buffers: Buffer[] = [];
            readable.on("data", (chunk) => {
                buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            readable.on("error", reject);
            // tslint:disable-next-line: no-void-expression
            readable.on("end", () => resolve(Buffer.concat(buffers)));
        });
    }

    public static async toString(readable: Readable): Promise<string> {
        return new Promise((resolve, reject) => {
            const strings: string[] = [];
            readable.on("data", (chunk) => {
                strings.push(typeof chunk === "string" ? chunk : chunk.toString());
            });
            readable.on("error", reject);
            // tslint:disable-next-line: no-void-expression
            readable.on("end", () => resolve(strings.join("")));
        });
    }

    public static randomString(length: number): string {
        return Utils._makeRandomString(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            length,
        );
    }

    public static randomPasswordString(length: number): string {
        return Utils._makeRandomString(
            "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789",
            length,
        );
    }

    protected static _makeRandomString(charSet: string, length: number): string {
        let randomString = "";
        for (let i = 0; i < length; i++) {
            const randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz, randomPoz + 1);
        }

        return randomString;
    }

    protected static _getBracedParamsFromString(braces: string): string[] {
        const params = [];
        const rxp = /{([^}]+)}/g;
        let curMatch;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            curMatch = rxp.exec(braces);
            if (curMatch === null) { break; }
            params.push(curMatch[1]);
        }

        return params;
    }

    public static createStringWithValuesOfParams(braces: string, placeData: GenericObject): string {
        const stringParams: string[] = Utils._getBracedParamsFromString(braces);
        let response = braces;

        if (stringParams.length) {
            response = stringParams.reduce(
                (ret: string, brace: string): string =>
                    ret.replace(new RegExp("{" + brace + "}", "gi"), placeData[brace]),
                response,
            );
        }

        return response;
    }

    public static async delay(delay: number) {
            return new Promise(
                (r) => {
                    setTimeout(r, delay);
                },
            );
    }

    public static isEnvVarTrue(param: string): boolean {
        return String(param).toLowerCase() === "true";
    }

    public static isEnvVarFalse(param: string): boolean {
        return String(param).toLowerCase() === "false";
    }
}
