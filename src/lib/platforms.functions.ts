import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AccountStats = { platform: string; status: "connected" | "not_connected" | "error"; username?: string; avatar?: string; followers: number | null; likes?: number; posts?: number; error?: string; checkedAt?: string };
export type CreatorResult = { id: string; display_name: string; username: string; avatar_url: string; platform: string; language?: string };

export const getConnectedStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<AccountStats[]> => {
    const gatewayKey = process.env['LOVABLE_API_KEY'];
    const twitchKey = process.env['TWITCH_API_KEY'];
    const tiktokKey = process.env['TIKTOK_API_KEY'];
    const read = async (provider: string, key: string, path: string) => {
      if (!gatewayKey) throw new Error("Account connection is unavailable");
      const response = await fetch(`https://connector-gateway.lovable.dev/${provider}/${path}`, { headers: { Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key } });
      if (!response.ok) { const body = await response.text(); console.error(`Platform request failed [${response.status}]: ${body}`); throw new Error(`Platform request failed [${response.status}]: ${body}`); }
      return response.json();
    };
    const twitch = async (): Promise<AccountStats> => {
      if (!twitchKey) return { platform: "Twitch", status: "not_connected", followers: null };
      try {
        const users = await read("twitch", twitchKey, "users");
        const user = users.data?.[0];
        if (!user) throw new Error("No Twitch account returned");
        const followers = await read("twitch", twitchKey, `channels/followers?broadcaster_id=${encodeURIComponent(user.id)}&first=1`);
        return { platform: "Twitch", status: "connected", username: user.login, avatar: user.profile_image_url, followers: typeof followers.total === "number" ? followers.total : null, checkedAt: new Date().toISOString() };
      } catch (e) { return { platform: "Twitch", status: "error", followers: null, error: e instanceof Error ? e.message : "Twitch request failed" }; }
    };
    const tiktok = async (): Promise<AccountStats> => {
      if (!tiktokKey) return { platform: "TikTok", status: "not_connected", followers: null };
      try {
        const result = await read("tiktok", tiktokKey, "user/info/?fields=open_id,display_name,avatar_url,username,follower_count,likes_count,video_count");
        if (result.error?.code && result.error.code !== "ok") throw new Error(`TikTok: ${result.error.message} (${result.error.code})`);
        const user = result.data?.user;
        if (!user) throw new Error("No TikTok account returned");
        return { platform: "TikTok", status: "connected", username: user.username ?? user.display_name, avatar: user.avatar_url, followers: typeof user.follower_count === "number" ? user.follower_count : null, likes: user.likes_count, posts: user.video_count, checkedAt: new Date().toISOString() };
      } catch (e) { return { platform: "TikTok", status: "error", followers: null, error: e instanceof Error ? e.message : "TikTok request failed" }; }
    };
    const [tw, tt] = await Promise.all([twitch(), tiktok()]);
    return [tw, { platform: "YouTube", status: "not_connected", followers: null }, tt, { platform: "Instagram", status: "not_connected", followers: null }];
  });

export const searchTwitchCreators = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { query: string }) => {
    if (typeof input.query !== "string" || input.query.trim().length < 2 || input.query.length > 100) throw new Error("Enter 2–100 characters");
    return { query: input.query.trim().replace(/^@/, "") };
  })
  .handler(async ({ data }): Promise<{ status: string; results: CreatorResult[] }> => {
    const gatewayKey = process.env['LOVABLE_API_KEY'];
    const key = process.env['TWITCH_API_KEY'];
    if (!key || !gatewayKey) return { status: "not_connected", results: [] };
    const response = await fetch(`https://connector-gateway.lovable.dev/twitch/search/channels?query=${encodeURIComponent(data.query)}&first=20`, { headers: { Authorization: `Bearer ${gatewayKey}`, "X-Connection-Api-Key": key } });
    if (!response.ok) { const body = await response.text(); console.error(`Creator search failed [${response.status}]: ${body}`); throw new Error(`Creator search failed [${response.status}]: ${body}`); }
    const result = await response.json();
    return { status: "connected", results: (result.data ?? []).map((c: { id: string; display_name: string; broadcaster_login: string; thumbnail_url: string; broadcaster_language: string }) => ({ id: c.id, display_name: c.display_name, username: c.broadcaster_login, avatar_url: c.thumbnail_url, platform: "Twitch", language: c.broadcaster_language })) };
  });