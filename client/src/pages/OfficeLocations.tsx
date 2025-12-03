import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const offices = [
  {
    state: "Lagos State",
    address: "Plot 123, Victoria Island, Lagos",
    coordinates: { lat: 6.4550, lng: 3.3841 },
  },
  {
    state: "Federal Capital Territory (FCT)",
    address: "Plot 456, Central Business District, Abuja",
    coordinates: { lat: 9.0579, lng: 7.4951 },
  },
  {
    state: "Kaduna State",
    address: "Plot 789, Ahmadu Bello Way, Kaduna",
    coordinates: { lat: 10.5222, lng: 7.4383 },
  },
  {
    state: "Kano State",
    address: "Plot 321, Bompai Industrial Estate, Kano",
    coordinates: { lat: 11.9914, lng: 8.5371 },
  },
  {
    state: "Rivers State",
    address: "Plot 654, Trans Amadi Industrial Layout, Port Harcourt",
    coordinates: { lat: 4.8156, lng: 7.0498 },
  },
];

export default function OfficeLocations() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">Our Office Locations</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Visit us at any of our offices across Nigeria. Our team is ready to assist you with waste management solutions and sustainable practices.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offices.map((office) => (
          <Card key={office.state} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{office.state}</h3>
                <p className="text-muted-foreground">{office.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${office.coordinates.lat},${office.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-4 inline-block"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}