import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Laugh, Drama, Skull, Rocket, Heart, FileVideo, Palette, Ghost, Users } from "lucide-react";

// Available interest categories with icons
const INTERESTS = [
  { name: "Action", icon: Rocket, color: "bg-red-500" },
  { name: "Comedy", icon: Laugh, color: "bg-yellow-500" },
  { name: "Drama", icon: Drama, color: "bg-blue-500" },
  { name: "Horror", icon: Skull, color: "bg-purple-500" },
  { name: "Sci-Fi", icon: Ghost, color: "bg-cyan-500" },
  { name: "Romance", icon: Heart, color: "bg-pink-500" },
  { name: "Documentary", icon: FileVideo, color: "bg-green-500" },
  { name: "Animation", icon: Palette, color: "bg-orange-500" },
  { name: "Thriller", icon: Film, color: "bg-indigo-500" },
  { name: "Family", icon: Users, color: "bg-teal-500" },
];

export default function InterestsSelection() {
  const [, navigate] = useLocation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Fetch existing interests
  const { data: userInterestsData } = useQuery<{ interests: string[] }>({
    queryKey: ["/api/user/interests"],
  });

  // Set initial selected interests from user data
  useEffect(() => {
    if (userInterestsData?.interests) {
      setSelectedInterests(userInterestsData.interests);
    }
  }, [userInterestsData]);

  // Save interests mutation
  const saveInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await fetch("/api/user/interests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests }),
      });
      if (!response.ok) throw new Error("Failed to save interests");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/interests"] });
      navigate("/");
    },
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = () => {
    if (selectedInterests.length > 0) {
      saveInterestsMutation.mutate(selectedInterests);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">What are you interested in?</CardTitle>
          <CardDescription className="text-lg">
            Select at least one interest to help us match you with your crew and show relevant content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {INTERESTS.map(({ name, icon: Icon, color }) => {
              const isSelected = selectedInterests.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleInterest(name)}
                  className={`
                    relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                    ${isSelected
                      ? "border-primary bg-primary/10 scale-105"
                      : "border-border hover-elevate"
                    }
                  `}
                  data-testid={`interest-${name.toLowerCase()}`}
                >
                  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">{name}</span>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground">✓</Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? "s" : ""}
            </p>
            <Button
              onClick={handleSave}
              disabled={selectedInterests.length === 0 || saveInterestsMutation.isPending}
              size="lg"
              className="w-full sm:w-auto"
              data-testid="button-save-interests"
            >
              {saveInterestsMutation.isPending ? "Saving..." : "Continue to Krittics"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
