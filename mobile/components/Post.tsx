import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { ArrowUp, ArrowDown, MessageSquare, Share2, MoreVertical } from "lucide-react-native";
import { Comment } from "./Comment";
import { api } from "../utils/api";

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
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(null);
  const [currentScore, setCurrentScore] = useState(upvotes - downvotes);
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

  const handleVote = async (type: "UPVOTE" | "DOWNVOTE") => {
    try {
      // If clicking same vote, currently backend doesn't support "unvote" easily with one endpoint
      // for now we just send the vote.
      await api.post(`/posts/${id}/vote`, { type });
      
      // Optimistic UI update
      if (userVote !== type) {
        if (type === "UPVOTE") {
          setCurrentScore(prev => prev + (userVote === "DOWNVOTE" ? 2 : 1));
          setUserVote("UPVOTE");
        } else {
          setCurrentScore(prev => prev - (userVote === "UPVOTE" ? 2 : 1));
          setUserVote("DOWNVOTE");
        }
      }
    } catch (err) {
      console.error("Vot sisteminde hata:", err);
      Alert.alert("Hata", "Beğeni işlemi başarısız oldu.");
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
          timestamp: "Az önce",
        },
      ]);
      setNewComment("");
    }
  };

  const renderRoleBadge = () => {
    if (authorRole === "official") {
      return (
        <View className="px-1.5 py-0.5 bg-accent rounded ml-2">
          <Text className="text-[10px] text-white">Resmi</Text>
        </View>
      );
    }
    if (authorRole === "super_admin") {
      return (
        <View className="px-1.5 py-0.5 bg-destructive rounded ml-2">
          <Text className="text-[10px] text-white">Yönetici</Text>
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
            onPress={() => handleVote("UPVOTE")}
            className={`p-1.5 rounded-md ${userVote === "UPVOTE" ? "bg-accent" : "bg-transparent"}`}
          >
            <ArrowUp 
              size={20} 
              color={userVote === "UPVOTE" ? "#fff" : "hsl(var(--muted-foreground))"} 
            />
          </TouchableOpacity>
          <Text className="text-base text-foreground font-medium">{currentScore}</Text>
          <TouchableOpacity
            onPress={() => handleVote("DOWNVOTE")}
            className={`p-1.5 rounded-md ${userVote === "DOWNVOTE" ? "bg-secondary" : "bg-transparent"}`}
          >
            <ArrowDown 
              size={20} 
              color={userVote === "DOWNVOTE" ? "#fff" : "hsl(var(--muted-foreground))"} 
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
              <Text className="text-xs text-foreground">Gönderen: u/{author}</Text>
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
              <Text className="text-foreground text-sm font-medium">{commentCount} Yorum</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-3 py-1.5 bg-muted rounded-md flex-row items-center gap-1.5">
              <Share2 size={18} color="hsl(var(--foreground))" />
              <Text className="text-foreground text-sm font-medium">Paylaş</Text>
            </TouchableOpacity>
          </View>

          {showComments && (
            <View className="mt-4">
              <View className="mb-4">
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Yorum yapın..."
                  placeholderTextColor="hsl(var(--muted-foreground))"
                  className="w-full p-3 bg-input/50 border border-border rounded-lg text-foreground mb-2"
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  className="px-4 py-2 bg-accent rounded-lg self-start"
                >
                  <Text className="text-white font-medium">Yorum Yap</Text>
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
