import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { ArrowUp, ArrowDown, MessageSquare } from "lucide-react-native";

interface CommentProps {
  id: string;
  author: string;
  content: string;
  upvotes: number;
  downvotes: number;
  timestamp: string;
}

export function Comment({ id, author, content, upvotes, downvotes, timestamp }: CommentProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null);
    } else {
      setUserVote(type);
    }
  };

  const handleReply = () => {
    console.log("Reply:", replyText);
    setReplyText("");
    setShowReply(false);
  };

  const score = upvotes - downvotes + (userVote === "up" ? 1 : userVote === "down" ? -1 : 0);

  return (
    <View className="border-l-2 border-border pl-4 mb-4">
      <View className="flex-row gap-3">
        <View className="items-center gap-1">
          <TouchableOpacity
            onPress={() => handleVote("up")}
            className={`p-1 rounded ${userVote === "up" ? "bg-accent/10" : ""}`}
          >
            <ArrowUp 
              size={16} 
              color={userVote === "up" ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"} 
            />
          </TouchableOpacity>
          <Text className="text-sm text-foreground">{score}</Text>
          <TouchableOpacity
            onPress={() => handleVote("down")}
            className={`p-1 rounded ${userVote === "down" ? "bg-secondary/10" : ""}`}
          >
            <ArrowDown 
              size={16} 
              color={userVote === "down" ? "hsl(var(--secondary))" : "hsl(var(--muted-foreground))"} 
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-foreground font-medium">u/{author}</Text>
            <Text className="text-muted-foreground text-sm">• {timestamp}</Text>
          </View>
          <Text className="text-foreground/90 mb-2">{content}</Text>
          
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setShowReply(!showReply)}
              className="px-3 py-1 bg-muted rounded flex-row items-center gap-1"
            >
              <MessageSquare size={16} color="hsl(var(--foreground))" />
              <Text className="text-sm text-foreground">Reply</Text>
            </TouchableOpacity>
          </View>

          {showReply && (
            <View className="mt-2">
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a reply..."
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="w-full p-2 bg-input/50 border border-border rounded text-sm text-foreground mb-2"
                multiline
                numberOfLines={2}
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleReply}
                  className="px-3 py-1 bg-accent rounded"
                >
                  <Text className="text-white text-sm">Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowReply(false)}
                  className="px-3 py-1 bg-secondary rounded"
                >
                  <Text className="text-white text-sm">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
