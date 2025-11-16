import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { User } from "@shared/schema";

interface CrewMember extends User {
  sharedInterests: string[];
}

export function CrewMatches() {
  const { data: crewMembers, isLoading } = useQuery<CrewMember[]>({
    queryKey: ["/api/crew/matches"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Crew
          </CardTitle>
          <CardDescription>Loading your matched crew members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted-foreground/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!crewMembers || crewMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Crew
          </CardTitle>
          <CardDescription>
            No crew members found yet. Complete your interests to find people with similar tastes!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Your Crew
        </CardTitle>
        <CardDescription>
          {crewMembers.length} member{crewMembers.length !== 1 ? "s" : ""} with similar interests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {crewMembers.map((member) => {
            const displayName = member.firstName && member.lastName
              ? `${member.firstName} ${member.lastName}`
              : member.email?.split("@")[0] || "Anonymous";

            const initials = member.firstName && member.lastName
              ? `${member.firstName[0]}${member.lastName[0]}`
              : displayName[0].toUpperCase();

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover-elevate transition-all"
                data-testid={`crew-member-${member.id}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.profileImageUrl || undefined} alt={displayName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{displayName}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.sharedInterests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {member.sharedInterests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.sharedInterests.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
