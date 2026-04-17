import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { ArrowUp, ArrowDown, MessageSquare, Share2, MoreVertical } from "lucide-react-native";
import { Comment } from "./Comment";

interface PostProps {
  id: string;
  author: string;
  authorRole: "standard" | "official" | "super_admin";
  community?: string;
  title: string;
  content: string;
  image?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timestamp: string;
}

export function Post({ id, author, authorRole, community, title, content, image, upvotes, downvotes, commentCount, timestamp }: PostProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: "1",
      author: "ayse_yilmaz",
      content: "Bu harika! Paylaştığınız için teşekkürler.",
      upvotes: 5,
      downvotes: 0,
      timestamp: "2 saat önce",
    },
  ]);

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null);
    } else {
      setUserVote(type);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: Date.now().toString(),
          author: "current_user",
          content: newComment,
          upvotes: 0,
          downvotes: 0,
          timestamp: "Just now",
        },
      ]);
      setNewComment("");
    }
  };

  const score = upvotes - downvotes + (userVote === "up" ? 1 : userVote === "down" ? -1 : 0);

  const renderRoleBadge = () => {
    if (authorRole === "official") {
      return (
        <View className="px-1.5 py-0.5 bg-accent rounded ml-2">
          <Text className="text-[10px] text-white">Official</Text>
        </View>
      );
    }
    if (authorRole === "super_admin") {
      return (
        <View className="px-1.5 py-0.5 bg-destructive rounded ml-2">
          <Text className="text-[10px] text-white">Admin</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View className="bg-card border border-border rounded-lg mb-4 overflow-hidden">
      <View className="flex-row p-4 gap-3">
        <View className="items-center gap-1 pt-1">
          <TouchableOpacity
            onPress={() => handleVote("up")}
            className={`p-1.5 rounded-md ${userVote === "up" ? "bg-accent" : "bg-transparent"}`}
          >
            <ArrowUp 
              size={20} 
              color={userVote === "up" ? "#fff" : "hsl(var(--muted-foreground))"} 
            />
          </TouchableOpacity>
          <Text className="text-base text-foreground font-medium">{score}</Text>
          <TouchableOpacity
            onPress={() => handleVote("down")}
            className={`p-1.5 rounded-md ${userVote === "down" ? "bg-secondary" : "bg-transparent"}`}
          >
            <ArrowDown 
              size={20} 
              color={userVote === "down" ? "#fff" : "hsl(var(--muted-foreground))"} 
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center flex-wrap mb-2">
            {community && (
              <Text className="text-muted-foreground text-xs mr-1">
                c/{community} •
              </Text>
            )}
            <View className="flex-row items-center">
              <Text className="text-xs text-foreground">Posted by u/{author}</Text>
              {renderRoleBadge()}
            </View>
            <Text className="text-muted-foreground text-xs ml-1">• {timestamp}</Text>
            <View className="flex-1" />
            <TouchableOpacity className="p-1">
              <MoreVertical size={18} color="hsl(var(--muted-foreground))" />
            </TouchableOpacity>
          </View>

          <Text className="text-lg text-foreground font-semibold mb-2">{title}</Text>
          <Text className="text-foreground/90 mb-3 leading-5">{content}</Text>

          {image && (
            <Image
              source={{ uri: image }}
              className="w-full h-48 rounded-lg mb-3 bg-muted"
              resizeMode="cover"
            />
          )}

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowComments(!showComments)}
              className="px-3 py-1.5 bg-muted rounded-md flex-row items-center gap-1.5"
            >
              <MessageSquare size={18} color="hsl(var(--foreground))" />
              <Text className="text-foreground text-sm font-medium">{commentCount} Comments</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-3 py-1.5 bg-muted rounded-md flex-row items-center gap-1.5">
              <Share2 size={18} color="hsl(var(--foreground))" />
              <Text className="text-foreground text-sm font-medium">Share</Text>
            </TouchableOpacity>
          </View>

          {showComments && (
            <View className="mt-4">
              <View className="mb-4">
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Add a comment..."
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-2"
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  className="px-4 py-2 bg-accent rounded-lg self-start"
                >
                  <Text className="text-white font-medium">Comment</Text>
                </TouchableOpacity>
              </View>

              {comments.map((comment) => (
                <Comment key={comment.id} {...comment} />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
