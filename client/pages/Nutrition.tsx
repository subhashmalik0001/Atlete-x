import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Apple, Plus, Target, TrendingUp, Utensils, Zap, Camera, Upload } from "lucide-react";
import { generateSmartRecommendations } from "@/lib/aiRecommendations";
import APIService from "@/lib/api";

function FoodImageAnalysis({ onFoodAnalyzed }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await APIService.analyzeFoodImage(file);
      if (response.success) {
        setResult(response.analysis);
        onFoodAnalyzed(response.analysis);
      }
    } catch (error) {
      console.error('Food analysis failed:', error);
      alert('Food analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 border rounded cursor-pointer hover:bg-gray-50">
          <Upload className="h-4 w-4" />
          Upload Food Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {imagePreview && (
        <div className="relative">
          <img src={imagePreview} alt="Food" className="w-full max-w-md h-48 object-cover rounded" />
          {analyzing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
              <div className="text-white text-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <div>Analyzing food...</div>
              </div>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800 mb-2">{result.foodName}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-lg">{result.calories}</div>
                <div className="text-gray-600">Calories</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-lg">{result.protein}g</div>
                <div className="text-gray-600">Protein</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-lg">{result.carbs}g</div>
                <div className="text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="font-bold text-lg">{result.fat}g</div>
                <div className="text-gray-600">Fat</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm">Health Score:</span>
              <div className="flex items-center gap-2">
                <Progress value={result.healthScore} className="w-20" />
                <span className="font-bold">{result.healthScore}/100</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Smart Recommendations:</h4>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  • {rec}
                </div>
              ))}
            </div>
            <div className="p-2 bg-green-100 border border-green-300 rounded text-sm text-green-700">
              ✅ Automatically added to daily tracking
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const generateMealPlan = (goals: string, activityLevel: string) => {
  const basePlans = {
    "weight-loss": {
      name: "Weight Loss Plan",
      calories: 1800,
      protein: 135,
      carbs: 180,
      fat: 60,
      meals: [
        { name: "Breakfast", calories: 400, items: ["Oatmeal with berries", "Greek yogurt", "Green tea"] },
        { name: "Lunch", calories: 500, items: ["Grilled chicken salad", "Quinoa", "Olive oil dressing"] },
        { name: "Snack", calories: 200, items: ["Apple with almond butter", "Water"] },
        { name: "Dinner", calories: 450, items: ["Baked salmon", "Steamed vegetables", "Brown rice"] },
        { name: "Post-workout", calories: 250, items: ["Protein shake", "Banana"] }
      ]
    },
    "muscle-gain": {
      name: "Muscle Building Plan",
      calories: 2800,
      protein: 210,
      carbs: 350,
      fat: 93,
      meals: [
        { name: "Breakfast", calories: 600, items: ["Scrambled eggs", "Whole grain toast", "Avocado"] },
        { name: "Lunch", calories: 700, items: ["Chicken breast", "Sweet potato", "Mixed vegetables"] },
        { name: "Snack", calories: 400, items: ["Protein smoothie", "Nuts", "Dates"] },
        { name: "Dinner", calories: 650, items: ["Lean beef", "Quinoa", "Green salad"] },
        { name: "Pre-bed", calories: 450, items: ["Cottage cheese", "Berries", "Almonds"] }
      ]
    },
    "maintenance": {
      name: "Maintenance Plan",
      calories: 2200,
      protein: 165,
      carbs: 275,
      fat: 73,
      meals: [
        { name: "Breakfast", calories: 450, items: ["Greek yogurt parfait", "Granola", "Fresh fruit"] },
        { name: "Lunch", calories: 550, items: ["Turkey sandwich", "Whole grain bread", "Side salad"] },
        { name: "Snack", calories: 300, items: ["Trail mix", "Herbal tea"] },
        { name: "Dinner", calories: 600, items: ["Grilled fish", "Roasted vegetables", "Wild rice"] },
        { name: "Evening", calories: 300, items: ["Dark chocolate", "Chamomile tea"] }
      ]
    }
  };

  return basePlans[goals as keyof typeof basePlans] || basePlans.maintenance;
};

export default function Nutrition() {
  const [selectedGoal, setSelectedGoal] = useState("maintenance");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [smartRecommendations, setSmartRecommendations] = useState(null);
  const [todayIntake, setTodayIntake] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const handleFoodAnalyzed = (foodData) => {
    setTodayIntake(prev => ({
      calories: prev.calories + foodData.calories,
      protein: prev.protein + foodData.protein,
      carbs: prev.carbs + foodData.carbs,
      fat: prev.fat + foodData.fat
    }));
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 10);
          if (attempts.length > 0) {
            const recommendations = generateSmartRecommendations(attempts);
            setSmartRecommendations(recommendations);
          }
        }
      } catch (error) {
        console.error('Failed to load smart recommendations:', error);
      }
    };
    loadRecommendations();
    
    const handleTestCompleted = () => {
      loadRecommendations();
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);

  const mealPlan = useMemo(() => {
    if (smartRecommendations) {
      return {
        name: "Smart Personalized Plan",
        calories: smartRecommendations.nutrition.calories,
        protein: Math.round(smartRecommendations.nutrition.protein * 70),
        carbs: Math.round(smartRecommendations.nutrition.carbs * 70),
        fat: Math.round(smartRecommendations.nutrition.fats * 70),
        meals: smartRecommendations.nutrition.meals.map((meal, idx) => ({
          name: ["Breakfast", "Lunch", "Snack", "Dinner", "Post-workout"][idx] || "Meal",
          calories: Math.round(smartRecommendations.nutrition.calories / smartRecommendations.nutrition.meals.length),
          items: [meal]
        }))
      };
    }
    return generateMealPlan(selectedGoal, activityLevel);
  }, [smartRecommendations, selectedGoal, activityLevel]);
  
  const macroData = [
    { name: 'Protein', value: todayIntake.protein * 4, color: COLORS[0] },
    { name: 'Carbs', value: todayIntake.carbs * 4, color: COLORS[1] },
    { name: 'Fat', value: todayIntake.fat * 9, color: COLORS[2] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracking</h1>
          <p className="text-muted-foreground">Smart meal planning and calorie tracking</p>
        </div>
      </div>

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Daily Tracking</TabsTrigger>
          <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          <TabsTrigger value="goals">Goals & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.calories}</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.calories} goal</div>
                <Progress 
                  value={(todayIntake.calories / mealPlan.calories) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Protein</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.protein}g</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.protein}g goal</div>
                <Progress 
                  value={(todayIntake.protein / mealPlan.protein) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.carbs}g</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.carbs}g goal</div>
                <Progress 
                  value={(todayIntake.carbs / mealPlan.carbs) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.fat}g</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.fat}g goal</div>
                <Progress 
                  value={(todayIntake.fat / mealPlan.fat) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Macro Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {macroData.map((macro, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className="text-sm font-medium">{macro.name}</span>
                      </div>
                      <span className="text-sm">{macro.value} cal</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Smart Food Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FoodImageAnalysis onFoodAnalyzed={handleFoodAnalyzed} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meal-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Plan: {mealPlan.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>

              {smartRecommendations ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-800 mb-3">Smart Personalized Meal Plan</h4>
                  <div className="space-y-2">
                    {smartRecommendations.nutrition.meals.map((meal, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{["Breakfast", "Lunch", "Snack", "Dinner", "Post-workout"][idx] || "Meal"}</span>
                          <Badge variant="outline">{Math.round(smartRecommendations.nutrition.calories / smartRecommendations.nutrition.meals.length)} cal</Badge>
                        </div>
                        <div className="text-sm text-gray-600">{meal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealPlan.meals.map((meal, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Utensils className="h-4 w-4" />
                            {meal.name}
                          </span>
                          <Badge variant="outline">{meal.calories} cal</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="text-sm space-y-1">
                          {meal.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <div className="text-sm text-muted-foreground">Complete fitness tests for smart personalized meal plans</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal">Primary Goal</Label>
                  <select 
                    id="goal"
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="activity">Activity Level</Label>
                  <select 
                    id="activity"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light Activity</option>
                    <option value="moderate">Moderate Activity</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Current Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="70" />
                </div>
                <div>
                  <Label htmlFor="target-weight">Target Weight (kg)</Label>
                  <Input id="target-weight" type="number" placeholder="65" />
                </div>
              </div>

              <Button className="gap-2">
                <Target className="h-4 w-4" />
                Update Goals
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Smart Nutrition Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {smartRecommendations ? (
                <div className="grid gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{smartRecommendations.nutrition.calories}</div>
                    <div className="text-sm text-muted-foreground">Smart Recommended Calories</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="font-bold">{Math.round(smartRecommendations.nutrition.protein * 70)}g</div>
                      <div className="text-xs">Protein</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded">
                      <div className="font-bold">{Math.round(smartRecommendations.nutrition.carbs * 70)}g</div>
                      <div className="text-xs">Carbs</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="font-bold">{Math.round(smartRecommendations.nutrition.fats * 70)}g</div>
                      <div className="text-xs">Fats</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Complete fitness tests to get smart nutrition recommendations</div>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-medium">Personalized Meal Suggestions</h4>
                {smartRecommendations ? (
                  smartRecommendations.nutrition.meals.map((meal, idx) => (
                    <div key={idx} className="p-2 rounded bg-green-50 border border-green-200">
                      <div className="text-sm text-green-600">• {meal}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 rounded bg-gray-50 border">
                    <div className="text-sm text-gray-600">• Complete your fitness tests for personalized meal recommendations</div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Recommended Supplements</h4>
                <div className="flex flex-wrap gap-2">
                  {smartRecommendations ? (
                    smartRecommendations.nutrition.supplements.map((supplement, idx) => (
                      <Badge key={idx} variant="secondary">{supplement}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline">Complete tests for recommendations</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}