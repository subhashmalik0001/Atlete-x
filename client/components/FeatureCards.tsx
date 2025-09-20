import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Dumbbell, Shield, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const FeatureCards: React.FC = () => {
  const features = [
    {
      title: "Smart Training Plans",
      description: "Personalized workouts based on your performance data",
      icon: <Dumbbell className="h-6 w-6 text-blue-500" />,
      link: "/training",
      badge: "Intelligent",
      stats: "4-5 workouts/week"
    },
    {
      title: "Injury Prevention",
      description: "Movement analysis and risk assessment",
      icon: <Shield className="h-6 w-6 text-green-500" />,
      link: "/injury-prevention",
      badge: "Safety First",
      stats: "Real-time analysis"
    },
    {
      title: "Nutrition Tracking",
      description: "Meal planning and calorie tracking",
      icon: <Apple className="h-6 w-6 text-red-500" />,
      link: "/nutrition",
      badge: "Smart Meals",
      stats: "2200 cal target"
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {features.map((feature, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feature.icon}
                <span className="text-lg">{feature.title}</span>
              </div>
              <Badge variant="secondary">{feature.badge}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{feature.description}</p>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{feature.stats}</span>
            </div>

            <Button asChild className="w-full gap-2">
              <Link to={feature.link}>
                <Zap className="h-4 w-4" />
                Get Started
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};