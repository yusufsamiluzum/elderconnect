import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, Alert, Modal, FlatList } from "react-native";
import { ArrowUp, ArrowDown, MessageSquare, Bookmark, Repeat2, X } from "lucide-react-native";
import { router } from "expo-router";
import { Comment } from "./Comment";
import { api } from "../utils/api";

interface AdminCommunity {
  id: number;
  name: string;
}

interface PostProps {
  id: string;
  author: string;
  authorRole: "standard" | "official" | "super_admin";
  community?: string;
  communityId?: number;
  title: string;
  content: string;
  image?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timestamp: string;
  initialIsSaved?: boolean;
  adminCommunities?: AdminCommunity[];
}

export function Post({
  id,
  author,
  authorRole,
  community,
  communityId,
  title,
  content,
  image,
  upvotes,
  downvotes,
  commentCount,
  timestamp,
  initialIsSaved = false,
  adminCommunities = [],
}: PostProps) {
  const [userVote, setUserVote] = useState<"UPVOTE" | "DOWNVOTE" | null>(null);
  const [currentScore, setCurrentScore] = useState(upvotes - downvotes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

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
      await api.post(`/posts/${id}/vote`, { type });
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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/users/me/saved/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/users/me/saved/${id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      Alert.alert("Hata", "İşlem başarısız oldu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRepost = async (targetCommunityId: number) => {
    setIsReposting(true);
    try {
      await api.post(`/posts/${id}/forward`, { communityId: targetCommunityId });
      setShowRepostModal(false);
      const chosen = adminCommunities.find(c => c.id === targetCommunityId);
      Alert.alert("Başarılı", `Gönderi c/${chosen?.name ?? ""} topluluğuna yeniden paylaşıldı.`);
    } catch (err) {
      console.error("Repost hatası:", err);
      Alert.alert("Hata", "Yeniden paylaşım başarısız oldu.");
    } finally {
      setIsReposting(false);
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
        {/* Vote column */}
        <View className="items-center gap-1 pt-1">
          <TouchableOpacity
            onPress={() => handleVote("UPVOTE")}
            className={`p-1.5 rounded-md ${userVote === "UPVOTE" ? "bg-accent" : "bg-transparent"}`}
          >
            <ArrowUp size={20} color={userVote === "UPVOTE" ? "#fff" : "hsl(var(--muted-foreground))"} />
          </TouchableOpacity>
          <Text className="text-base text-foreground font-medium">{currentScore}</Text>
          <TouchableOpacity
            onPress={() => handleVote("DOWNVOTE")}
            className={`p-1.5 rounded-md ${userVote === "DOWNVOTE" ? "bg-secondary" : "bg-transparent"}`}
          >
            <ArrowDown size={20} color={userVote === "DOWNVOTE" ? "#fff" : "hsl(var(--muted-foreground))"} />
          </TouchableOpacity>
        </View>

        {/* Content column */}
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap mb-2">
            {community && (
              <TouchableOpacity onPress={() => communityId && router.push(`/community/${communityId}` as any)} className="mr-1">
                <Text className="text-accent text-xs font-bold">c/{community} •</Text>
              </TouchableOpacity>
            )}
            <View className="flex-row items-center">
              <Text className="text-xs text-foreground">Gönderen: u/{author}</Text>
              {renderRoleBadge()}
            </View>
            <Text className="text-muted-foreground text-xs ml-1">• {timestamp}</Text>
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

          {/* Action bar */}
          <View className="flex-row gap-2 flex-wrap">
            <TouchableOpacity
              onPress={() => setShowComments(!showComments)}
              className="px-3 py-1.5 bg-muted rounded-md flex-row items-center gap-1.5"
            >
              <MessageSquare size={18} color="hsl(var(--foreground))" />
              <Text className="text-foreground text-sm font-medium">{commentCount} Yorum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-md flex-row items-center gap-1.5 ${isSaved ? "bg-accent/20" : "bg-muted"}`}
            >
              <Bookmark
                size={18}
                color={isSaved ? "hsl(var(--accent))" : "hsl(var(--foreground))"}
                fill={isSaved ? "hsl(var(--accent))" : "none"}
              />
              <Text className={`text-sm font-medium ${isSaved ? "text-accent" : "text-foreground"}`}>
                {isSaved ? "Kaydedildi" : "Kaydet"}
              </Text>
            </TouchableOpacity>

            {adminCommunities.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowRepostModal(true)}
                className="px-3 py-1.5 bg-muted rounded-md flex-row items-center gap-1.5"
              >
                <Repeat2 size={18} color="hsl(var(--foreground))" />
                <Text className="text-foreground text-sm font-medium">Repost</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Comments section */}
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

      {/* Repost community selection modal */}
      <Modal
        visible={showRepostModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRepostModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-2xl p-5" style={{ paddingBottom: 32 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground text-lg font-bold">Topluluk Seç</Text>
              <TouchableOpacity onPress={() => setShowRepostModal(false)} className="p-1">
                <X size={22} color="hsl(var(--muted-foreground))" />
              </TouchableOpacity>
            </View>
            <Text className="text-muted-foreground text-sm mb-4">
              Gönderiyi yeniden paylaşmak istediğiniz topluluğu seçin.
            </Text>
            <FlatList
              data={adminCommunities}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleRepost(item.id)}
                  disabled={isReposting}
                  className="py-3 px-4 bg-muted rounded-lg mb-2 flex-row items-center gap-3"
                >
                  <View className="w-8 h-8 bg-accent/20 rounded-full items-center justify-center">
                    <Repeat2 size={16} color="hsl(var(--accent))" />
                  </View>
                  <Text className="text-foreground font-medium">c/{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
