declare module 'http' {
    interface IncomingMessage {
        rawBody: any;
    }
}
// declare global {
//     namespace Express {
//         interface Request {
//             rawBody: any
//         }
//     }
// }
