// "use client";

// import * as z from "zod";
// import axios from "axios";
// import MuxPlayer from "@mux/mux-player-react";
// import { Pencil, PlusCircle, Video, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { Chapter, Quiz } from "@prisma/client";
// import Image from "next/image";

// import { Button } from "@/components/ui/button";
// import { FileUpload } from "@/components/file-upload";

// import dynamic from "next/dynamic";
// const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });


// interface ChapterVideoFormProps {
//   initialData: Chapter & { quizzes: Quiz[] };
//   courseId: string;
//   chapterId: string;
// };

// const formSchema = z.object({
//   videoUrl: z.string().min(1),
// });

// export const ChapterVideoForm = ({
//   initialData,
//   courseId,
//   chapterId,
// }: ChapterVideoFormProps) => {

  
//   const [hasWindow, setHasWindow] = useState(false);
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       setHasWindow(true);
//     }
//   }, []);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
//   const [generationStatus, setGenerationStatus] = useState<{
//     status: 'idle' | 'loading' | 'success' | 'error';
//     message: string;
//   }>({ status: 'idle', message: '' });

//   const toggleEdit = () => setIsEditing((current) => !current);

//   const router = useRouter();

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
//       toast.success("Chapter updated");
//       toggleEdit();
      
//       // Auto-generate quizzes after video upload
//       try {
//         let quizzesToGenerate = initialData.quizzes || [];
//         if (!quizzesToGenerate || quizzesToGenerate.length === 0) {
//           // Create a default quiz to hold generated questions
//           const createResp = await axios.post(
//             `/api/courses/${courseId}/chapters/${chapterId}/quizzes`,
//             { title: "Auto-generated Quiz", timeline: 0 }
//           );
//           if (createResp && createResp.data) {
//             quizzesToGenerate = [createResp.data];
//             toast.success("Created quiz for auto-generation");
//           }
//         }

//         if (quizzesToGenerate && quizzesToGenerate.length > 0) {
//           await autoGenerateQuizzes(quizzesToGenerate);
//         }
//       } catch (e) {
//         console.error("Auto-generation init error:", e);
//         toast.error("Auto-generation failed to start");
//       }
      
//       router.refresh();
//     } catch {
//       toast.error("Something went wrong");
//     }
//   }

//   const autoGenerateQuizzes = async (quizzesParam?: Quiz[]) => {
//     try {
//       setIsGeneratingQuiz(true);
//       setGenerationStatus({ status: 'loading', message: 'Generating quiz questions...' });

//       // Get chapter description as content
//       const chapterDescription = initialData.description || 'Chapter content';

//       const quizzes = quizzesParam && quizzesParam.length > 0 ? quizzesParam : (initialData.quizzes || []);

//       for (const quiz of quizzes) {
//         try {
//           const response = await axios.post(
//             `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quiz.id}/generate`,
//             {
//               videoContent: chapterDescription,
//               numberOfQuestions: 5,
//               difficulty: 'medium'
//             }
//           );

//           if (response.data.success) {
//             setGenerationStatus({
//               status: 'success',
//               message: `✓ Generated ${response.data.questions.length} questions for "${quiz.title}"`
//             });
//           }
//         } catch (quizError) {
//           console.error(`Failed to generate quiz ${quiz.id}:`, quizError);
//           setGenerationStatus({
//             status: 'error',
//             message: `Failed to generate questions for "${quiz.title}"`
//           });
//         }
//       }

//       setTimeout(() => {
//         setGenerationStatus({ status: 'idle', message: '' });
//         setIsGeneratingQuiz(false);
//         router.refresh();
//       }, 2000);

//     } catch (error) {
//       console.error("Quiz generation error:", error);
//       setGenerationStatus({
//         status: 'error',
//         message: 'Failed to generate quiz questions'
//       });
//       setIsGeneratingQuiz(false);
//     }
//   };

//   return (
//     <div className="mt-6 border bg-slate-900 rounded-md p-4">
//       <div className="font-medium flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <span>Chapter video</span>
//           {isGeneratingQuiz && (
//             <div className="flex items-center gap-1 text-xs text-blue-400">
//               <Loader2 className="h-3 w-3 animate-spin" />
//               <span>Generating quiz...</span>
//             </div>
//           )}
//           {generationStatus.status === 'success' && (
//             <div className="flex items-center gap-1 text-xs text-green-400">
//               <CheckCircle2 className="h-3 w-3" />
//               <span>{generationStatus.message}</span>
//             </div>
//           )}
//           {generationStatus.status === 'error' && (
//             <div className="flex items-center gap-1 text-xs text-red-400">
//               <AlertCircle className="h-3 w-3" />
//               <span>{generationStatus.message}</span>
//             </div>
//           )}
//         </div>
//         <Button onClick={toggleEdit} variant="ghost" disabled={isGeneratingQuiz}>
//           {isEditing && (
//             <>Cancel</>
//           )}
//           {!isEditing && !initialData.videoUrl && (
//             <>
//               <PlusCircle className="h-4 w-4 mr-2" />
//               Add a video
//             </>
//           )}
//           {!isEditing && initialData.videoUrl && (
//             <>
//               <Pencil className="h-4 w-4 mr-2" />
//               Edit video
//             </>
//           )}
//         </Button>
//       </div>
//       {!isEditing && (
//         !initialData.videoUrl ? (
//           <div className="flex items-center justify-center h-60 bg-slate-800 rounded-md">
//             <Video className="h-10 w-10 text-slate-500" />
//           </div>
//         ) : (
//           <div className="relative aspect-video mt-2">
//             {
//                <ReactPlayer
//                url={initialData.videoUrl}
//                controls
//                width="100%"
//                height="100%"
//              />
//             }
//           </div>
//         )
//       )}
//       {isEditing && (
//         <div>
//           <FileUpload
//             endpoint="chapterVideo"
//             onChange={(url) => {
//               if (url) {
//                 onSubmit({ videoUrl: url });
//               }
//             }}
//           />
//           <div className="text-xs text-muted-foreground mt-4">
//            Upload this chapter&apos;s video
//           </div>
//         </div>
//       )}
//       {initialData.videoUrl && !isEditing && (
//         <div>
//           <div className="text-xs text-muted-foreground mt-2">
//             Videos can take a few minutes to process. Refresh the page if video does not appear.
//           </div>
//           {initialData.quizzes && initialData.quizzes.length > 0 && (
//             <div className="mt-3 p-2 bg-blue-950 rounded text-xs text-blue-200">
//               💡 Quizzes will auto-generate when video is uploaded
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, Video, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter, Quiz } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

interface ChapterVideoFormProps {
  initialData: Chapter & { quizzes: Quiz[] };
  courseId: string;
  chapterId: string;
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {

  const [hasWindow, setHasWindow] = useState(false);
  useEffect(() => setHasWindow(true), []);

  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generationStatus, setGenerationStatus] = useState({
    status: 'idle',
    message: ''
  });

  const toggleEdit = () => setIsEditing((current) => !current);
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);

      toast.success("Chapter updated");
      toggleEdit();

   
      try {
        let quizzesToGenerate = initialData.quizzes || [];

        // Create default quiz if none exist
        if (!quizzesToGenerate.length) {
          const createResp = await axios.post(
            `/api/courses/${courseId}/chapters/${chapterId}/quizzes`,
            { 
              title: "Auto-generated Quiz", 
              timeline: 0   // IMPORTANT FIX: Must be number
            }
          );

          quizzesToGenerate = [createResp.data];
          toast.success("Created quiz for auto-generation");
        }

        await autoGenerateQuizzes(quizzesToGenerate);

      } catch (e) {
        console.error("Auto-generation init error:", e);
        toast.error("Auto-generation failed to start");
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const autoGenerateQuizzes = async (quizzes: Quiz[]) => {
    try {
      setIsGeneratingQuiz(true);
      setGenerationStatus({ status: "loading", message: "Generating quiz questions..." });

      const chapterDescription = initialData.description?.trim() ?? "Chapter content";

      for (const quiz of quizzes) {
        try {
          const response = await axios.post(
            `/api/courses/${courseId}/chapters/${chapterId}/quizzes/${quiz.id}/generate`,
            { 
              videoContent: chapterDescription,
              numberOfQuestions: 5,
              difficulty: "medium"
            }
          );

          setGenerationStatus({
            status: "success",
            message: `Generated questions for "${quiz.title}"`
          });

        } catch (err) {
          console.error(`Quiz generation failed for ${quiz.id}:`, err);
          setGenerationStatus({
            status: "error",
            message: `Failed for "${quiz.title}"`
          });
        }
      }

      setTimeout(() => {
        setGenerationStatus({ status: "idle", message: "" });
        setIsGeneratingQuiz(false);
        router.refresh();
      }, 1500);

    } catch (err) {
      console.error("Quiz generation error:", err);
      setGenerationStatus({ status: "error", message: "Failed to generate quiz questions" });
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="mt-6 border bg-slate-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Chapter video</span>

          {generationStatus.status === "loading" && (
            <span className="text-blue-400 text-xs flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Generating...
            </span>
          )}

          {generationStatus.status === "success" && (
            <span className="text-green-400 text-xs flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {generationStatus.message}
            </span>
          )}

          {generationStatus.status === "error" && (
            <span className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {generationStatus.message}
            </span>
          )}
        </div>

        <Button onClick={toggleEdit} variant="ghost" disabled={isGeneratingQuiz}>
          {isEditing ? "Cancel" : initialData.videoUrl ? "Edit video" : "Add a video"}
        </Button>
      </div>

     

      {!isEditing && (
        initialData.videoUrl ? (
          hasWindow && (
            <div className="relative aspect-video mt-2">
              <ReactPlayer url={initialData.videoUrl} controls width="100%" height="100%" />
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-60 bg-slate-800 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        )
      )}

    
      {isEditing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => url && onSubmit({ videoUrl: url })}
          />
          <p className="text-xs text-muted-foreground mt-4">Upload this chapter’s video</p>
        </div>
      )}
    </div>
  );
};
