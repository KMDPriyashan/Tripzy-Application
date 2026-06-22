// src/services/supabase.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tipnlvbklvgjtvxmzfor.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcG5sdmJrbHZnanR2eG16Zm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NzMyNjksImV4cCI6MjA3ODI0OTI2OX0.CNQeo4zQa23ZLXRVtjO5AD-1oUl9dtcDCy-zUpPdiQw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============ LOCATION FUNCTIONS (existing) ============
export const searchDatabaseLocations = async (searchQuery) => {
  console.log("🔍 Searching for:", searchQuery);

  if (!searchQuery || searchQuery.length < 2) {
    console.log("Query too short");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .or(
        `name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,district.ilike.%${searchQuery}%`,
      )
      .order("search_count", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Database query error:", error);
      return [];
    }

    console.log("✅ Found", data?.length || 0, "locations in database");

    const formattedResults = (data || []).map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      source: "database",
      rating: loc.rating,
      category: loc.category,
      city: loc.city,
      district: loc.district,
      search_relevance: calculateRelevance(loc, searchQuery),
    }));

    formattedResults.sort((a, b) => b.search_relevance - a.search_relevance);
    return formattedResults;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

const calculateRelevance = (location, query) => {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerName = (location.name || "").toLowerCase();
  const lowerCity = (location.city || "").toLowerCase();
  const lowerDistrict = (location.district || "").toLowerCase();

  if (lowerName === lowerQuery) score += 100;
  else if (lowerName.includes(lowerQuery)) score += 50;
  if (lowerCity === lowerQuery) score += 80;
  else if (lowerCity.includes(lowerQuery)) score += 40;
  if (lowerDistrict === lowerQuery) score += 70;
  else if (lowerDistrict.includes(lowerQuery)) score += 35;
  if (location.popular) score += 20;
  if (location.rating) score += location.rating * 2;

  return score;
};

export const getPopularLocations = async (limit = 8) => {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("popular", true)
      .order("rating", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export const getAllLocations = async () => {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

// ============ USER FUNCTIONS ============
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;

    if (user) {
      // Get additional user data from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!userError && userData) {
        return { ...user, ...userData };
      }
    }
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const ensureUserRecordExists = async (userId) => {
  if (!userId) {
    return false;
  }

  const { data: existingUser, error: lookupError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existingUser) {
    return true;
  }

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("users").insert([
    {
      id: userId,
      display_name: "User",
      name: "User",
      full_name: "User",
      avatar: "👤",
      location: "",
      created_at: now,
      updated_at: now,
    },
  ]);

  if (insertError) {
    throw insertError;
  }

  return true;
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// ============ DIRECT MESSAGES FUNCTIONS ============
export const getDirectMessages = async (userId1, userId2) => {
  try {
    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`,
      )
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    return [];
  }
};

export const sendDirectMessage = async (senderId, receiverId, message) => {
  try {
    await ensureUserRecordExists(senderId);
    await ensureUserRecordExists(receiverId);

    const { data, error } = await supabase
      .from("direct_messages")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          message: message,
          created_at: new Date().toISOString(),
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error sending direct message:", error);
    return null;
  }
};

export const getUserConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("last_message_time", { ascending: false });

    if (error) throw error;

    const enrichedConversations = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId =
          conv.user1_id === userId ? conv.user2_id : conv.user1_id;
        const userProfile = await getUserProfile(otherUserId);
        return {
          id: conv.id,
          userId: otherUserId,
          userName: userProfile?.name || "User",
          avatar: userProfile?.avatar || "👤",
          lastMessage: conv.last_message,
          timestamp: formatTimeForChat(conv.last_message_time),
          unread: 0,
          isOnline: userProfile?.is_online || false,
        };
      }),
    );

    return enrichedConversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

// ============ GROUP CHAT FUNCTIONS ============
export const getCommunityGroups = async () => {
  try {
    const { data, error } = await supabase
      .from("chat_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
};

export const getUserGroups = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    if (error) throw error;

    const groupIds = data.map((g) => g.group_id);
    if (groupIds.length === 0) return [];

    const { data: groups, error: groupsError } = await supabase
      .from("chat_groups")
      .select("*")
      .in("id", groupIds)
      .order("created_at", { ascending: false });

    if (groupsError) throw groupsError;

    const groupsWithMemberCount = await Promise.all(
      (groups || []).map(async (group) => {
        const { count, error: countError } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", group.id);

        return {
          id: group.id,
          name: group.name,
          avatar: group.avatar || "👥",
          lastMessage: group.last_message || "No messages yet",
          timestamp: formatTimeForChat(
            group.last_message_time || group.created_at,
          ),
          unread: 0,
          memberCount: count || 0,
          members: [],
        };
      }),
    );

    return groupsWithMemberCount;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
};

export const getGroupMessages = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const enrichedMessages = await Promise.all(
      (data || []).map(async (msg) => {
        const senderProfile = await getUserProfile(msg.sender_id);
        return {
          id: msg.id,
          text: msg.message,
          senderId: msg.sender_id,
          senderName: senderProfile?.name || "User",
          senderAvatar: senderProfile?.avatar || "👤",
          timestamp: msg.created_at,
        };
      }),
    );

    return enrichedMessages;
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return [];
  }
};

export const sendGroupMessage = async (groupId, senderId, message) => {
  try {
    const { data, error } = await supabase
      .from("group_messages")
      .insert([
        {
          group_id: groupId,
          sender_id: senderId,
          message: message,
          created_at: new Date().toISOString(),
          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update group's last message
    await supabase
      .from("chat_groups")
      .update({
        last_message: message,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId);

    const senderProfile = await getUserProfile(senderId);

    return {
      id: data.id,
      text: message,
      senderId: senderId,
      senderName: senderProfile?.name || "You",
      senderAvatar: senderProfile?.avatar || "👤",
      timestamp: data.created_at,
    };
  } catch (error) {
    console.error("Error sending group message:", error);
    return null;
  }
};

export const getGroupMembers = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (error) throw error;

    const memberIds = data.map((m) => m.user_id);
    if (memberIds.length === 0) return [];

    const { data: members, error: membersError } = await supabase
      .from("users")
      .select("*")
      .in("id", memberIds);

    if (membersError) throw membersError;
    return members || [];
  } catch (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
};

export const createGroup = async (groupName, creatorId, memberIds = []) => {
  try {
    // Create group
    const { data: group, error: groupError } = await supabase
      .from("chat_groups")
      .insert([
        {
          name: groupName,
          avatar: "👥",
          created_by: creatorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message: "Group created",
          last_message_time: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (groupError) throw groupError;

    // Add members (including creator)
    const allMemberIds = [creatorId, ...memberIds];
    const memberInserts = allMemberIds.map((userId) => ({
      group_id: group.id,
      user_id: userId,
      joined_at: new Date().toISOString(),
    }));

    const { error: membersError } = await supabase
      .from("group_members")
      .insert(memberInserts);

    if (membersError) throw membersError;

    return group;
  } catch (error) {
    console.error("Error creating group:", error);
    return null;
  }
};

export const joinGroup = async (groupId, userId) => {
  try {
    const { error } = await supabase.from("group_members").insert([
      {
        group_id: groupId,
        user_id: userId,
        joined_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error joining group:", error);
    return false;
  }
};

export const leaveGroup = async (groupId, userId) => {
  try {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    return false;
  }
};

// ============ REALTIME SUBSCRIPTIONS ============
export const subscribeToDirectMessages = (userId, onNewMessage) => {
  const channelName = `direct_messages_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const subscription = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        const senderProfile = await getUserProfile(payload.new.sender_id);
        const newMessage = {
          id: payload.new.id,
          text: payload.new.message,
          senderId: payload.new.sender_id,
          timestamp: payload.new.created_at,
          senderName: senderProfile?.name || "User",
          senderAvatar: senderProfile?.avatar || "👤",
        };
        onNewMessage(newMessage);
      },
    )
    .subscribe();

  return subscription;
};

export const subscribeToGroupMessages = (groupId, onNewMessage) => {
  const subscription = supabase
    .channel(`group_messages_${groupId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "group_messages",
        filter: `group_id=eq.${groupId}`,
      },
      async (payload) => {
        const senderProfile = await getUserProfile(payload.new.sender_id);
        const newMessage = {
          id: payload.new.id,
          text: payload.new.message,
          senderId: payload.new.sender_id,
          timestamp: payload.new.created_at,
          senderName: senderProfile?.name || "User",
          senderAvatar: senderProfile?.avatar || "👤",
        };
        onNewMessage(newMessage);
      },
    )
    .subscribe();

  return subscription;
};

// ============ HELPER FUNCTIONS ============
const formatTimeForChat = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 86400000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diff < 604800000) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};
