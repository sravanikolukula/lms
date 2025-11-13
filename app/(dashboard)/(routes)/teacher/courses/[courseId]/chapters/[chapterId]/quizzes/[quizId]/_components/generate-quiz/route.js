import OpenAI from "openai";

export async function POST(req) {
  try {
    const { topic, numQuestions, diffficulty } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: `Generate ${numQuestions} multiple choice quiz questions on the topic "{topic}" with difficulty "${diffficulty}".Return strictly JSON format like this:
              [
                {
                    "question":"",
                    "options":["","","",""],
                    "correctAnswer":"",
                    "explanation":""
                }
              ]`,
        },
      ],
    });

    return new Response(response.choices[0].message.content, { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Failed to generate quiz." }), {
      status: 500,
    });
  }
}
