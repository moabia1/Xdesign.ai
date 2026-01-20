"use client"
import { useGetProjectId } from '@/app/features/use-project-id';
import { useParams } from 'next/navigation';
import React from 'react'
import Header from './_common/header';
import Canvas from '@/components/canvas';

const Page =  () => {
  const params = useParams()

  const id = params.id as string;

  const { data: project, isPending } = useGetProjectId(id);
  const frames = project?.frames || [];
  const theme = project?.theme;

  if (!isPending && !project) {
    return <div>Project not found</div>
  }


  return (
    <div className='relative h-screen w-full flex flex-col'>
      <Header projectName={project?.name} />
      
      <div className='flex w-full overflow-hidden'>
        <div className='relative'>
          <Canvas/>
        </div>
      </div>
    </div>
  )
}

export default Page