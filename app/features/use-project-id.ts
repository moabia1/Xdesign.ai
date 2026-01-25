import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner";

export const useGetProjectId = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async() =>{
      const res = await axios.get(`/api/project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId
  })
}

export const useGenerateDesignById = (projectId: string) => {
  return useMutation({
    mutationFn: async (prompt: string) => 
      await axios.post(`/api/project/${projectId}`, { prompt })
        .then((res) => res.data),
    onSuccess: () => {
         toast.success("Generation started");
       },
      onError: (error) => {
        console.error("Error creating project:", error);
        toast.error("Failed to generate screens");
      }  
  })
}

export const useUpdateProject = (projectId: string) => {
  return useMutation({
    mutationFn: async (themeId: string) => 
      await axios.patch(`/api/project/${projectId}`, { themeId })
        .then((res) => res.data),
    onSuccess: () => {
         toast.success("Project Updated");
       },
      onError: (error) => {
        console.error("Error creating project:", error);
        toast.error("Failed to update project");
      }  
  })
}