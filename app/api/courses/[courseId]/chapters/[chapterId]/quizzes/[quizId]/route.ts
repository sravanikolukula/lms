// api/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/index.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; quizId: string } }
) {
  try {
    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId,
        chapterId: params.chapterId,
      },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            option1: true,
            option2: true,
            option3: true,
            option4: true,
            // Don't send the answer to the client for students
            answer: false,
          },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.log("[QUIZ_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; quizId: string } }
) {
  try {
    const user = await currentUser();
    let userId = user?.id ?? "";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId,
        chapterId: params.chapterId,
      },
    });

    if (!quiz) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const deletedQuiz = await db.quiz.delete({
      where: {
        id: params.quizId,
      },
    });

    return NextResponse.json(deletedQuiz);
  } catch (error) {
    console.log("[QUIZ_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string; quizId: string } }
) {
  try {
    const user = await currentUser();
    let userId = user?.id ?? "";
    const values = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.update({
      where: {
        id: params.quizId,
        chapterId: params.chapterId,
      },
      data: {
        ...values,
      },
    });
    console.log(params.quizId)
    return NextResponse.json(quiz);
  } catch (error) {
    console.log("[QUIZ_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
