import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { VideoPlayer } from './components/VideoPlayer';
import { useBreadcrumbStore } from '@/store/breadcrumbStore';

interface Video {
  video_id: string;
  title: string;
  url: string;
  created_at: string;
  status: string;
}

export function VideoDetail() {
  const { videoId } = useParams<{ videoId: string }>();
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      {
        label: "Videos",
        path: "/admin/videos"
      },
      {
        label: "Video Details",
        path: `/admin/videos/${videoId}`
      }
    ]);
  }, [setBreadcrumbs, videoId]);

  const { data: video, isLoading, error } = useQuery<Video>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${videoId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers here
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch video details');
      }
      return response.json();
    },
    enabled: !!videoId
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading video details</div>;
  }

  if (!video) {
    return <div className="p-8">Video not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{video.title}</h2>
        <div className="text-sm text-gray-500 mb-4">
          Processed on {new Date(video.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <VideoPlayer videoId={video.video_id} />
      </div>
    </div>
  );
} 