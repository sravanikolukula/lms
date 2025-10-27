import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getProgress } from "@/actions/Courses/get-progress";
import { CourseNavbar } from "./_components/course-navbar";
import { CourseSidebar } from "./_components/course-sidebar";

type progressProps = {
  progressPercentage: number;
  totalChapters: number;
  completedChapters: number;
};

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
    const user = await currentUser();
    let userId = user?.id ?? "";
  
  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        include: {
          userProgress: {
            where: {
              userId,
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  const progress : progressProps = await getProgress(userId, course.id);

  return (
    <div className="h-full dashboard-container">
      <div className="h-[80px] md:pl-72 fixed inset-y-0 w-full z-50">
        <CourseNavbar
          course={course}
          progress={progress}
        />
      </div>
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <CourseSidebar
          course={course}
          progress={progress}
        />
      </div>
      <main className="md:pl-72 pt-[80px] h-full">
        {children}
      </main>
    </div>
  )
}

export default CourseLayout 

/* import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getProgress } from "@/actions/Courses/get-progress";
import { getQuizData } from "@/actions/Courses/get-quiz"; // ✅ Import quiz data action
import { CourseNavbar } from "./_components/course-navbar";
import { CourseSidebar } from "./_components/course-sidebar";

type progressProps = {
  progressPercentage: number;
  totalChapters: number;
  completedChapters: number;
};

const CourseLayout = async ({
  children,
  params
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const user = await currentUser();
  const userId = user?.id ?? "";

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: {
          userProgress: { where: { userId } },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  const progress: progressProps = await getProgress(userId, course.id);

  // ✅ Fetch all quizzes in this course
  const allChapterIds = course.chapters.map((ch) => ch.id);
  const quizzes = await Promise.all(
    allChapterIds.map((chapterId) => getQuizData({ chapterId }))
  );

  // Flatten nested arrays of quizzes
  const allQuizzes = quizzes.flat();

  return (
    <div className="h-full dashboard-container">
      <div className="h-[80px] md:pl-72 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progress={progress} />
      </div>

      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progress={progress} />
      </div>

      <main className="md:pl-72 pt-[80px] h-full">
        {children}

        // {/* ✅ QUIZ SECTION START *
        {allQuizzes.length > 0 && (
          <div className="p-6 mt-10 bg-slate-100 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Course Quizzes
            </h2>
            <ul className="space-y-2">
              {allQuizzes.map((quiz) => (
                <li key={quiz.id}>
                  <a
                    href={`/courses/${params.courseId}/quiz/${quiz.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {quiz.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        // {/* ✅ QUIZ SECTION END 
      </main>
    </div>
  );
};

export default CourseLayout;
 */