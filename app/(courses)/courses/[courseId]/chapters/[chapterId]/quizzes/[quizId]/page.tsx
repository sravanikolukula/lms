import { redirect } from "next/navigation";
import { QuizTaker } from "@/components/quiz/quiz-taker";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkPurchase } from "@/actions/Courses/get-purchase";

const StudentQuizPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string; quizId: string };
}) => {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/");
  }

  // Check if user has purchased the course
  const purchased = await checkPurchase(userId, params.courseId);
  if (!purchased) {
    return redirect("/");
  }

  // Verify quiz exists and is published
  const quiz = await db.quiz.findUnique({
    where: {
      id: params.quizId,
      chapterId: params.chapterId,
    },
    include: {
      chapter: {
        include: {
          course: true,
        },
      },
      questions: true,
    },
  });

  if (!quiz || !quiz.isPublished) {
    return redirect(`/courses/${params.courseId}/chapters/${params.chapterId}`);
  }

  // Verify chapter belongs to course
  if (quiz.chapter.course.id !== params.courseId) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <QuizTaker
        courseId={params.courseId}
        chapterId={params.chapterId}
        quizId={params.quizId}
      />
    </div>
  );
};

export default StudentQuizPage;
