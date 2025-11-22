import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Zap } from "lucide-react";

// Available hobby interests
const INTERESTS = [
  "Sports", "Cars", "Outdoors", "Gaming", "Music", "Travel", "Cooking",
  "Fitness", "Fashion", "Tech", "Photography", "Art", "Books", "Foodie", "Animals"
];

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!email || !username || !password) {
      toast({ title: "Error", description: "Email, username, and password are required", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    if (selectedInterests.length === 0) {
      toast({ title: "Error", description: "Please select at least one interest", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, username, password, interests: selectedInterests }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: "Signup Failed", description: data.error || "Failed to create account", variant: "destructive" });
        return;
      }

      // Success! Auto-logged in by backend
      toast({ title: "Welcome to Krittics!", description: "Your account has been created successfully" });
      
      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect to browse page
      navigate("/");
    } catch (error) {
      console.error("Signup error:", error);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center mb-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: '#1ba9af',
                boxShadow: '0 0 20px rgba(27, 169, 175, 0.3)'
              }}
            >
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-display text-4xl font-extrabold">Join Krittics</CardTitle>
          <CardDescription className="text-base">
            Create your account to start watching, playing, and competing
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold">Account Information</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  required
                  data-testid="input-username"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    data-testid="input-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
            </div>

            {/* Interests Selection */}
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold">Your Interests</h3>
              <p className="text-sm text-muted-foreground">
                Select at least one interest to help us match you with your crew
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`
                        relative flex items-center justify-center px-3 py-2 rounded-md border-2 transition-all text-sm font-medium
                        ${isSelected
                          ? "scale-105"
                          : "hover-elevate"
                        }
                      `}
                      style={isSelected ? {
                        borderColor: '#1ba9af',
                        backgroundColor: 'rgba(27, 169, 175, 0.1)',
                      } : undefined}
                      data-testid={`interest-${interest.toLowerCase()}`}
                    >
                      {interest}
                      {isSelected && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0" style={{ backgroundColor: '#1ba9af' }}>
                          ✓
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
              data-testid="button-signup"
              style={{ backgroundColor: '#1ba9af' }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium hover:underline"
                style={{ color: '#1ba9af' }}
                data-testid="link-login"
              >
                Log in
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
