import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Edge runtime globals used in middleware tests
declare global {
  var Request: any;
  var Response: any;
}
// Minimal stub classes
// @ts-ignore – attach to global
global.Request = class {};
// @ts-ignore – attach to global
global.Response = class {};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
