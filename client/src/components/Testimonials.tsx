import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import testimonial1 from "@assets/generated_images/Collector_testimonial_portrait_male_e549f04e.png";
import testimonial2 from "@assets/generated_images/Collector_testimonial_portrait_female_74ae409a.png";
import testimonial3 from "@assets/generated_images/Factory_owner_testimonial_portrait_87084a8c.png";

const testimonials = [
  {
    name: "Ibrahim Musa",
    location: "Kano, Nigeria",
    role: "Collector",
    image: testimonial1,
    quote: "GreenCoin changed my life. I earn daily while keeping my community clean. I've collected over 500kg of waste and earned enough to start a small business."
  },
  {
    name: "Fatima Ahmed",
    location: "Kaduna, Nigeria",
    role: "Collector",
    image: testimonial2,
    quote: "As a young mother, GreenCoin gave me flexible work that fits my schedule. I'm proud to contribute to a cleaner environment while supporting my family."
  },
  {
    name: "Yusuf Abdullahi",
    location: "Kano, Nigeria",
    role: "Factory Owner",
    image: testimonial3,
    quote: "The platform connects us with reliable collectors. Our recycling operations have grown 300% since joining. It's a win-win for everyone."
  }
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-inter font-bold text-4xl md:text-5xl text-center mb-4">
          Community Stories
        </h2>
        <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
          Real people making a real impact
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6" data-testid={`card-testimonial-${index}`}>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-inter font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "{testimonial.quote}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
