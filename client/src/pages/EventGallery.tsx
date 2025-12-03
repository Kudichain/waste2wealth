import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Play, Image as ImageIcon, Award } from "lucide-react";

export default function EventGallery() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const events = [
    {
      id: "cleanup-nassarawa-march",
      title: "Nassarawa Community Cleanup Drive",
      date: "March 15, 2024",
      location: "Nassarawa LGA, Kano",
      participants: 450,
      wasteCollected: "12 tons",
      category: "cleanup",
      featured: true,
      images: [
        { url: "/events/nassarawa-cleanup-1.jpg", caption: "Community members gathering for the cleanup drive" },
        { url: "/events/nassarawa-cleanup-2.jpg", caption: "Youth collectors in action" },
        { url: "/events/nassarawa-cleanup-3.jpg", caption: "Sorting waste by material type" },
        { url: "/events/nassarawa-cleanup-4.jpg", caption: "12 tons of waste collected in one day" }
      ],
      videos: [
        { url: "/events/nassarawa-cleanup-video.mp4", thumbnail: "/events/video-thumb-1.jpg", duration: "3:45" }
      ],
      highlights: [
        "450 community members participated",
        "12 tons of waste collected",
        "15 new collectors registered",
        "₦65,000 earned by participants"
      ]
    },
    {
      id: "women-empowerment-workshop",
      title: "Women in Waste Management Workshop",
      date: "March 8, 2024",
      location: "Kano Municipal",
      participants: 120,
      wasteCollected: "N/A",
      category: "workshop",
      featured: true,
      images: [
        { url: "/events/women-workshop-1.jpg", caption: "Women entrepreneurs learning waste sorting techniques" },
        { url: "/events/women-workshop-2.jpg", caption: "Hands-on training session" },
        { url: "/events/women-workshop-3.jpg", caption: "Certificate distribution ceremony" }
      ],
      videos: [
        { url: "/events/women-workshop-video.mp4", thumbnail: "/events/video-thumb-2.jpg", duration: "5:12" }
      ],
      highlights: [
        "120 women trained",
        "60 new female collectors",
        "Safety equipment distributed",
        "Financial literacy workshop included"
      ]
    },
    {
      id: "university-conversion-center-launch",
      title: "Bayero University Conversion Center Launch",
      date: "February 28, 2024",
      location: "Bayero University, Kano",
      participants: 200,
      wasteCollected: "8 tons",
      category: "university",
      featured: true,
      images: [
        { url: "/events/bayero-launch-1.jpg", caption: "Official ribbon-cutting ceremony" },
        { url: "/events/bayero-launch-2.jpg", caption: "State-of-the-art conversion equipment" },
        { url: "/events/bayero-launch-3.jpg", caption: "Students learning recycling processes" },
        { url: "/events/bayero-launch-4.jpg", caption: "Partnership signing with university administration" }
      ],
      videos: [
        { url: "/events/bayero-launch-video.mp4", thumbnail: "/events/video-thumb-3.jpg", duration: "7:30" }
      ],
      highlights: [
        "First university conversion center in Kano",
        "200 students and faculty attended",
        "Research partnership established",
        "8 tons processing capacity"
      ]
    },
    {
      id: "factory-tour-lagos-plastics",
      title: "Factory Tour: Lagos Plastics Industries",
      date: "February 20, 2024",
      location: "Lagos, Nigeria",
      participants: 45,
      wasteCollected: "450 tons processed",
      category: "factory",
      featured: false,
      images: [
        { url: "/events/factory-tour-1.jpg", caption: "Advanced recycling machinery in action" },
        { url: "/events/factory-tour-2.jpg", caption: "Quality control department" },
        { url: "/events/factory-tour-3.jpg", caption: "Final recycled products showcase" }
      ],
      videos: [
        { url: "/events/factory-tour-video.mp4", thumbnail: "/events/video-thumb-4.jpg", duration: "4:20" }
      ],
      highlights: [
        "45 collectors visited",
        "Full production process demonstration",
        "Direct buyer-collector interaction",
        "450 tons monthly processing capacity"
      ]
    },
    {
      id: "youth-training-program",
      title: "Youth Collector Training Program",
      date: "February 10, 2024",
      location: "Fagge LGA, Kano",
      participants: 180,
      wasteCollected: "N/A",
      category: "training",
      featured: false,
      images: [
        { url: "/events/youth-training-1.jpg", caption: "Interactive training session" },
        { url: "/events/youth-training-2.jpg", caption: "Safety equipment demonstration" },
        { url: "/events/youth-training-3.jpg", caption: "Certificate presentation" }
      ],
      videos: [],
      highlights: [
        "180 youth trained",
        "95% completion rate",
        "Safety protocols covered",
        "Business skills training included"
      ]
    },
    {
      id: "community-impact-celebration",
      title: "KudiChain Impact Celebration",
      date: "January 31, 2024",
      location: "Kano State Government House",
      participants: 300,
      wasteCollected: "N/A",
      category: "celebration",
      featured: false,
      images: [
        { url: "/events/impact-celebration-1.jpg", caption: "Top collectors receiving awards" },
        { url: "/events/impact-celebration-2.jpg", caption: "Government officials and stakeholders" },
        { url: "/events/impact-celebration-3.jpg", caption: "Community performance" },
        { url: "/events/impact-celebration-4.jpg", caption: "Impact statistics presentation" }
      ],
      videos: [
        { url: "/events/impact-celebration-video.mp4", thumbnail: "/events/video-thumb-5.jpg", duration: "8:15" }
      ],
      highlights: [
        "300 attendees including government officials",
        "Top 10 collectors awarded",
        "₦500,000 in prizes distributed",
        "Media coverage from 15 outlets"
      ]
    }
  ];

  const categoryIcons: Record<string, any> = {
    cleanup: Users,
    workshop: Award,
    university: ImageIcon,
    factory: Users,
    training: Award,
    celebration: Award
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <ImageIcon className="h-5 w-5" />
              <span className="font-semibold">Event Gallery</span>
            </div>
            <h1 className="font-outfit font-bold text-5xl md:text-6xl mb-6">
              Capturing Our Impact Journey
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Photos and videos from community cleanups, workshops, university conversion centers, and celebration events across Nigeria
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{events.length} Events</span>
              </div>
              <div>·</div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <span>{events.reduce((acc, e) => acc + e.images.length, 0)} Photos</span>
              </div>
              <div>·</div>
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                <span>{events.reduce((acc, e) => acc + e.videos.length, 0)} Videos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-12 px-6 bg-background sticky top-0 z-30 border-b shadow-sm">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7 h-auto">
                <TabsTrigger value="all" className="gap-2">
                  All Events
                </TabsTrigger>
                <TabsTrigger value="cleanup" className="gap-2">
                  Cleanups
                </TabsTrigger>
                <TabsTrigger value="workshop" className="gap-2">
                  Workshops
                </TabsTrigger>
                <TabsTrigger value="university" className="gap-2">
                  Universities
                </TabsTrigger>
                <TabsTrigger value="factory" className="gap-2">
                  Factories
                </TabsTrigger>
                <TabsTrigger value="training" className="gap-2">
                  Training
                </TabsTrigger>
                <TabsTrigger value="celebration" className="gap-2">
                  Celebrations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-12">
                <EventGrid events={events} />
              </TabsContent>
              <TabsContent value="cleanup" className="mt-12">
                <EventGrid events={events.filter(e => e.category === "cleanup")} />
              </TabsContent>
              <TabsContent value="workshop" className="mt-12">
                <EventGrid events={events.filter(e => e.category === "workshop")} />
              </TabsContent>
              <TabsContent value="university" className="mt-12">
                <EventGrid events={events.filter(e => e.category === "university")} />
              </TabsContent>
              <TabsContent value="factory" className="mt-12">
                <EventGrid events={events.filter(e => e.category === "factory")} />
              </TabsContent>
              <TabsContent value="training" className="mt-12">
                <EventGrid events={events.filter(e => e.category === "training")} />
              </TabsContent>
              <TabsContent value="celebration" className="mt-12">
                <EventGrid events={events.filter(e => e.category === "celebration")} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Event Grid Component
function EventGrid({ events }: { events: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <Card 
          key={event.id}
          className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50 overflow-hidden cursor-pointer"
        >
          <CardContent className="p-0">
            {/* Featured Image with Play Button if video exists */}
            <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
              {event.featured && (
                <Badge className="absolute top-4 left-4 z-10 bg-yellow-500 text-white">
                  Featured
                </Badge>
              )}
              {event.videos.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 group-hover:bg-black/50 transition-all">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <ImageIcon className="h-4 w-4" />
                  <span>{event.images.length} photos</span>
                  {event.videos.length > 0 && (
                    <>
                      <span>·</span>
                      <Play className="h-4 w-4" />
                      <span>{event.videos.length} video{event.videos.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{event.participants} participants</span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1 mb-4">
                {event.highlights.slice(0, 2).map((highlight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" variant="outline">
                View Gallery
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
