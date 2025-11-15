"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Trash2, Save, Plus, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Question {
  id?: string;
  text: string;
  type: "MCQ" | "NORMAL";
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
}

interface QuizEditorProps {
  courseId: string;
  chapterId: string;
  quizId: string;
  quizTitle: string;
}

export function QuizEditor({
  courseId,
  chapterId,
  quizId,
  quizTitle,
}: QuizEditorProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chapterContent, setChapterContent] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}`
      );
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      text: "",
      type: "MCQ",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      answer: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleGenerateQuestions = async () => {
    if (!chapterContent.trim()) {
      toast.error("Please enter chapter content");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}/generate`,
        {
          videoContent: chapterContent,
          numberOfQuestions: parseInt(numberOfQuestions),
          difficulty,
        }
      );

      if (response.data.success) {
        await fetchQuestions();
        setChapterContent("");
        toast.success(`Generated ${response.data.questions.length} questions`);
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    try {
      setIsSaving(true);
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}`,
        { questions }
      );
      toast.success("Questions saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save questions");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/teacher/courses/${courseId}/chapters/${chapterId}`}
          className="flex items-center text-sm hover:opacity-75 transition mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to chapter
        </Link>
        <h1 className="text-3xl font-bold">Edit Quiz: {quizTitle}</h1>
        <p className="text-gray-400 mt-2">Manage quiz questions and answers</p>
      </div>

      {/* AI Generation Section */}
      <Card className="mb-8 bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖 AI Generate Questions</span>
          </CardTitle>
          <CardDescription>
            Let AI automatically generate quiz questions based on your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Chapter Content / Video Transcript
            </label>
            <textarea
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              placeholder="Paste your chapter content or video transcript here..."
              className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Questions
              </label>
              <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty Level
              </label>
              <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !chapterContent.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isGenerating ? "Generating..." : "Generate Questions with AI"}
          </Button>
        </CardContent>
      </Card>

      {/* Questions Editor Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quiz Questions ({questions.length})</CardTitle>
            <CardDescription>
              Add, edit, or remove questions from your quiz
            </CardDescription>
          </div>
          <Button
            onClick={handleAddQuestion}
            variant="outline"
            className="gap-2 border-slate-600 hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No questions yet. Generate questions or add them manually.</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={index} className="space-y-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                  <Button
                    onClick={() => handleDeleteQuestion(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <textarea
                    value={question.text}
                    onChange={(e) => handleUpdateQuestion(index, "text", e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full h-20 p-2 bg-slate-800 border border-slate-600 rounded text-white"
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["option1", "option2", "option3", "option4"] as const).map((opt) => (
                    <div key={opt}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {opt.replace("option", "Option ")}
                      </label>
                      <Input
                        value={question[opt]}
                        onChange={(e) => handleUpdateQuestion(index, opt, e.target.value)}
                        placeholder={`Enter option ${opt.slice(-1)}`}
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="block text-sm font-medium mb-2">Correct Answer</label>
                  <Select
                    value={question.answer}
                    onValueChange={(value) => handleUpdateQuestion(index, "answer", value)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {[question.option1, question.option2, question.option3, question.option4]
                        .filter((opt) => opt)
                        .map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="border-slate-600"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveQuestions}
          disabled={isSaving || questions.length === 0}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Questions"}
        </Button>
      </div>
    </div>
  );
}
