import { ThemeType } from "@/lib/theme";
import { FrameType } from "@/types/projects";

type LoadingStatusType = "idle" | "running" | "analyzing" |"generating" | "completed";

interface canvasContextType {
  theme?: ThemeType
  setTheme: (id: string) => void;
  themes: ThemeType[];
  frames: FrameType[];
  setFrames: (frames: FrameType[]) => void;
  updateFrame: (id: string, data: Partial<FrameType>) => void
  addFrame: (frame: FrameType) => void
  selectedFrameId: string | null
  selectedFrame: FrameType | null
  setSelectedFrameId: (id: string | null) => void
  loadinStatus : LoadingStatusType
}