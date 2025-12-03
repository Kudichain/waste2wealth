import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Upload, Trash2, Edit, Plus, Image as ImageIcon, Video, Calendar, MapPin, Users, Package } from "lucide-react";
import { format } from "date-fns";

interface EventGalleryEvent {
  id: string;
  title: string;
  date: Date | number;
  location: string;
  participants: number;
  wasteCollected: string;
  category: string;
  featured: boolean;
  description?: string;
  highlights?: string[];
  uploadedBy: string;
  createdAt: Date | number;
  updatedAt: Date | number;
  media?: EventGalleryMedia[];
}

interface EventGalleryMedia {
  id: string;
  eventId: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  duration?: string;
  order: number;
  uploadedBy: string;
  createdAt: Date | number;
}

export default function EventGalleryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventGalleryEvent | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    participants: 0,
    wasteCollected: "",
    category: "cleanup",
    featured: false,
    description: "",
    highlights: [""],
  });

  // Fetch events
  const { data: events = [], isLoading } = useQuery<EventGalleryEvent[]>({
    queryKey: ["/api/event-gallery/events"],
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await fetch("/api/event-gallery/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...eventData,
          date: new Date(eventData.date).getTime(),
          highlights: eventData.highlights.filter((h: string) => h.trim() !== ""),
        }),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/event-gallery/events"] });
      toast({ title: "Event created successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async ({ eventId, files }: { eventId: string; files: FileList }) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/event-gallery/events/${eventId}/media`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload media");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/event-gallery/events"] });
      toast({ title: "Media uploaded successfully" });
      setIsUploadDialogOpen(false);
      setSelectedFiles(null);
    },
    onError: () => {
      toast({ title: "Failed to upload media", variant: "destructive" });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/event-gallery/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/event-gallery/events"] });
      toast({ title: "Event deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
    },
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await fetch(`/api/event-gallery/media/${mediaId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete media");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/event-gallery/events"] });
      toast({ title: "Media deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete media", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      participants: 0,
      wasteCollected: "",
      category: "cleanup",
      featured: false,
      description: "",
      highlights: [""],
    });
  };

  const addHighlight = () => {
    setNewEvent({ ...newEvent, highlights: [...newEvent.highlights, ""] });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...newEvent.highlights];
    newHighlights[index] = value;
    setNewEvent({ ...newEvent, highlights: newHighlights });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = newEvent.highlights.filter((_, i) => i !== index);
    setNewEvent({ ...newEvent, highlights: newHighlights });
  };

  const handleCreateEvent = () => {
    createEventMutation.mutate(newEvent);
  };

  const handleUploadMedia = () => {
    if (selectedEvent && selectedFiles) {
      uploadMediaMutation.mutate({ eventId: selectedEvent.id, files: selectedFiles });
    }
  };

  const categoryColors: Record<string, string> = {
    cleanup: "bg-green-500",
    workshop: "bg-blue-500",
    university: "bg-purple-500",
    factory: "bg-orange-500",
    training: "bg-indigo-500",
    celebration: "bg-pink-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            Event Gallery Management
          </h2>
          <p className="text-muted-foreground">Manage events, photos, and videos for the public gallery</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Add a new event to the gallery</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Nassarawa Community Cleanup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Nassarawa LGA, Kano"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newEvent.category} onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleanup">Cleanup</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="factory">Factory</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="participants">Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={newEvent.participants}
                    onChange={(e) => setNewEvent({ ...newEvent, participants: parseInt(e.target.value) || 0 })}
                    placeholder="450"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wasteCollected">Waste Collected</Label>
                  <Input
                    id="wasteCollected"
                    value={newEvent.wasteCollected}
                    onChange={(e) => setNewEvent({ ...newEvent, wasteCollected: e.target.value })}
                    placeholder="12 tons"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Brief description of the event..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Highlights</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addHighlight}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Highlight
                  </Button>
                </div>
                {newEvent.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder="450 community members participated"
                    />
                    {newEvent.highlights.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newEvent.featured}
                  onChange={(e) => setNewEvent({ ...newEvent, featured: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="cursor-pointer">Mark as Featured Event</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Loading events...</p>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events yet. Create your first event!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(typeof event.date === 'number' ? new Date(event.date) : event.date, "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  {event.featured && (
                    <Badge variant="secondary" className="bg-yellow-500 text-white">Featured</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={categoryColors[event.category]}>{event.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.participants} participants
                  </span>
                  {event.wasteCollected && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {event.wasteCollected}
                    </span>
                  )}
                </div>

                {event.media && event.media.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    {event.media.filter((m) => m.type === "photo").length} photos
                    <Video className="h-3 w-3 ml-2" />
                    {event.media.filter((m) => m.type === "video").length} videos
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedEvent(event)}>
                        <Upload className="h-3 w-3 mr-1" />
                        Upload Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Media</DialogTitle>
                        <DialogDescription>Upload photos or videos for {event.title}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="media-files">Select Files</Label>
                          <Input
                            id="media-files"
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Accepted: JPEG, PNG, GIF, MP4, MOV, AVI, WEBM (max 50MB per file)
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setSelectedEvent(null); setSelectedFiles(null); }}>
                          Cancel
                        </Button>
                        <Button onClick={handleUploadMedia} disabled={!selectedFiles || uploadMediaMutation.isPending}>
                          {uploadMediaMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this event and all its media?")) {
                        deleteEventMutation.mutate(event.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
