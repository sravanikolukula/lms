"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateQuizQuestions } from "@/hooks/use-generate-quiz-questions";

interface GenerateQuizQuestionsButtonProps {
  courseId: string;
  chapterId: string;
  quizId: string;
  onSuccess?: () => void;
}

export const GenerateQuizQuestionsButton = ({
  courseId,
  chapterId,
  quizId,
  onSuccess,
}: GenerateQuizQuestionsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chapterContent, setChapterContent] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");
  const { generateQuestions, isLoading } = useGenerateQuizQuestions();

  const handleGenerate = async () => {
    if (!chapterContent.trim()) {
      alert("Please enter chapter content");
      return;
    }

    try {
      await generateQuestions({
        chapterContent,
        numberOfQuestions: parseInt(numberOfQuestions),
        difficulty: difficulty as "easy" | "medium" | "hard",
      });

      setChapterContent("");
      setNumberOfQuestions("5");
      setDifficulty("medium");
      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
      >
        Generate with AI
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Quiz Questions with AI</CardTitle>
        <CardDescription>
          Use Gemini API to automatically generate quiz questions based on chapter content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Chapter Content</label>
          <Textarea
            placeholder="Paste the chapter content here..."
            value={chapterContent}
            onChange={(e) => setChapterContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Provide clear and comprehensive chapter content for better question generation
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions</label>
            <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty Level</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
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

        <div className="flex gap-2 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !chapterContent.trim()}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Generating..." : "Generate Questions"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
