import { createAppInstance } from '../server.ts';

let appPromise: any;

export default async (req: any, res: any) => {
  if (!appPromise) {
    // Vercel Serverless Initialization: Bridging the Forensic S2C Engine
    appPromise = createAppInstance();
  }
  const app = await appPromise;
  return app(req, res);
};
