// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { currentUser } from "@/lib/auth";
// import { generateQuizQuestions } from "@/lib/gemini";

// export async function POST(
//   req: NextRequest,
//   {
//     params,
//   }: {
//     params: {
//       courseId: string;
//       chapterId: string;
//       quizId: string;
//     };
//   }
// ) {
//   try {
//     const user = await currentUser();
//     const userId = user?.id;

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Verify course ownership
//     const course = await db.course.findUnique({
//       where: {
//         id: params.courseId,
//         userId, // Verify user owns the course
//       },
//     });

//     if (!course) {
//       return NextResponse.json(
//         { error: "Course not found or unauthorized" },
//         { status: 404 }
//       );
//     }

//     // Verify quiz exists
//     const quiz = await db.quiz.findUnique({
//       where: {
//         id: params.quizId,
//         chapterId: params.chapterId,
//       },
//       include: {
//         chapter: true,
//         questions: true,
//       },
//     });

//     if (!quiz) {
//       return NextResponse.json(
//         { error: "Quiz not found" },
//         { status: 404 }
//       );
//     }

//     // Get chapter content from request or use chapter description
//     const { videoContent, numberOfQuestions = 10, difficulty = "medium" } =
//       await req.json();

//     let contentToUse = videoContent || quiz.chapter.description || "";

//     if (!contentToUse || contentToUse.trim().length === 0) {
//       return NextResponse.json(
//         { error: "Video content or chapter description is required" },
//         { status: 400 }
//       );
//     }

//     // Delete existing questions if regenerating
//     if (quiz.questions.length > 0) {
//       await db.question.deleteMany({
//         where: { quizId: params.quizId },
//       });
//     }

//     // Generate questions using Gemini API
//     const generatedQuestions = await generateQuizQuestions(
//       contentToUse,
//        10,
//       difficulty as "easy" | "medium" | "hard"
//     );

//     // Save questions to database
//     const savedQuestions = await Promise.all(
//       generatedQuestions.map((question) =>
//         db.question.create({
//           data: {
//             text: question.text,
//             type: question.type,
//             option1: question.option1 || "",
//             option2: question.option2 || "",
//             option3: question.option3 || "",
//             option4: question.option4 || "",
//             answer: question.answer || "",
//             quizId: params.quizId,
//           },
//         })
//       )
//     );

//     return NextResponse.json({
//       success: true,
//       message: `Successfully generated and saved ${savedQuestions.length} questions`,
//       questions: savedQuestions,
//       quizId: params.quizId,
//     });
//   } catch (error) {
//     console.error("[QUIZ_AUTO_GENERATE]", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "Internal Server Error";
//     return NextResponse.json(
//       { error: errorMessage },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { generateQuizQuestions } from "@/lib/gemini";

type Difficulty = "easy" | "medium" | "hard";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      courseId: string;
      chapterId: string;
      quizId: string;
    };
  }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify course ownership (use findFirst for multi-field filter)
    const course = await db.course.findFirst({
      where: {
        id: params.courseId,
        userId, // ensures the authenticated user owns the course
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify quiz exists and belongs to chapter
    const quiz = await db.quiz.findFirst({
      where: {
        id: params.quizId,
        chapterId: params.chapterId,
      },
      include: {
        chapter: true,
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Read body params
    const body = await req.json();
    const rawContent = body?.videoContent ?? quiz.chapter?.description ?? "";
    const numberOfQuestionsRaw = Number(body?.numberOfQuestions ?? 10);
    const difficultyRaw = (body?.difficulty ?? "medium") as string;

    // Validate content
    const contentToUse = String(rawContent).trim();
    if (!contentToUse) {
      return NextResponse.json(
        { error: "Video content or chapter description is required" },
        { status: 400 }
      );
    }

    // Validate and normalize numberOfQuestions
    const numberOfQuestions = Number.isFinite(numberOfQuestionsRaw)
      ? Math.max(1, Math.min(50, Math.floor(numberOfQuestionsRaw)))
      : 10;

    // Validate difficulty
    const allowedDifficulties = new Set<Difficulty>(["easy", "medium", "hard"]);
    const difficulty = (difficultyRaw as Difficulty) || "medium";
    if (!allowedDifficulties.has(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Allowed: easy, medium, hard" },
        { status: 400 }
      );
    }

    // Delete existing questions if regenerating
    if (quiz.questions.length > 0) {
      await db.question.deleteMany({
        where: { quizId: params.quizId },
      });
    }

    // Generate questions using Gemini (or whatever LLM wrapper)
    const generatedQuestions = await generateQuizQuestions(
      contentToUse,
      numberOfQuestions,
      difficulty
    );

    if (!Array.isArray(generatedQuestions)) {
      console.error("[QUIZ_AUTO_GENERATE] generateQuizQuestions returned non-array:", generatedQuestions);
      return NextResponse.json(
        { error: "Question generation failed (invalid response from model)" },
        { status: 500 }
      );
    }

    // Save questions to database
    const savedQuestions = await Promise.all(
      generatedQuestions.map((q) =>
        db.question.create({
          data: {
            text: q.text ?? "",
            type: q.type ?? "MCQ",
            option1: q.option1 ?? "",
            option2: q.option2 ?? "",
            option3: q.option3 ?? "",
            option4: q.option4 ?? "",
            answer: q.answer ?? "",
            quizId: params.quizId,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully generated and saved ${savedQuestions.length} questions`,
      questions: savedQuestions,
      quizId: params.quizId,
    });
  } catch (error) {
    console.error("[QUIZ_AUTO_GENERATE]", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
