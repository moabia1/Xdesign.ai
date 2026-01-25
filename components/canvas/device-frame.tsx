"use client"

import { TOOL_MODE_ENUM, ToolModeType } from '@/constants/canva';
import {Rnd} from "react-rnd"
import { useCanvas } from '@/context/canvas-context';
import { getHTMLWrapper } from '@/lib/frame-wrapper';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils';
import DeviceFrameToolbar from './device-frame-toolbar';
import axios from 'axios';
import { he, is } from 'zod/v4/locales';
import { toast } from 'sonner';
import DeviceFrameSkeleton from './device-frame-skeleton';

type PropsType = {
  html: string;
  title?: string;
  width?: number;
  minHeight?: number | string;
  initialPosition?: { x: number, y: number };
  frameId: string;
  scale?: number;
  toolMode: ToolModeType;
  isLoading?: boolean;
  theme_style?: string;
  onOpenHtmlDialog: () => void;
}
const DeviceFrame = ({
  html,
  title = "Untitled",
  width = 420,
  minHeight = 800,
  initialPosition = { x:0, y:0},
  frameId,
  onOpenHtmlDialog,
  scale = 1,
  toolMode,
  theme_style,
  isLoading = false,
}: PropsType) => {
  
  const { selectedFrameId, setSelectedFrameId } = useCanvas();
  const [frameSize,setFrameSize] = useState({
    width,
    height:minHeight
  })

  const iFrameRef = useRef<HTMLIFrameElement>(null);
  const isSelected = selectedFrameId === frameId;
  const [isDownloading, setIsDownloading] = useState(false);
  
  const fullHTML = getHTMLWrapper(
    html,
    title,
    theme_style,
    frameId
  );

  const handleDownloadPng = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await axios.post("/api/screenshot", { html: fullHTML, width: frameSize.width, height: frameSize.height }, {
        responseType: "blob",
        validateStatus: (s) => (s >= 200 && s < 300) || s === 304
      })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = url
      link.download = `${title.replace(/\s+/g, "_").toLowerCase()}-${Date.now()}.png`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success("Screenshot downloaded successfully")
    } catch (error) {
      console.log(error)
      toast.error("Failed to download screenshot")
    } finally {
      setIsDownloading(false);
    }
  },[])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "FRAME_HEIGHT" && event.data.frameId === frameId) {
        setFrameSize((prev) => ({
          ...prev,
          height:event.data.height,
        }))
      }
    }

    window.addEventListener("message", handleMessage);
    return ()=> window.removeEventListener("message",handleMessage)
  },[frameId])

  return (
    <Rnd
      default={{
        x: initialPosition.x,
        y: initialPosition.y,
        width,
        height: frameSize.height,
      }}
      minWidth={width}
      minHeight={minHeight}
      size={{
        width: frameSize.width,
        height: frameSize.height,
      }}
      disableDragging={toolMode === TOOL_MODE_ENUM.HAND}
      enableResizing={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
      scale={scale}
      onClick={(e: any) => {
        e.stopPropagation();
        if (toolMode === TOOL_MODE_ENUM.SELECT) {
          setSelectedFrameId(frameId);
        }
      }}
      resizeHandleComponent={{
        topLeft: isSelected ? <Handle /> : undefined,
        topRight: isSelected ? <Handle /> : undefined,
        bottomLeft: isSelected ? <Handle /> : undefined,
        bottomRight: isSelected ? <Handle /> : undefined,
      }}
      resizeHandleStyles={{
        top: { cursor: "ns-resize" },
        bottom: { cursor: "ns-resize" },
        left: { cursor: "ew-resize" },
        right: { cursor: "ew-resize" },
      }}
      onResize={(e, direction, ref) => {
        setFrameSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      className={cn(
        "relative z-10",
        isSelected &&
          toolMode !== TOOL_MODE_ENUM.HAND &&
          "ring-3 ring-blue-400 ring-offset-1",
        toolMode === TOOL_MODE_ENUM.HAND
          ? "cursor-grab! active:cursor-grabbing!"
          : "cursor-move",
      )}
    >
      <div className="w-full h-full">
        <DeviceFrameToolbar
          title={title}
          isSelected={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
          disabled={isDownloading || isLoading}
          isDownloading={isDownloading}
          onDownloadPng={handleDownloadPng}
          onOpenHtmlDialog={onOpenHtmlDialog}
        />
        <div
          className={cn(
            "relative w-full h-auto shadow-sm rounded-[36px] overflow-hidden",
            isSelected && toolMode !== TOOL_MODE_ENUM.HAND && "rounded-none",
          )}
        >
          {isLoading ? (
            <DeviceFrameSkeleton
              style={{
                position: "relative",
                width,
                height: minHeight,
              }}
            />
          ) : (
            <iframe
              ref={iFrameRef}
              srcDoc={fullHTML}
              title={title}
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: "100%",
                minHeight: `${minHeight}px`,
                height: `${frameSize.height}px`,
                border: "none",
                pointerEvents: "none",
                display: "block",
                background: "white",
              }}
            />
          )}
        </div>
      </div>
    </Rnd>
  );
}


const Handle = () => (
  <div className="z-30 h-4 w-4 bg-white border-2 border-blue-500" />
);

export default DeviceFrame