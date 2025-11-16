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

      // IMPORTANT: editor=true ensures backend returns answers
      const response = await axios.get(
        `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quizId}?editor=true`
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
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
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
          <CardTitle className="flex items-center gap-2">🤖 AI Generate Questions</CardTitle>
          <CardDescription>
            Let AI automatically generate quiz questions based on your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-2">Chapter Content</label>
            <textarea
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              placeholder="Paste chapter content here..."
              className="w-full h-32 p-3 bg-slate-900 border border-slate-600 rounded text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions}>
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <Select value={difficulty} onValueChange={(val: any) => setDifficulty(val)}>
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

      {/* Questions Editor */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quiz Questions ({questions.length})</CardTitle>
            <CardDescription>Edit or add quiz questions</CardDescription>
          </div>

          <Button
            onClick={handleAddQuestion}
            variant="outline"
            className="gap-2 border-slate-600 hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-center text-slate-400 py-12">
              No questions yet. Generate or add manually.
            </p>
          ) : (
            questions.map((q, index) => (
              <div key={index} className="p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-4">

                <div className="flex justify-between">
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
                <textarea
                  value={q.text}
                  onChange={(e) => handleUpdateQuestion(index, "text", e.target.value)}
                  className="w-full h-20 p-2 bg-slate-800 border border-slate-600 rounded text-white"
                  placeholder="Enter question text..."
                />

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["option1", "option2", "option3", "option4"] as const).map((opt) => (
                    <Input
                      key={opt}
                      value={q[opt]}
                      onChange={(e) => handleUpdateQuestion(index, opt, e.target.value)}
                      placeholder={`Enter option ${opt.slice(-1)}`}
                      className="bg-slate-800 border-slate-600"
                    />
                  ))}
                </div>

                {/* Correct Answer */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Correct Answer</label>
                  <Select
                    value={q.answer}
                    onValueChange={(val) => handleUpdateQuestion(index, "answer", val)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {[q.option1, q.option2, q.option3, q.option4]
                        .filter(Boolean)
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

      {/* Save */}
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
