import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response('No prompt provided', { status: 400 });
  }
  const response = streamText({
    model: ollama('mistral:7b'),
    prompt: prompt,
  });

  return response.toDataStreamResponse();

}