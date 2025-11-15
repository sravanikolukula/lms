import { useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

interface GeneratedQuestion {
  id: string;
  text: string;
  type: "MCQ" | "NORMAL";
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer: string;
  quizId: string;
  createdAt: string;
  updatedAt: string;
}

interface GenerateQuestionsParams {
  chapterContent: string;
  numberOfQuestions?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export const useGenerateQuizQuestions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const router = useRouter();
  const params = useParams();

  const generateQuestions = async (params_data: GenerateQuestionsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const courseId = params.courseId as string;
      const chapterId = params.chapterId as string;
      const quizId = params.quizId as string;

      if (!courseId || !chapterId || !quizId) {
        throw new Error("Missing required parameters");
      }

      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}/generate`,
        {
          chapterContent: params_data.chapterContent,
          numberOfQuestions: params_data.numberOfQuestions || 10,
          difficulty: params_data.difficulty || "medium",
        }
      );

      setGeneratedQuestions(response.data.questions);
      toast.success(response.data.message);

      return response.data.questions;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to generate questions";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateQuestions,
    isLoading,
    error,
    generatedQuestions,
  };
};
