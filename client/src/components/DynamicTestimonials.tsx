import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Quote, Star, PlayCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  image?: string;
  video?: string;
  earnings?: string;
  date: string;
  verified: boolean;
}

export function DynamicTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoModal, setVideoModal] = useState<string | null>(null);

  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Aisha Mohammed",
      role: "Collector",
      location: "Lagos, Nigeria",
      content: "KudiChain transformed my life. I've earned over ₦150,000 in just 3 months while helping keep my community clean. The instant KOBO payments make everything so easy!",
      rating: 5,
      image: "/api/placeholder/100/100",
      video: "https://youtube.com/example1",
      earnings: "₦150,000",
      date: "2 weeks ago",
      verified: true
    },
    {
      id: "2",
      name: "Chukwudi Okafor",
      role: "Vendor Partner",
      location: "Abuja, Nigeria",
      content: "As a waste management vendor, KudiChain's digital platform streamlined everything. We've processed 5 tons of recyclables this month with full transparency.",
      rating: 5,
      image: "/api/placeholder/100/100",
      earnings: "5 tons processed",
      date: "1 week ago",
      verified: true
    },
    {
      id: "3",
      name: "Fatima Bello",
      role: "Collector & Trainer",
      location: "Kano, Nigeria",
      content: "Started as a collector, now I train others! The gamification system motivated me to reach Level 10. My community is cleaner and I have a stable income.",
      rating: 5,
      image: "/api/placeholder/100/100",
      video: "https://youtube.com/example2",
      earnings: "Level 10 · ₦230,000",
      date: "3 days ago",
      verified: true
    },
    {
      id: "4",
      name: "Emmanuel Adeyemi",
      role: "Factory Partner",
      location: "Port Harcourt, Nigeria",
      content: "The quality of sorted waste from KudiChain collectors is exceptional. Our production costs dropped 30% since partnering with them.",
      rating: 5,
      image: "/api/placeholder/100/100",
      earnings: "30% cost reduction",
      date: "1 month ago",
      verified: true
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-4">
            Real Stories, Real Impact
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from our community members transforming waste into opportunity
          </p>
        </div>

        {/* Featured Testimonial */}
        <Card className="mb-12 border-2 bg-gradient-to-br from-background to-muted/50 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Profile */}
              <div className="text-center md:text-left">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={currentTestimonial.image} alt={currentTestimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-2xl">
                      {currentTestimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  {currentTestimonial.verified && (
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                      <Star className="h-4 w-4 text-white fill-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-xl mb-1">{currentTestimonial.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{currentTestimonial.role}</p>
                <p className="text-xs text-muted-foreground mb-3">{currentTestimonial.location}</p>
                {currentTestimonial.earnings && (
                  <div className="inline-block bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    {currentTestimonial.earnings}
                  </div>
                )}
              </div>

              {/* Testimonial Content */}
              <div className="md:col-span-2">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-lg leading-relaxed mb-6 italic">
                  "{currentTestimonial.content}"
                </p>
                
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{currentTestimonial.date}</span>
                    {currentTestimonial.video && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVideoModal(currentTestimonial.video!)}
                        className="gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Watch Video
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                index === activeIndex ? "border-2 border-primary shadow-lg scale-105" : "border hover:border-primary/50"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                      {testimonial.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                  </div>
                  {testimonial.video && (
                    <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {testimonial.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Join 1,247+ collectors earning sustainable income</p>
          <Button size="lg" className="group">
            Share Your Story
            <User className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Video Modal Placeholder */}
      {videoModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setVideoModal(null)}
        >
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full">
            <p className="text-center text-muted-foreground">Video player would load here: {videoModal}</p>
            <Button onClick={() => setVideoModal(null)} className="mt-4 mx-auto block">
              Close
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
