import { fetchRealtimeSubscriptionToken } from "@/app/action/realtime";
import { THEME_LIST, ThemeType } from "@/lib/theme";
import { FrameType } from "@/types/projects";
import { useInngestSubscription } from "@inngest/realtime/hooks"
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { set } from "zod";
import { is } from "zod/v4/locales";

export type LoadingStatusType =
  | "idle"
  | "running"
  | "analyzing"
  | "generating"
  | "completed";

interface canvasContextType {
  theme?: ThemeType;
  setTheme: (id: string) => void;
  themes: ThemeType[];
  frames: FrameType[];
  setFrames: (frames: FrameType[]) => void;
  updateFrame: (id: string, data: Partial<FrameType>) => void;
  addFrame: (frame: FrameType) => void;
  selectedFrameId: string | null;
  selectedFrame: FrameType | null;
  setSelectedFrameId: (id: string | null) => void;
  loadingStatus: LoadingStatusType;
}

const CanvasContext = createContext<canvasContextType | undefined>(undefined);

export const CanvasProvider = ({
  children,
  initialFrames,
  initialThemeId,
  hasInitialData,
  projectId,
}: {
  children: ReactNode;
  initialFrames: FrameType[];
  initialThemeId?: string;
  hasInitialData: boolean;
  projectId: string | null;
}) => {
  const [themeId, setThemeId] = useState<string>(
    initialThemeId || THEME_LIST[0].id
  );
  const [frames, setFrames] = useState<FrameType[]>(initialFrames);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] =
    useState<LoadingStatusType | null>(hasInitialData? "idle":null);
  
  const [prevProjectId, setPrevProjectId] = useState(projectId);
  if (projectId !== prevProjectId) {
    setPrevProjectId(projectId);
    setFrames(initialFrames)
    setThemeId(initialThemeId || THEME_LIST[0].id)
    setSelectedFrameId(null)
  }
  
  const theme = THEME_LIST.find((t) => t.id === themeId);
  const selectedFrame =
    selectedFrameId && frames?.length != 0
      ? frames?.find((f) => f.id === selectedFrameId) || null
      : null;
  
  
  //Update the loading status inngest realtime events
  const {freshData} = useInngestSubscription({
    refreshToken: fetchRealtimeSubscriptionToken,
  });

  useEffect(() => {
    if (!freshData || freshData.length === 0) return;
    freshData.forEach((msg) => {
      const { topic, data } = msg;
      if (data.projectId !== projectId) return;
      
      switch (topic) {
        case "generation.start":
          setLoadingStatus("running");
          break;
        case "analysis.start":
          setLoadingStatus("analyzing");
          break;
        case "analysis.complete":
          if (data.theme) setThemeId(data.theme);
          if (data.screens && data.screens.length > 0) {
            const skeletonFrames: FrameType[] = data.screens.map((s:any) => ({
              id: s.id,
              title: s.name,
              htmlContent: "",
              isLoading: true,
            }));
            setFrames((prev)=>[...prev,...skeletonFrames]);
          }
          break;
        case "generation.complete":
          setLoadingStatus("completed");
          setTimeout(() => setLoadingStatus("idle"), 1000);
          break;
        default:
          break;
      }
    })
  },[projectId,freshData])


  const addFrame = useCallback((frame:FrameType) => {
    setFrames((prev)=>[...prev,frame])
  }, []);
  
  const updateFrame = useCallback((id: string, data: Partial<FrameType>) => {
    setFrames((prev) => {
      return prev.map((frame) => frame.id === id ?
        {...frame, ...data}:frame)
    })
  }, []);
  
  return (
    <CanvasContext.Provider
      value={{
        theme,
        setTheme: setThemeId,
        themes: THEME_LIST,
        frames,
        setFrames,
        selectedFrameId,
        selectedFrame,
        setSelectedFrameId,
        updateFrame,
        addFrame,
        loadingStatus
      }}
    >
      {children}
    </CanvasContext.Provider>
  )
};


export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider")
  return ctx
}
