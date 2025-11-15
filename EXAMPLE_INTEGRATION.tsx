/**
 * Example: Quiz Creation Page with AI Question Generation
 * This file demonstrates how to integrate the Gemini API question generation
 * into your existing quiz creation workflow.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateQuizQuestionsButton } from "@/components/quiz/generate-questions-button";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Question {
  id?: string;
  text: string;
  type: "MCQ" | "NORMAL";
  option1?: string;
  option2?: string;
  option3?: string;
  option4?: string;
  answer: string;
}

interface QuizCreationPageExampleProps {
  courseId: string;
  chapterId: string;
  quizId: string;
  initialQuestions?: Question[];
}

/**
 * Example: Quiz Creation Page
 * 
 * Shows how to use the GenerateQuizQuestionsButton component
 * alongside traditional manual question creation
 */
export function QuizCreationPageExample({
  courseId,
  chapterId,
  quizId,
  initialQuestions = [],
}: QuizCreationPageExampleProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  const handleAddManualQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "MCQ",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleSaveQuestions = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions }),
        }
      );

      if (!response.ok) throw new Error("Failed to save questions");

      const data = await response.json();
      console.log("Questions saved:", data);
      alert("Questions saved successfully!");
    } catch (error) {
      console.error("Error saving questions:", error);
      alert("Failed to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerationSuccess = () => {
    // Refresh questions from the server
    console.log("Questions generated and saved successfully!");
    // You can add logic here to refresh the questions list
    // For example: fetchUpdatedQuestions();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quiz Creation</h1>
        <Button
          onClick={handleSaveQuestions}
          disabled={isSaving || questions.length === 0}
          className="gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save All Questions"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="ai">AI Generation</TabsTrigger>
        </TabsList>

        {/* Manual Question Entry Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Questions Manually</CardTitle>
              <CardDescription>
                Add and edit quiz questions one by one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No questions yet. Add your first question!
                </p>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">Question {index + 1}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        {/* Question Text Input */}
                        <div>
                          <label className="text-sm font-medium">Question</label>
                          <textarea
                            value={question.text}
                            onChange={(e) =>
                              handleUpdateQuestion(index, {
                                ...question,
                                text: e.target.value,
                              })
                            }
                            placeholder="Enter question text..."
                            className="w-full mt-1 p-2 border rounded"
                            rows={3}
                          />
                        </div>

                        {/* Options Inputs */}
                        <div className="grid grid-cols-1 gap-2">
                          {["option1", "option2", "option3", "option4"].map(
                            (option, optIndex) => (
                              <input
                                key={option}
                                type="text"
                                placeholder={`Option ${optIndex + 1}`}
                                value={question[option as keyof Question] || ""}
                                onChange={(e) =>
                                  handleUpdateQuestion(index, {
                                    ...question,
                                    [option]: e.target.value,
                                  })
                                }
                                className="w-full p-2 border rounded text-sm"
                              />
                            )
                          )}
                        </div>

                        {/* Correct Answer Input */}
                        <div>
                          <label className="text-sm font-medium">
                            Correct Answer
                          </label>
                          <input
                            type="text"
                            value={question.answer}
                            onChange={(e) =>
                              handleUpdateQuestion(index, {
                                ...question,
                                answer: e.target.value,
                              })
                            }
                            placeholder="Enter the correct answer"
                            className="w-full mt-1 p-2 border rounded text-sm"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <Button
                onClick={handleAddManualQuestion}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Questions with AI</CardTitle>
              <CardDescription>
                Use Gemini API to automatically create quiz questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerateQuizQuestionsButton
                courseId={courseId}
                chapterId={chapterId}
                quizId={quizId}
                onSuccess={handleGenerationSuccess}
              />
            </CardContent>
          </Card>

          {/* Information Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Provide clear and comprehensive chapter content
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Include key concepts and important definitions
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Adjust difficulty level based on your audience
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>
                    Review generated questions before publishing
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Questions Summary */}
      {questions.length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Total Questions: <span className="font-semibold">{questions.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              Click "Save All Questions" to save these questions to your quiz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Example Usage in a Route/Page
 * 
 * app/courses/[courseId]/chapters/[chapterId]/quizzes/[quizId]/edit/page.tsx
 */
export function ExamplePage({
  params,
}: {
  params: { courseId: string; chapterId: string; quizId: string };
}) {
  return (
    <div className="container mx-auto py-8">
      <QuizCreationPageExample
        courseId={params.courseId}
        chapterId={params.chapterId}
        quizId={params.quizId}
      />
    </div>
  );
}

/**
 * API Integration Examples
 */

// Example 1: Generate questions via API
export async function generateQuestionsAPI(
  courseId: string,
  chapterId: string,
  quizId: string,
  chapterContent: string
) {
  const response = await fetch(
    `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterContent,
        numberOfQuestions: 5,
        difficulty: "medium",
      }),
    }
  );

  return response.json();
}

// Example 2: Save questions to quiz
export async function saveQuestionsAPI(
  courseId: string,
  chapterId: string,
  quizId: string,
  questions: Question[]
) {
  const response = await fetch(
    `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    }
  );

  return response.json();
}

// Example 3: Combine both operations
export async function generateAndSaveQuestions(
  courseId: string,
  chapterId: string,
  quizId: string,
  chapterContent: string
) {
  try {
    // Generate questions
    const generateResponse = await generateQuestionsAPI(
      courseId,
      chapterId,
      quizId,
      chapterContent
    );

    if (!generateResponse.success) {
      throw new Error(generateResponse.message);
    }

    console.log(
      `Generated ${generateResponse.questions.length} questions successfully`
    );
    return generateResponse.questions;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
