"use client"

import { ToolModeType } from '@/constants/canva';
import { useCanvas } from '@/context/canvas-context';
import React from 'react'

type PropsType = {
  html: string;
  title?: string;
  width?: number;
  minHeight?: number | string;
  initialPosition?: { x: number, y: number };
  frameId: string;
  scale?: number;
  toolMode: ToolModeType;
  theme_style?:string;
}
const DeviceFrame = ({
  html,
  title = "Untitled",
  width = 420,
  minHeight = 800,
  initialPosition = { x:0, y:0},
  frameId,
  scale = 1,
  toolMode,
  theme_style
}: PropsType) => {
  
  const {} = useCanvas()
  return (
    <div>DeviceFrame</div>
  )
}

export default DeviceFrame