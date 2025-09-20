import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Users, Zap } from "lucide-react";

interface TestInstructionsProps {
  testKey: string;
}

const testInstructions = {
  pushUps: {
    title: "Push-ups Test",
    duration: "2 minutes",
    difficulty: "Medium",
    muscles: ["Chest", "Triceps", "Core"],
    instructions: [
      "Start in plank position with hands shoulder-width apart",
      "Lower body until chest nearly touches ground",
      "Push back up to starting position",
      "Keep body straight throughout movement",
      "Count maximum reps in 2 minutes"
    ],
    tips: [
      "Maintain proper form over speed",
      "Breathe out on the push, in on the lower",
      "Keep core engaged throughout"
    ]
  },
  pullUps: {
    title: "Pull-ups Test",
    duration: "Until failure",
    difficulty: "Hard",
    muscles: ["Lats", "Biceps", "Rhomboids"],
    instructions: [
      "Hang from bar with overhand grip",
      "Pull body up until chin clears the bar",
      "Lower with control to full arm extension",
      "No swinging or kipping allowed",
      "Count maximum consecutive reps"
    ],
    tips: [
      "Start from dead hang position",
      "Focus on pulling with back muscles",
      "Control the descent"
    ]
  },
  flexibilityTest: {
    title: "Sit-and-Reach Flexibility",
    duration: "3 attempts",
    difficulty: "Easy",
    muscles: ["Hamstrings", "Lower back", "Calves"],
    instructions: [
      "Sit with legs straight and feet against box",
      "Reach forward slowly with both hands",
      "Hold maximum reach for 2 seconds",
      "Measure distance reached beyond toes",
      "Take best of 3 attempts"
    ],
    tips: [
      "Warm up with light stretching first",
      "Move slowly and smoothly",
      "Don't bounce or force the stretch"
    ]
  },
  agilityLadder: {
    title: "Agility Ladder Test",
    duration: "Single run",
    difficulty: "Medium",
    muscles: ["Legs", "Core", "Coordination"],
    instructions: [
      "Start at beginning of agility ladder",
      "Run through ladder with quick feet",
      "One foot in each square",
      "Maintain forward momentum",
      "Time from start to finish"
    ],
    tips: [
      "Stay on balls of feet",
      "Keep eyes looking forward",
      "Pump arms for balance and speed"
    ]
  }
};

export const TestInstructions: React.FC<TestInstructionsProps> = ({ testKey }) => {
  const instruction = testInstructions[testKey as keyof typeof testInstructions];
  
  if (!instruction) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{instruction.title}</span>
          <Badge className={getDifficultyColor(instruction.difficulty)}>
            {instruction.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{instruction.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{instruction.muscles.join(", ")}</span>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Instructions
          </h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            {instruction.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Pro Tips
          </h4>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            {instruction.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};