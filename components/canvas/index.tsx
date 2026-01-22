import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch"
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Spinner } from "../ui/spinner";
import CanvasFloatingToolBar from "./floating-toolbars";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constants/canva";
import CanvasControls from "./canvas-control";

const Canvas = ({
  projectId,
  projectName,
  isPending,
}: {
  projectId: string;
  isPending: boolean;
  projectName: string | null;
}) => {
  const { theme, frames, selectedFrame, setSelectedFrameId, loadingStatus } =
    useCanvas();
  
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT)
  const [zoomPercent,setZoomPercent] = useState<number>(53)
  const [currentScale,setCurrentScale] = useState<number>(0.53)

  const currentStatus = isPending
    ? "fetching"
    : loadingStatus !== "idle" && loadingStatus !== "completed"
      ? loadingStatus
      : null;

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <CanvasFloatingToolBar />

        {currentStatus && <CanvasLoader status={currentStatus} />}

        <TransformWrapper
          initialScale={0.53}
          initialPositionX={40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth={true}
          limitToBounds={false}
          panning={{ disabled: toolMode !== TOOL_MODE_ENUM.HAND }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                className={cn(
                  `absolute inset-0 w-full h-full bg-[#eee] dark:bg-[#242423] p-3`,
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default",
                )}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--primary)) 1px, transparent 1px",
                  backgroundSize: "20px 20px",
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "unset",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div className="size-50 bg-blue-500">Box</div>
                </TransformComponent>
              </div>

              <CanvasControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                zoomPercent={zoomPercent}
                toolMode={toolMode}
                setToolMode={setToolMode}
              />
            </>
          )}
        </TransformWrapper>
      </div>
    </>
  );
};

function CanvasLoader({ status }: { status?: LoadingStatusType | "fetching" }) {
  return (
    <div
      className={cn(
        `absolute top-4 left-1/2 -translate-x-1/2 min-w-40 max-w-full px-4 pt-1.5 pb-2 rounded-br-xl rounded-bl-xl shadow-md flex items-center spaxe-x-2 z-10`,
        status === "fetching" && "bg-gray-500 text-white",
        status === "running" && "bg-amber-500 text-white",
        status === "analyzing" && "bg-blue-500 text-white",
        status === "generating" && "bg-purple-500 text-white",
      )}
    >
      <Spinner className="w-4 h-4 stroke-3!" />
      <span className="text-sm font-semibold capitalize">
        {status === "fetching" ? "Loading Project" : status}
      </span>
    </div>
  );
}

export default Canvas;
