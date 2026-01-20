import { useQuery } from "@tanstack/react-query"
import axios from "axios"

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