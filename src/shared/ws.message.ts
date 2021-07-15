export const wsmessage = (e: string, msg: string | boolean) => {
    return JSON.stringify({ event: e, message: msg });
}
