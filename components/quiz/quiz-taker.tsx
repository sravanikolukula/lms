"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

interface Question {
  id: string;
  text: string;
  type: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeline: number;
  questions: Question[];
}

interface QuizTakerProps {
  courseId: string;
  chapterId: string;
  quizId: string;
}

export function QuizTaker({ courseId, chapterId, quizId }: QuizTakerProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}`
      );
      setQuiz(response.data);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Quiz Not Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800">
              This quiz doesn't have any questions yet. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const allAnswered = Object.keys(answers).length === quiz.questions.length;

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate score
      let correctCount = 0;
      const answersData = quiz.questions.map((q) => ({
        questionId: q.id,
        selected: answers[q.id],
        correct: answers[q.id] === q.answer,
      }));

      correctCount = answersData.filter((a) => a.correct).length;
      const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);

      // Submit quiz attempt
      await axios.post(`/api/user/quizAttempts`, {
        quizId: quiz.id,
        score: calculatedScore,
        answers: answersData,
      });

      setScore(calculatedScore);
      setQuizCompleted(true);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quizCompleted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto bg-green-50 border-green-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900">
              Quiz Completed!
            </CardTitle>
            <CardDescription className="text-green-800 text-lg mt-2">
              Your Score: <span className="font-bold text-2xl">{score}%</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-green-900">
              {score >= 80
                ? "Excellent! Great job on the quiz."
                : score >= 60
                ? "Good effort! You passed the quiz."
                : "Keep practicing! Better luck next time."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => router.back()}
                className="bg-green-600 hover:bg-green-700"
              >
                Back to Course
              </Button>
              <Button
                onClick={() => {
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setQuizCompleted(false);
                }}
                variant="outline"
              >
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Quiz Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          {quiz.description && <p className="text-gray-600">{quiz.description}</p>}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded">
              Answered: {Object.keys(answers).length} of {quiz.questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleAnswer}
            >
              <div className="space-y-4">
                {[currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4]
                  .filter((option) => option)
                  .map((option) => (
                    <div key={option} className="flex items-center space-x-3">
                      <RadioGroupItem value={option} id={option} />
                      <label
                        htmlFor={option}
                        className="cursor-pointer text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation and Submit */}
        <div className="flex gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentQuestionIndex === quiz.questions.length - 1}
            variant="outline"
          >
            Next
          </Button>

          <div className="ml-auto" />

          {currentQuestionIndex === quiz.questions.length - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-4">Questions Navigator</h3>
          <div className="grid grid-cols-6 gap-2">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`p-2 rounded font-medium text-sm transition ${
                  index === currentQuestionIndex
                    ? "bg-blue-600 text-white"
                    : answers[q.id]
                    ? "bg-green-100 text-green-900 hover:bg-green-200"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
