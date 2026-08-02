// jest.global-setup.ts
// Global polyfills required for Edge middleware tests
// These run before Jest sets up the testing environment.

// Ensure TextEncoder/TextDecoder globals (Node provides them, but we expose explicitly)
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore – attach to global
global.TextEncoder = TextEncoder;
// @ts-ignore – attach to global
global.TextDecoder = TextDecoder as any;

// Polyfill web streams globals using Node's stream/web implementation
// @ts-ignore – attach to global
const { ReadableStream, TransformStream, WritableStream } = require('stream/web');
global.ReadableStream = ReadableStream;
global.TransformStream = TransformStream;
global.WritableStream = WritableStream;

// Use node-fetch Request/Response/Headers for a more complete polyfill
// @ts-ignore – attach to global
const { Request, Response, Headers } = require('node-fetch');
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

// Polyfill MessagePort and MessageChannel
// @ts-ignore – attach to global
global.MessagePort = class {};
// @ts-ignore – attach to global
global.MessageChannel = class { constructor() { this.port1 = new global.MessagePort(); this.port2 = new global.MessagePort(); } };
