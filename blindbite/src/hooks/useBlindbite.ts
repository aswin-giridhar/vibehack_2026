import { useQuery } from "@tanstack/react-query";
import {
  getChat,
  getCraving,
  getMessages,
  getNearbyCravings,
  getPendingChatRequests,
  getRecommendation,
  getRecommendations,
} from "../lib/api";

export const useNearbyCravings = () =>
  useQuery({
    queryKey: ["cravings"],
    queryFn: getNearbyCravings,
    refetchInterval: 2000,
  });

export const useCraving = (id: string | undefined) =>
  useQuery({
    queryKey: ["craving", id],
    queryFn: () => getCraving(id!),
    enabled: !!id,
  });

export const useRecommendations = (cravingId: string | undefined) =>
  useQuery({
    queryKey: ["recommendations", cravingId],
    queryFn: () => getRecommendations(cravingId!),
    enabled: !!cravingId,
    refetchInterval: 2000,
  });

export const useRecommendation = (id: string | undefined) =>
  useQuery({
    queryKey: ["recommendation", id],
    queryFn: () => getRecommendation(id!),
    enabled: !!id,
  });

export const useChatRequests = () =>
  useQuery({
    queryKey: ["chat-requests"],
    queryFn: getPendingChatRequests,
    refetchInterval: 2000,
  });

export const useChat = (id: string | undefined) =>
  useQuery({
    queryKey: ["chat", id],
    queryFn: () => getChat(id!),
    enabled: !!id,
  });

export const useMessages = (chatId: string | undefined) =>
  useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(chatId!),
    enabled: !!chatId,
    refetchInterval: 1500,
  });