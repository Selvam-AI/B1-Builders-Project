import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  CalendarClock,
  DoorOpen,
  Dumbbell,
  Heart,
  LogOut,
  Minimize2,
  Play,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
import "./styles.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : `${window.location.protocol}//${window.location.hostname}:8000`);
const TOKEN_KEY = "fithub_token";
const ROLE_KEY = "fithub_role";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: Record<string, unknown>,
      ) => {
        playVideo: () => void;
        mute: () => void;
        unMute: () => void;
        setVolume: (volume: number) => void;
        seekTo: (seconds: number, allowSeekAhead: boolean) => void;
        destroy: () => void;
      };
      PlayerState?: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type Role = "member" | "admin";

type TokenResponse = {
  access_token: string;
  token_type: string;
  role: Role;
};

type UserRead = {
  id: number;
  name: string;
  email: string | null;
  role: Role;
  is_active: boolean;
};

type TimeSlot = {
  id: number;
  label: string;
  start_hour: number;
  end_hour: number;
  capacity: number;
  current_occupancy: number;
  is_demo: boolean;
};

type WorkoutCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type Reservation = {
  id: number;
  time_slot_id: number;
  workout_category_id: number;
};

type VideoSession = {
  id: number;
  time_slot_id: number;
  workout_category_id: number;
  title: string | null;
  youtube_video_id: string | null;
  youtube_url: string | null;
  duration_seconds: number | null;
  provider: string;
  status: string;
  safety_notes: string | null;
  agent_summary: string | null;
};

type VideoCacheEntry = {
  id: number;
  workout_category_id: number;
  title: string;
  youtube_video_id: string;
  status: string;
  play_count: number;
  curator_summary: string | null;
};

type Occupancy = {
  time_slot_id: number;
  label: string;
  capacity: number;
  current_occupancy: number;
  remaining_capacity: number;
  is_full: boolean;
};

type FeedbackSummary = {
  video_session_id: number;
  title: string | null;
  likes: number;
  dislikes: number;
  total_feedback: number;
  score: number;
};

type Mode = "login" | "register";

type BroadcastSession = {
  video_session_id: number;
  time_slot_id: number;
  workout_category_id: number;
  started_at: string;
  server_time: string;
  playback_offset_seconds: number;
  duration_seconds: number | null;
  participant_count: number;
  exited_participant_count: number;
  status: string;
};

type ApiStatus = {
  debug_enabled: boolean;
};

let frontendDebugEnabled =
  import.meta.env.VITE_DEBUG === "true" || localStorage.getItem("fithub_debug") === "true";

function debugLog(label: string, data?: unknown) {
  if (!frontendDebugEnabled) {
    return;
  }
  if (data === undefined) {
    console.log(`[FitHub AI] ${label}`);
    return;
  }
  console.log(`[FitHub AI] ${label}`, data);
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [role, setRole] = useState<Role | "">(
    () => (localStorage.getItem(ROLE_KEY) as Role | null) || "",
  );
  const [user, setUser] = useState<UserRead | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("Ready");
  const [sessionStatus, setSessionStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [categories, setCategories] = useState<WorkoutCategory[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [videos, setVideos] = useState<VideoSession[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [occupancy, setOccupancy] = useState<Occupancy[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserRead[]>([]);
  const [videoCache, setVideoCache] = useState<VideoCacheEntry[]>([]);
  const [activeBroadcast, setActiveBroadcast] = useState<VideoSession | null>(null);
  const [broadcastCountdown, setBroadcastCountdown] = useState<number | null>(null);
  const [broadcastPlaying, setBroadcastPlaying] = useState(false);
  const [broadcastMinimized, setBroadcastMinimized] = useState(false);
  const [broadcastMuted, setBroadcastMuted] = useState(true);
  const [broadcastSession, setBroadcastSession] = useState<BroadcastSession | null>(null);
  const [feedbackByVideo, setFeedbackByVideo] = useState<Record<number, "like" | "dislike">>({});
  const replacementAttemptsRef = useRef(0);
  const playbackConfirmedRef = useRef<Record<number, string>>({});

  const authHeaders = useMemo<Record<string, string>>(
    () => {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    },
    [token],
  );

  useEffect(() => {
    void loadDebugConfig();
  }, []);

  useEffect(() => {
    if (token) {
      debugLog("Existing token found. Refreshing dashboard.", { role: role || "member" });
      void refreshApp(token, role || "member");
    }
  }, []);

  useEffect(() => {
    if (broadcastCountdown === null) return;

    if (broadcastCountdown <= 0) {
      debugLog("Broadcast countdown completed. Autoplay requested.", {
        muted: broadcastMuted,
        video: activeBroadcast ? videoDebugInfo(activeBroadcast) : null,
      });
      setBroadcastCountdown(null);
      setBroadcastPlaying(true);
      return;
    }

    debugLog("Broadcast countdown tick.", { count: broadcastCountdown });
    const timer = window.setTimeout(() => {
      setBroadcastCountdown((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [broadcastCountdown, broadcastMuted, activeBroadcast]);

  useEffect(() => {
    if (!activeBroadcast || !token) return;

    const syncBroadcast = async () => {
      try {
        const session = await api<BroadcastSession>(
          `/api/broadcast-sessions/${activeBroadcast.id}`,
        );
        setBroadcastSession(session);
        debugLog("Broadcast sync refreshed.", session);
      } catch (error) {
        debugLog("Broadcast sync failed.", error instanceof Error ? error.message : error);
      }
    };

    const timer = window.setInterval(() => {
      void syncBroadcast();
    }, 10000);

    return () => window.clearInterval(timer);
  }, [activeBroadcast?.id, token]);

  async function api<T>(path: string, options: RequestInit = {}, activeToken = token): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let detail = `Request failed with status ${response.status}`;
      try {
        const body = await response.json();
        detail = body.detail || detail;
      } catch {
        // Keep the HTTP fallback detail.
      }
      throw new Error(Array.isArray(detail) ? "Please check the form values." : detail);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }

  async function loadDebugConfig() {
    try {
      const status = await api<ApiStatus>("/api/status", {}, "");
      frontendDebugEnabled =
        status.debug_enabled ||
        import.meta.env.VITE_DEBUG === "true" ||
        localStorage.getItem("fithub_debug") === "true";
      debugLog("Debug configuration loaded.", { frontendDebugEnabled, apiDebug: status.debug_enabled });
    } catch {
      frontendDebugEnabled =
        import.meta.env.VITE_DEBUG === "true" || localStorage.getItem("fithub_debug") === "true";
    }
  }

  async function refreshApp(activeToken = token, activeRole = role) {
    setBusy(true);
    debugLog("Refreshing app data.", { activeRole });
    try {
      const currentUser = await api<UserRead>("/api/auth/me", {}, activeToken);
      setUser(currentUser);
      if (activeRole === "admin" || currentUser.role === "admin") {
        const [adminOccupancy, summaries, users, cacheEntries] = await Promise.all([
          api<Occupancy[]>("/api/admin/occupancy", {}, activeToken),
          api<FeedbackSummary[]>("/api/admin/feedback-summary", {}, activeToken),
          api<UserRead[]>("/api/admin/users", {}, activeToken),
          api<VideoCacheEntry[]>("/api/admin/video-cache", {}, activeToken),
        ]);
        setOccupancy(adminOccupancy);
        setFeedbackSummary(summaries);
        setAdminUsers(users);
        setVideoCache(cacheEntries);
        debugLog("Admin dashboard data loaded.", {
          occupancyRows: adminOccupancy.length,
          feedbackSummaryRows: summaries.length,
          userRows: users.length,
          videoCacheRows: cacheEntries.length,
        });
      } else {
        const [nextSlots, nextCategories, nextReservations, nextVideos] = await Promise.all([
          api<TimeSlot[]>("/api/time-slots", {}, activeToken),
          api<WorkoutCategory[]>("/api/workout-categories", {}, activeToken),
          api<Reservation[]>("/api/reservations/me", {}, activeToken),
          api<VideoSession[]>("/api/video-sessions", {}, activeToken),
        ]);
        setSlots(nextSlots);
        setCategories(nextCategories);
        setReservations(nextReservations);
        setVideos(nextVideos);
        debugLog("Member dashboard data loaded.", {
          slots: nextSlots.length,
          categories: nextCategories.length,
          reservations: nextReservations.length,
          videos: nextVideos.map(videoDebugInfo),
        });
        setSelectedSlot((current) => current || String(nextSlots[0]?.id || ""));
        setSelectedCategory((current) => current || String(nextCategories[0]?.id || ""));
      }
      setMessage("Dashboard synced");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to refresh dashboard";
      debugLog("Refresh failed.", detail);
      if (isAuthFailure(detail)) {
        clearSession("Session expired. Please sign in again.");
      } else {
        setMessage(detail);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "");
    setBusy(true);

    try {
      const payload =
        mode === "register"
          ? { name, email, password, age: Number(form.get("age") || 0) || undefined }
          : { email, password };
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const auth = await api<TokenResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem(TOKEN_KEY, auth.access_token);
      localStorage.setItem(ROLE_KEY, auth.role);
      setToken(auth.access_token);
      setRole(auth.role);
      debugLog("Authentication succeeded.", { mode, role: auth.role });
      setMessage(mode === "register" ? "Member account created" : "Signed in");
      await refreshApp(auth.access_token, auth.role);
    } catch (error) {
      debugLog("Authentication failed.", error instanceof Error ? error.message : error);
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function reserveSlot(useDemoSlot = false) {
    if (!selectedSlot || !selectedCategory) return;
    setBusy(true);
    try {
      const slotId = useDemoSlot ? demoSlotId(slots) : Number(selectedSlot);
      const workoutCategoryId = Number(selectedCategory);
      debugLog("Reservation requested.", {
        useDemoSlot,
        selectedSlot,
        resolvedSlotId: slotId,
        workoutCategoryId,
      });
      if (!slotId) {
        throw new Error("No available demo slot found.");
      }
      setSessionStatus(
        useDemoSlot
          ? "Demo session selected. Looking for a playable workout video."
          : "Reservation selected.",
      );
      const reservation = await api<Reservation>("/api/reservations", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          time_slot_id: slotId,
          workout_category_id: workoutCategoryId,
        }),
      });
      debugLog("Reservation created or updated.", { slotId, workoutCategoryId, reservation });

      if (!useDemoSlot && !isSlotCurrentlyActive(slots, slotId)) {
        setActiveBroadcast(null);
        setBroadcastSession(null);
        setBroadcastPlaying(false);
        setBroadcastCountdown(null);
        setBroadcastMinimized(false);
        setSessionStatus(
          `${labelForSlot(slots, slotId)} reserved for ${labelForCategory(
            categories,
            workoutCategoryId,
          )}. Broadcast will be prepared when the slot time arrives.`,
        );
        setMessage("Reservation confirmed");
        await refreshApp();
        return;
      }

      setSessionStatus("Checking whether this session is already in progress.");
      const ongoingBroadcast = await findOngoingBroadcast(slotId, workoutCategoryId);
      if (ongoingBroadcast) {
        setSessionStatus("Session has already begun. Joining the ongoing broadcast.");
        await beginBroadcast(ongoingBroadcast.video);
        setMessage("Joined ongoing broadcast");
        await refreshApp();
        return;
      }

      setSessionStatus("Searching for an embeddable workout video. This can take a moment.");
      const video = await api<VideoSession>("/api/video-sessions/recommend", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          time_slot_id: slotId,
          workout_category_id: workoutCategoryId,
        }),
      });
      debugLog("Broadcast recommendation received.", videoDebugInfo(video));
      setSessionStatus(
        `${video.provider} video ready: ${video.title || "Workout broadcast"}. Opening broadcast player.`,
      );
      if (useDemoSlot || isSlotCurrentlyActive(slots, slotId)) {
        await beginBroadcast(video);
      }
      debugLog("Reservation flow completed. Backend created or reused video recommendation.", {
        slotId,
        workoutCategoryId,
      });
      setMessage(useDemoSlot ? "Demo broadcast is ready" : "Reservation confirmed and workout video prepared");
      await refreshApp();
    } catch (error) {
      debugLog("Reservation failed.", error instanceof Error ? error.message : error);
      const detail = error instanceof Error ? error.message : "Reservation failed";
      setSessionStatus(detail);
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function findOngoingBroadcast(timeSlotId: number, workoutCategoryId: number) {
    const latestVideos = await api<VideoSession[]>("/api/video-sessions");
    const candidates = latestVideos.filter(
      (video) =>
        video.time_slot_id === timeSlotId &&
        video.workout_category_id === workoutCategoryId,
    );

    for (const video of candidates) {
      try {
        const session = await api<BroadcastSession>(`/api/broadcast-sessions/${video.id}`);
        if (session.status === "active") {
          return { video };
        }
      } catch {
        // No active broadcast for this video; continue checking candidates.
      }
    }
    return null;
  }

  async function beginBroadcast(video: VideoSession) {
    debugLog("Broadcast theater opening.", videoDebugInfo(video));
    const session = await api<BroadcastSession>("/api/broadcast-sessions/start", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ video_session_id: video.id }),
    });
    debugLog("Shared broadcast session joined.", session);
    setActiveBroadcast(video);
    setBroadcastSession(session);
    setBroadcastMinimized(false);
    setBroadcastMuted(true);
    setBroadcastPlaying(false);
    setBroadcastCountdown(3);
    replacementAttemptsRef.current = 0;
    setSessionStatus(
      `Broadcast synced. ${session.participant_count} participant(s), starting at ${session.playback_offset_seconds}s.`,
    );
  }

  async function handlePlaybackFailure(reason: string) {
    if (!activeBroadcast) return;
    if (replacementAttemptsRef.current >= 2) {
      setSessionStatus("Video could not start after replacement attempts. Please refresh and try again.");
      debugLog("Playback replacement stopped after max attempts.", {
        reason,
        video: videoDebugInfo(activeBroadcast),
      });
      return;
    }

    replacementAttemptsRef.current += 1;
    setSessionStatus("Video did not start. Asking the recommender for another playable video.");
    debugLog("Playback failure detected. Requesting replacement video.", {
      reason,
      attempt: replacementAttemptsRef.current,
      video: videoDebugInfo(activeBroadcast),
    });

    try {
      const updated = await api<VideoSession>(`/api/video-sessions/${activeBroadcast.id}/replace`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          failed_video_id: activeBroadcast.youtube_video_id,
          reason,
        }),
      });
      setActiveBroadcast(updated);
      setVideos((current) => current.map((video) => (video.id === updated.id ? updated : video)));
      setBroadcastPlaying(true);
      setBroadcastCountdown(null);
      setSessionStatus(
        `Replacement video loaded: ${updated.title || "Workout broadcast"}. Checking playback now.`,
      );
      debugLog("Replacement video received.", videoDebugInfo(updated));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to replace video";
      setSessionStatus(detail);
      debugLog("Replacement video request failed.", detail);
    }
  }

  async function handlePlaybackConfirmed(video: VideoSession) {
    if (playbackConfirmedRef.current[video.id] === video.youtube_video_id) return;
    playbackConfirmedRef.current[video.id] = video.youtube_video_id || "";
    replacementAttemptsRef.current = 0;
    setSessionStatus("Video playback confirmed. Broadcast is running.");
    debugLog("Playback confirmed by YouTube IFrame Player API.", videoDebugInfo(video));

    try {
      const updated = await api<VideoSession>(`/api/video-sessions/${video.id}/playable`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ youtube_video_id: video.youtube_video_id }),
      });
      setActiveBroadcast((current) => (current?.id === updated.id ? updated : current));
      setVideos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      debugLog("Playback confirmation save failed.", error instanceof Error ? error.message : error);
    }
  }

  async function cancelReservation(id: number) {
    setBusy(true);
    try {
      await api<void>(`/api/reservations/${id}`, { method: "DELETE", headers: authHeaders });
      debugLog("Reservation cancelled.", { reservationId: id });
      setReservations((current) => current.filter((reservation) => reservation.id !== id));
      setActiveBroadcast(null);
      setBroadcastSession(null);
      setBroadcastPlaying(false);
      setBroadcastCountdown(null);
      setBroadcastMinimized(false);
      setSessionStatus("Reservation cancelled.");
      setMessage("Reservation cancelled");
      await refreshApp();
    } catch (error) {
      debugLog("Cancellation failed.", error instanceof Error ? error.message : error);
      const detail = error instanceof Error ? error.message : "Cancellation failed";
      setSessionStatus(detail);
      setMessage(detail);
    } finally {
      setBusy(false);
    }
  }

  async function sendFeedback(videoSessionId: number, value: "like" | "dislike") {
    setBusy(true);
    try {
      await api("/api/feedback", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ video_session_id: videoSessionId, value }),
      });
      debugLog("Feedback saved.", { videoSessionId, value });
      setFeedbackByVideo((current) => ({ ...current, [videoSessionId]: value }));
      setMessage(value === "like" ? "Feedback saved: liked" : "Feedback saved: disliked");
    } catch (error) {
      debugLog("Feedback failed.", error instanceof Error ? error.message : error);
      setMessage(error instanceof Error ? error.message : "Feedback failed");
    } finally {
      setBusy(false);
    }
  }

  async function refreshBroadcasts() {
    setBusy(true);
    try {
      debugLog("Broadcast refresh requested.", {
        reservations: reservations.map((reservation) => ({
          timeSlotId: reservation.time_slot_id,
          workoutCategoryId: reservation.workout_category_id,
        })),
      });
      await Promise.all(
        reservations.map((reservation) =>
          api<VideoSession>("/api/video-sessions/recommend", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({
              time_slot_id: reservation.time_slot_id,
              workout_category_id: reservation.workout_category_id,
            }),
          }),
        ),
      );
      debugLog("Broadcast recommendation refresh completed.");
      setMessage("Workout broadcast refreshed");
      await refreshApp();
    } catch (error) {
      debugLog("Broadcast refresh failed.", error instanceof Error ? error.message : error);
      setMessage(error instanceof Error ? error.message : "Broadcast refresh failed");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    clearSession("Signed out");
  }

  function clearSession(nextMessage: string) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setToken("");
    setRole("");
    setUser(null);
    setReservations([]);
    setVideos([]);
    setAdminUsers([]);
    setActiveBroadcast(null);
    setBroadcastSession(null);
    setBroadcastPlaying(false);
    setBroadcastCountdown(null);
    setBroadcastMinimized(false);
    setFeedbackByVideo({});
    setSessionStatus("");
    setMessage(nextMessage);
  }

  async function exitBroadcastSession() {
    if (!activeBroadcast) return;
    await api<BroadcastSession>(`/api/broadcast-sessions/${activeBroadcast.id}/exit`, {
      method: "POST",
      headers: authHeaders,
    });
    setActiveBroadcast(null);
    setBroadcastSession(null);
    setBroadcastPlaying(false);
    setBroadcastCountdown(null);
    setBroadcastMinimized(false);
    setSessionStatus("Exited broadcast session. You can start the demo slot again after the session is empty.");
    setMessage("Exited broadcast session");
  }

  function scrollToPanel(id: string) {
    const target = document.getElementById(id) || document.getElementById("broadcast");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function updateUserStatus(userId: number, isActive: boolean) {
    setBusy(true);
    try {
      const updated = await api<UserRead>(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ is_active: isActive }),
      });
      setAdminUsers((current) => current.map((user) => (user.id === userId ? updated : user)));
      setMessage(isActive ? "Member account reactivated" : "Member account paused");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update member account");
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(userId: number) {
    const confirmed = window.confirm("Delete this member account and its reservations/feedback?");
    if (!confirmed) return;

    setBusy(true);
    try {
      await api<void>(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setAdminUsers((current) => current.filter((user) => user.id !== userId));
      setMessage("Member account deleted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete member account");
    } finally {
      setBusy(false);
    }
  }

  async function runVideoCurator() {
    setBusy(true);
    try {
      const result = await api<{ created_pending: number; categories: number }>(
        "/api/admin/video-cache/curate",
        {
          method: "POST",
          headers: authHeaders,
        },
      );
      setMessage(`Curator checked ${result.categories} categories`);
      await refreshApp();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to run video curator");
    } finally {
      setBusy(false);
    }
  }

  const activeBroadcastList = activeBroadcast ? [activeBroadcast] : [];

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__shade" />
        <nav className="nav" aria-label="Main navigation">
          <strong>FitHub AI</strong>
          <button type="button" onClick={() => scrollToPanel("slots")}>
            Slots
          </button>
          <button type="button" onClick={() => scrollToPanel("broadcast")}>
            Broadcast
          </button>
          <button type="button" onClick={() => scrollToPanel("feedback")}>
            Feedback
          </button>
          {user ? (
            <button className="icon-button" type="button" onClick={signOut} title="Sign out">
              <LogOut size={18} />
            </button>
          ) : null}
        </nav>
        <div className={!token ? "hero__layout" : "hero__layout hero__layout--solo"}>
          <div className="hero__content">
            <p className="eyebrow">AI-assisted social workout club</p>
            <h1>Reserve. Move. Improve.</h1>
            <p>
              A single-page dashboard for members to book workout slots, receive curated workout
              sessions, and send feedback that improves future recommendations.
            </p>
            <div className="hero__actions" aria-live="polite">
              <span className={busy ? "status status--busy" : "status"}>{message}</span>
              {user ? <span className="status status--light">{user.name || user.email || user.role}</span> : null}
            </div>
          </div>
          {!token ? (
            <AuthPanel
              mode={mode}
              setMode={setMode}
              submitAuth={submitAuth}
              busy={busy}
            />
          ) : null}
        </div>
      </section>

      {token && role === "admin" ? (
        <AdminDashboard
          user={user}
          occupancy={occupancy}
          feedbackSummary={feedbackSummary}
          users={adminUsers}
          videoCache={videoCache}
          updateUserStatus={updateUserStatus}
          deleteUser={deleteUser}
          runVideoCurator={runVideoCurator}
          refresh={() => refreshApp()}
          busy={busy}
        />
      ) : token ? (
        <MemberDashboard
          user={user}
          slots={slots}
          categories={categories}
          reservations={reservations}
          activeVideos={activeBroadcastList}
          selectedSlot={selectedSlot}
          selectedCategory={selectedCategory}
          sessionStatus={sessionStatus}
          setSelectedSlot={setSelectedSlot}
          setSelectedCategory={setSelectedCategory}
          reserveSlot={reserveSlot}
          cancelReservation={cancelReservation}
          sendFeedback={sendFeedback}
          feedbackByVideo={feedbackByVideo}
          refresh={() => refreshApp()}
          busy={busy}
        />
      ) : null}

      {activeBroadcast && role !== "admin" ? (
        <BroadcastTheater
          video={activeBroadcast}
          countdown={broadcastCountdown}
          playing={broadcastPlaying}
          startAtSeconds={broadcastSession?.playback_offset_seconds || 0}
          syncOffsetSeconds={broadcastSession?.playback_offset_seconds || 0}
          participantCount={broadcastSession?.participant_count || 1}
          muted={broadcastMuted}
          setMuted={setBroadcastMuted}
          minimized={broadcastMinimized}
          minimize={() => setBroadcastMinimized(true)}
          resume={() => setBroadcastMinimized(false)}
          exitSession={exitBroadcastSession}
          onPlaybackFailure={handlePlaybackFailure}
          onPlaybackConfirmed={handlePlaybackConfirmed}
        />
      ) : null}
    </main>
  );
}

function AuthPanel({
  mode,
  setMode,
  submitAuth,
  busy,
}: {
  mode: Mode;
  setMode: (mode: Mode) => void;
  submitAuth: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  return (
    <section className="auth-section" aria-label="Authentication">
      <div className="section-heading">
        <p className="eyebrow">Start here</p>
        <h2>{mode === "login" ? "Sign in" : "Create member account"}</h2>
      </div>
      <div className="segmented" role="tablist" aria-label="Auth mode">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
          Sign in
        </button>
        <button
          className={mode === "register" ? "active" : ""}
          onClick={() => setMode("register")}
        >
          <UserPlus size={16} />
          Register
        </button>
      </div>
      <form className="auth-form" onSubmit={submitAuth}>
        {mode === "register" ? (
          <>
            <label>
              Name
              <input name="name" required minLength={1} placeholder="Member name" />
            </label>
            <label>
              Age
              <input name="age" type="number" min={1} max={120} placeholder="Optional" />
            </label>
          </>
        ) : null}
        <label>
          Email
          <input name="email" type="email" required placeholder="member@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" required minLength={6} placeholder="member123" />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          <ShieldCheck size={18} />
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </section>
  );
}

function MemberDashboard({
  user,
  slots,
  categories,
  reservations,
  activeVideos,
  selectedSlot,
  selectedCategory,
  sessionStatus,
  setSelectedSlot,
  setSelectedCategory,
  reserveSlot,
  cancelReservation,
  sendFeedback,
  feedbackByVideo,
  refresh,
  busy,
}: {
  user: UserRead | null;
  slots: TimeSlot[];
  categories: WorkoutCategory[];
  reservations: Reservation[];
  activeVideos: VideoSession[];
  selectedSlot: string;
  selectedCategory: string;
  sessionStatus: string;
  setSelectedSlot: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  reserveSlot: (useDemoSlot?: boolean) => void;
  cancelReservation: (id: number) => void;
  sendFeedback: (videoSessionId: number, value: "like" | "dislike") => void;
  feedbackByVideo: Record<number, "like" | "dislike">;
  refresh: () => void;
  busy: boolean;
}) {
  return (
    <section className="workspace">
      <div className="dashboard-title-panel">
        <p className="eyebrow">Member dashboard</p>
        <h2>{user?.name || "Member"}</h2>
      </div>
      <div className="workspace__grid">
        <section id="slots" className="tool-panel">
          <div className="panel-title">
            <CalendarClock size={20} />
            <h3>Reserve a workout</h3>
          </div>
          <label>
            Time slot
            <select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}>
              <option value="demo-now">Demo time slot (Starts now)</option>
              {slots.filter((slot) => !slot.is_demo).map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label} - {slot.current_occupancy}/{slot.capacity}
                </option>
              ))}
            </select>
          </label>
          <label>
            Workout category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="primary-button"
            onClick={() => reserveSlot(selectedSlot === "demo-now")}
            disabled={busy}
          >
            <Dumbbell size={18} />
            Reserve slot
          </button>
        </section>

        <section className="tool-panel">
          <div className="panel-title">
            <Activity size={20} />
            <h3>Your reservations</h3>
          </div>
          {reservations.length === 0 ? (
            <p className="muted">No reservations yet.</p>
          ) : (
            <ul className="stack-list">
              {reservations.map((reservation) => (
                <li key={reservation.id}>
                  <span>
                    {labelForSlot(slots, reservation.time_slot_id)} ·{" "}
                    {labelForCategory(categories, reservation.workout_category_id)}
                  </span>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => cancelReservation(reservation.id)}
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="tool-panel tool-panel--wide session-panel" aria-live="polite">
          <div className="panel-title">
            <Activity size={20} />
            <h3>Session status</h3>
          </div>
          <p>{sessionStatus}</p>
        </section>

        <section id="broadcast" className="tool-panel tool-panel--wide">
          <div className="panel-title">
            <Heart size={20} />
            <h3>Workout broadcast</h3>
            <button className="ghost-button" onClick={refresh} disabled={busy}>
              Refresh
            </button>
          </div>
          {activeVideos.length === 0 ? (
            <p className="muted">No active broadcast loaded. Select a time slot to prepare the session.</p>
          ) : (
            <div className="video-grid">
              {activeVideos.map((video) => (
                <article key={video.id} className="video-item">
                  <span className="status">{video.provider}</span>
                  <h4>{video.title || "Workout video"}</h4>
                  <p>{video.safety_notes}</p>
                  <p className="muted">{video.agent_summary}</p>
                  <div className="button-row">
                    <button
                      onClick={() => sendFeedback(video.id, "like")}
                      className={feedbackByVideo[video.id] === "like" ? "icon-text icon-text--liked" : "icon-text"}
                    >
                      <ThumbsUp size={17} />
                      Like
                    </button>
                    <button
                      onClick={() => sendFeedback(video.id, "dislike")}
                      className={
                        feedbackByVideo[video.id] === "dislike"
                          ? "icon-text icon-text--disliked"
                          : "icon-text"
                      }
                    >
                      <ThumbsDown size={17} />
                      Dislike
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function BroadcastTheater({
  video,
  countdown,
  playing,
  startAtSeconds,
  syncOffsetSeconds,
  participantCount,
  muted,
  setMuted,
  minimized,
  minimize,
  resume,
  exitSession,
  onPlaybackFailure,
  onPlaybackConfirmed,
}: {
  video: VideoSession;
  countdown: number | null;
  playing: boolean;
  startAtSeconds: number;
  syncOffsetSeconds: number;
  participantCount: number;
  muted: boolean;
  setMuted: (value: boolean) => void;
  minimized: boolean;
  minimize: () => void;
  resume: () => void;
  exitSession: () => void;
  onPlaybackFailure: (reason: string) => void;
  onPlaybackConfirmed: (video: VideoSession) => void;
}) {
  const isCountingDown = countdown !== null;
  const toggleAudio = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    window.dispatchEvent(
      new CustomEvent("fithub:broadcast-audio", { detail: { muted: nextMuted } }),
    );
  };

  return (
    <section
      className={minimized ? "broadcast-theater broadcast-theater--minimized" : "broadcast-theater"}
      aria-label="Workout broadcast"
    >
      <div className="broadcast-theater__bar">
        <div>
          <p className="eyebrow">Live broadcast</p>
          <h2>{video.title || "Workout session"}</h2>
          <p className="broadcast-meta">
            Synced at {startAtSeconds}s · {participantCount} participant(s)
          </p>
        </div>
        <div className="broadcast-theater__controls">
          <button className="icon-text" type="button" onClick={toggleAudio}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            {muted ? "Unmute" : "Mute"}
          </button>
          <button className="icon-text" type="button" onClick={minimize}>
            <Minimize2 size={18} />
            Minimize
          </button>
          <button className="icon-text icon-text--danger" type="button" onClick={exitSession}>
            <DoorOpen size={18} />
            Exit session
          </button>
        </div>
      </div>
      <div className="broadcast-stage">
        {isCountingDown ? (
          <div className="broadcast-slate" aria-live="assertive">
            <p>The workout session will begin now</p>
            <strong>{countdown}</strong>
          </div>
        ) : (
          <VideoPlayer
            video={video}
            autoPlay={playing}
            muted={muted}
            controls={false}
            startAtSeconds={startAtSeconds}
            syncOffsetSeconds={syncOffsetSeconds}
            onPlaybackFailure={onPlaybackFailure}
            onPlaybackConfirmed={() => onPlaybackConfirmed(video)}
          />
        )}
      </div>
      {minimized ? (
        <button className="broadcast-chip" type="button" onClick={resume}>
          <Play size={17} />
          Resume broadcast
        </button>
      ) : null}
    </section>
  );
}

function VideoPlayer({
  video,
  autoPlay = false,
  muted = true,
  controls = false,
  startAtSeconds = 0,
  syncOffsetSeconds = 0,
  onPlaybackFailure,
  onPlaybackConfirmed,
}: {
  video: VideoSession;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  startAtSeconds?: number;
  syncOffsetSeconds?: number;
  onPlaybackFailure: (reason: string) => void;
  onPlaybackConfirmed: () => void;
}) {
  const playerRef = useRef<{
    playVideo: () => void;
    mute: () => void;
    unMute: () => void;
    setVolume: (volume: number) => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    destroy: () => void;
  } | null>(null);
  const healthTimerRef = useRef<number | null>(null);
  const playbackStartedRef = useRef(false);
  const failureReportedRef = useRef(false);
  const mutedRef = useRef(muted);
  const syncOffsetRef = useRef(syncOffsetSeconds);
  const onPlaybackFailureRef = useRef(onPlaybackFailure);
  const onPlaybackConfirmedRef = useRef(onPlaybackConfirmed);
  const [validationMessage, setValidationMessage] = useState("Video is buffering. Please wait.");
  const playerElementId = useRef(`youtube-player-${video.id}-${Math.random().toString(36).slice(2)}`);
  const youtubeVideoId = useMemo(() => playableYouTubeVideoId(video), [
    video.youtube_video_id,
    video.workout_category_id,
  ]);

  useEffect(() => {
    mutedRef.current = muted;
    onPlaybackFailureRef.current = onPlaybackFailure;
    onPlaybackConfirmedRef.current = onPlaybackConfirmed;
  }, [muted, onPlaybackFailure, onPlaybackConfirmed]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      player.mute();
    } else {
      player.unMute();
      player.setVolume(100);
      player.playVideo();
    }
  }, [muted]);

  useEffect(() => {
    const handleAudioToggle = (event: Event) => {
      const nextMuted = Boolean((event as CustomEvent<{ muted: boolean }>).detail?.muted);
      const player = playerRef.current;
      if (!player) return;
      if (nextMuted) {
        player.mute();
        return;
      }
      player.unMute();
      player.setVolume(100);
      player.playVideo();
      debugLog("Broadcast audio explicitly unmuted from user click.");
    };

    window.addEventListener("fithub:broadcast-audio", handleAudioToggle);
    return () => window.removeEventListener("fithub:broadcast-audio", handleAudioToggle);
  }, []);

  useEffect(() => {
    syncOffsetRef.current = syncOffsetSeconds;
    if (syncOffsetSeconds > 0) {
      playerRef.current?.seekTo(Math.floor(syncOffsetSeconds), true);
    }
  }, [syncOffsetSeconds]);

  debugLog("Rendering video player.", {
    ...videoDebugInfo(video),
    youtubeVideoId,
    autoPlay,
    muted,
    controls,
    startAtSeconds,
    syncOffsetSeconds,
  });

  useEffect(() => {
    if (!youtubeVideoId) return;
    let cancelled = false;

    setValidationMessage("Video is buffering. Please wait.");
    playbackStartedRef.current = false;
    failureReportedRef.current = false;

    const reportFailure = (reason: string) => {
      if (failureReportedRef.current) return;
      failureReportedRef.current = true;
      if (healthTimerRef.current !== null) {
        window.clearTimeout(healthTimerRef.current);
        healthTimerRef.current = null;
      }
      setValidationMessage("The selected video did not start. Finding another video.");
      onPlaybackFailureRef.current(reason);
    };

    const clearHealthTimer = () => {
      if (healthTimerRef.current !== null) {
        window.clearTimeout(healthTimerRef.current);
        healthTimerRef.current = null;
      }
    };

    loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT) return;
        playerRef.current?.destroy();
        playerRef.current = new window.YT.Player(playerElementId.current, {
          host: "https://www.youtube-nocookie.com",
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: controls ? 1 : 0,
            disablekb: 1,
            modestbranding: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0,
            start: Math.max(0, Math.floor(startAtSeconds)),
          },
          events: {
            onReady: () => {
              const player = playerRef.current;
              if (!player) return;
              if (mutedRef.current) {
                player.mute();
              } else {
                player.unMute();
                player.setVolume(100);
              }
              if (syncOffsetRef.current > 0) {
                player.seekTo(Math.floor(syncOffsetRef.current), true);
              }
              if (autoPlay) {
                player.playVideo();
              }
              healthTimerRef.current = window.setTimeout(() => {
                if (!playbackStartedRef.current) {
                  reportFailure("YouTube video did not start within 5 seconds.");
                }
              }, 5000);
            },
            onStateChange: (event: { data: number }) => {
              if (event.data === window.YT?.PlayerState?.PLAYING) {
                playbackStartedRef.current = true;
                clearHealthTimer();
                setValidationMessage("");
                onPlaybackConfirmedRef.current();
              }
            },
            onError: (event: { data: number }) => {
              reportFailure(`YouTube player error ${event.data}`);
            },
          },
        });
      })
      .catch(() => reportFailure("YouTube IFrame Player API could not be loaded."));

    return () => {
      cancelled = true;
      clearHealthTimer();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [
    autoPlay,
    controls,
    startAtSeconds,
    video.id,
    youtubeVideoId,
  ]);

  if (!youtubeVideoId) {
    return (
      <div className="video-player video-player--empty">
        <Play size={28} />
        <span>Playable video pending</span>
      </div>
    );
  }

  return (
    <div className={validationMessage ? "video-player video-player--validating" : "video-player"}>
      <div id={playerElementId.current} title={video.title || "Workout video"} />
      {validationMessage ? (
        <div className="video-player__overlay" aria-live="polite">
          <Play size={28} />
          <span>{validationMessage}</span>
        </div>
      ) : null}
    </div>
  );
}

function playableYouTubeVideoId(video: VideoSession) {
  const fallbackByCategory: Record<number, string> = {
    1: "HRvFxrFGqA4",
    2: "YyBcMVQylas",
    3: "VWj8ZxCxrYk",
  };
  return (
    video.youtube_video_id && !video.youtube_video_id.startsWith("mock-")
      ? video.youtube_video_id
      : fallbackByCategory[video.workout_category_id]
  );
}

let youtubeIframeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }
  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise;
  }

  youtubeIframeApiPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      resolve();
    };

    if (existingScript) {
      existingScript.addEventListener("error", () => reject(new Error("YouTube API failed")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube API failed"));
    document.body.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

function videoDebugInfo(video: VideoSession) {
  return {
    id: video.id,
    provider: video.provider,
    status: video.status,
    youtubeVideoId: video.youtube_video_id,
    isMockId: Boolean(video.youtube_video_id?.startsWith("mock-")),
    youtubeUrl: video.youtube_url,
    title: video.title,
    timeSlotId: video.time_slot_id,
    workoutCategoryId: video.workout_category_id,
  };
}

function demoSlotId(slots: TimeSlot[]) {
  return slots.find((slot) => slot.is_demo)?.id || 0;
}

function isSlotCurrentlyActive(slots: TimeSlot[], id: number) {
  const slot = slots.find((item) => item.id === id);
  if (!slot) return false;
  if (slot.is_demo) return true;
  const currentHour = new Date().getHours();
  return currentHour >= slot.start_hour && currentHour < slot.end_hour;
}

function AdminDashboard({
  user,
  occupancy,
  feedbackSummary,
  users,
  videoCache,
  updateUserStatus,
  deleteUser,
  runVideoCurator,
  refresh,
  busy,
}: {
  user: UserRead | null;
  occupancy: Occupancy[];
  feedbackSummary: FeedbackSummary[];
  users: UserRead[];
  videoCache: VideoCacheEntry[];
  updateUserStatus: (userId: number, isActive: boolean) => void;
  deleteUser: (userId: number) => void;
  runVideoCurator: () => void;
  refresh: () => void;
  busy: boolean;
}) {
  return (
    <section className="workspace">
      <div className="dashboard-title-panel">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h2>{user?.email || "Admin"}</h2>
        </div>
      </div>
      <div className="workspace__grid">
        <section className="tool-panel tool-panel--wide">
          <div className="panel-title">
            <UserPlus size={20} />
            <h3>Member accounts</h3>
            <button className="ghost-button" onClick={refresh} disabled={busy}>
              Refresh
            </button>
          </div>
          {users.length === 0 ? (
            <p className="muted">No member accounts yet.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email || "No email"}</td>
                      <td>{member.is_active ? "Active" : "Paused"}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className={member.is_active ? "ghost-button danger-button" : "ghost-button"}
                            type="button"
                            disabled={busy}
                            onClick={() => updateUserStatus(member.id, !member.is_active)}
                          >
                            {member.is_active ? "Pause" : "Reactivate"}
                          </button>
                          <button
                            className="ghost-button danger-button"
                            type="button"
                            disabled={busy}
                            onClick={() => deleteUser(member.id)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="tool-panel tool-panel--wide">
          <div className="panel-title">
            <Activity size={20} />
            <h3>Video cache</h3>
            <div className="button-row">
              <button className="ghost-button blue-button" onClick={runVideoCurator} disabled={busy}>
                Run curator
              </button>
              <button className="ghost-button" onClick={refresh} disabled={busy}>
                Refresh
              </button>
            </div>
          </div>
          {videoCache.length === 0 ? (
            <p className="muted">No confirmed or pending cache entries yet.</p>
          ) : (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Video</th>
                    <th>Status</th>
                    <th>Plays</th>
                  </tr>
                </thead>
                <tbody>
                  {videoCache.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.workout_category_id}</td>
                      <td>{entry.title}</td>
                      <td>{entry.status}</td>
                      <td>{entry.play_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="tool-panel tool-panel--wide">
          <div className="panel-title">
            <CalendarClock size={20} />
            <h3>Slot occupancy</h3>
          </div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Reserved</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {occupancy.map((slot) => (
                  <tr key={slot.time_slot_id}>
                    <td>{slot.label}</td>
                    <td>
                      {slot.current_occupancy}/{slot.capacity}
                    </td>
                    <td>{slot.remaining_capacity}</td>
                    <td>{slot.is_full ? "Full" : "Open"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="tool-panel">
          <div className="panel-title">
            <Heart size={20} />
            <h3>Feedback summary</h3>
          </div>
          {feedbackSummary.length === 0 ? (
            <p className="muted">No feedback yet.</p>
          ) : (
            <ul className="stack-list">
              {feedbackSummary.map((item) => (
                <li key={item.video_session_id}>
                  <span>
                    {item.title || "Video"} · {item.likes} like / {item.dislikes} dislike
                  </span>
                  <strong>{item.score}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}

function labelForSlot(slots: TimeSlot[], id: number) {
  return slots.find((slot) => slot.id === id)?.label || `Slot ${id}`;
}

function labelForCategory(categories: WorkoutCategory[], id: number) {
  return categories.find((category) => category.id === id)?.name || `Category ${id}`;
}

function isAuthFailure(detail: string) {
  const normalized = detail.toLowerCase();
  return (
    normalized.includes("401") ||
    normalized.includes("not authenticated") ||
    normalized.includes("could not validate credentials") ||
    normalized.includes("invalid token") ||
    normalized.includes("session expired")
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
