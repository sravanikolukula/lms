

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { currentUser } from "@/lib/auth";

// export async function GET(
//   req: Request,
//   { params }: { params: { courseId: string; chapterId: string; quizId: string } }
// ) {
//   try {
//     const quiz = await db.quiz.findUnique({
//       where: {
//         id: params.quizId,
//         chapterId: params.chapterId,
//       },
//       include: {
//         questions: {
//           select: {
//             id: true,
//             text: true,
//             type: true,
//             option1: true,
//             option2: true,
//             option3: true,
//             option4: true,
//             // Don't send the answer to the client for students
//             answer: false,
//           },
//         },
//       },
//     });

//     if (!quiz) {
//       return new NextResponse("Quiz not found", { status: 404 });
//     }

//     return NextResponse.json(quiz);
//   } catch (error) {
//     console.log("[QUIZ_GET]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { courseId: string; chapterId: string; quizId: string } }
// ) {
//   try {
//     const user = await currentUser();
//     let userId = user?.id ?? "";

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const ownCourse = await db.course.findUnique({
//       where: {
//         id: params.courseId,
//         userId,
//       },
//     });

//     if (!ownCourse) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const quiz = await db.quiz.findUnique({
//       where: {
//         id: params.quizId,
//         chapterId: params.chapterId,
//       },
//     });

//     if (!quiz) {
//       return new NextResponse("Not Found", { status: 404 });
//     }

//     const deletedQuiz = await db.quiz.delete({
//       where: {
//         id: params.quizId,
//       },
//     });

//     return NextResponse.json(deletedQuiz);
//   } catch (error) {
//     console.log("[QUIZ_DELETE]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }

// export async function PATCH(
//   req: Request,
//   { params }: { params: { courseId: string; chapterId: string; quizId: string } }
// ) {
//   try {
//     const user = await currentUser();
//     let userId = user?.id ?? "";
//     const values = await req.json();

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const ownCourse = await db.course.findUnique({
//       where: {
//         id: params.courseId,
//         userId,
//       },
//     });

//     if (!ownCourse) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const quiz = await db.quiz.update({
//       where: {
//         id: params.quizId,
//         chapterId: params.chapterId,
//       },
//       data: {
//         ...values,
//       },
//     });
//     console.log(params.quizId)
//     return NextResponse.json(quiz);
//   } catch (error) {
//     console.log("[QUIZ_UPDATE]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }


// api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/index.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type IncomingQuestion = {
  text: string;
  type: "MCQ" | "NORMAL";
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  option4?: string | null;
  answer?: string | null;
};

function validateQuestion(q: any): q is IncomingQuestion {
  if (!q || typeof q !== "object") return false;
  if (!q.text || typeof q.text !== "string") return false;
  if (!q.type || (q.type !== "MCQ" && q.type !== "NORMAL")) return false;

  if (q.type === "MCQ") {
    // ensure 4 options exist (allow empty strings, but prefer defined)
    const opts = [q.option1, q.option2, q.option3, q.option4];
    if (opts.some((o) => typeof o !== "string")) return false;
    // answer must be one of the options (will be enforced later too)
    if (typeof q.answer !== "string") return false;
    if (!opts.includes(q.answer)) return false;
  } else {
    // NORMAL: answer should be a string (could be free-text)
    if (typeof q.answer !== "string") return false;
  }

  return true;
}

// ---------------- GET ----------------
export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; quizId: string } }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    // find the quiz and include the chapter (so we can check ownership)
    const quiz = await db.quiz.findFirst({
      where: {
        id: params.quizId,
        chapterId: params.chapterId,
      },
      include: {
        chapter: true,
        questions: true, // fetch full questions; we'll filter before returning if needed
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // determine if current user owns the course (teacher)
    const isOwner =
      !!userId &&
      !!(await db.course.findFirst({
        where: { id: params.courseId, userId },
      }));

    // If not owner, strip answer fields before returning
    if (!isOwner) {
      const safeQuestions = quiz.questions.map((q) => {
        const { answer, ...rest } = q;
        return rest;
      });

      return NextResponse.json({
        ...quiz,
        questions: safeQuestions,
      });
    }

    // Owner can see answers
    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; quizId: string } }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const ownCourse = await db.course.findFirst({
      where: { id: params.courseId, userId },
    });

    if (!ownCourse) return new NextResponse("Unauthorized", { status: 401 });

    const quiz = await db.quiz.findFirst({
      where: { id: params.quizId, chapterId: params.chapterId },
    });

    if (!quiz) return new NextResponse("Not Found", { status: 404 });

    
    await db.question.deleteMany({ where: { quizId: params.quizId } });

    const deletedQuiz = await db.quiz.delete({
      where: { id: params.quizId },
    });

    return NextResponse.json(deletedQuiz);
  } catch (error) {
    console.error("[QUIZ_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}



export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; quizId: string } }
) {
  try {
    const user = await currentUser();
    const userId = user?.id;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const ownCourse = await db.course.findFirst({
      where: { id: params.courseId, userId },
    });

    if (!ownCourse) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    // If questions are provided, we replace them atomically
    if (Array.isArray(body.questions)) {
      const incoming: any[] = body.questions;

      // Basic validation: ensure each incoming question is valid
      for (let i = 0; i < incoming.length; i++) {
        const q = incoming[i];
        if (!validateQuestion(q)) {
          return NextResponse.json(
            { error: `Invalid question at index ${i}` },
            { status: 400 }
          );
        }
      }

      // Delete existing questions for quiz
      await db.question.deleteMany({ where: { quizId: params.quizId } });

      // Create new questions
      const created = await Promise.all(
        incoming.map((q) =>
          db.question.create({
            data: {
              text: q.text,
              type: q.type,
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

      // Optionally, update other quiz fields (if provided)
      const quizUpdates: any = { ...body };
      delete quizUpdates.questions;

      const updatedQuiz = await db.quiz.update({
        where: { id: params.quizId },
        data: quizUpdates,
        include: { questions: true },
      });

      // Return updated quiz with newly created questions
      return NextResponse.json({ ...updatedQuiz, questions: created });
    }

    // Otherwise, just update quiz fields
    const values = body;
    const updated = await db.quiz.update({
      where: { id: params.quizId },
      data: values,
      include: { questions: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[QUIZ_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
