import { streamText } from 'ai';
import 'dotenv/config';

async function main() {
  console.log('--- Initializing AI Gateway Stream ---');

  try {
    const result = streamText({
      model: 'openai/gpt-5.4',
      prompt: 'Invent a new holiday and describe its traditions.',
    });

    console.log('Stream Content:');
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    console.log('\n\n--- Stream Completed ---');
    console.log('Token usage:', await result.usage);
  } catch (error: any) {
    if (error.name === 'GatewayAuthenticationError') {
      console.error('\n[ERROR] AI Gateway Authentication Failed.');
      console.error('Please ensure a valid AI_GATEWAY_API_KEY is set in your .env file.');
    } else {
      console.error('\n[ERROR] An unexpected error occurred:', error.message);
    }
  }
}

main().catch(console.error);
