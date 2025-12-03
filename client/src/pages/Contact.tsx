import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageSquare, Clock, Upload, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "",
    subject: "",
    message: ""
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", inquiryType: "", subject: "", message: "" });
    setAttachedFiles([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-700">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="font-outfit font-bold text-3xl mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiryType">Inquiry Type</Label>
                    <Select 
                      value={formData.inquiryType} 
                      onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="sales">Sales & Partnership</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="collector">Collector Support</SelectItem>
                        <SelectItem value="vendor">Vendor Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attachments">Attachments (Optional)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <Input
                        id="attachments"
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <label htmlFor="attachments" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload documents or images
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Max 3 files, up to 10MB each
                        </p>
                      </label>
                    </div>
                    {attachedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="font-outfit font-bold text-3xl mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <Card className="p-6">
                    <Mail className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">support@motech.com</p>
                    <p className="text-gray-600">info@motech.com</p>
                  </Card>

                  <Card className="p-6">
                    <Phone className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Phone</h3>
                    <p className="text-gray-600">+234 800 123 4567</p>
                    <p className="text-gray-600">+234 800 765 4321</p>
                  </Card>

                  <Card className="p-6">
                    <MapPin className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Address</h3>
                    <p className="text-gray-600">
                      KudiChain HQ<br />
                      Innovation Hub, Kano<br />
                      Nigeria
                    </p>
                    {/* Map placeholder */}
                    <div className="mt-4 h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3922.1234567890123!2d8.5919!3d12.0022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAwJzA3LjkiTiA4wrAzNSczMS44IkU!5e0!3m2!1sen!2sng!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="KudiChain HQ Location"
                      />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <Clock className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium">9:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium text-red-500">Closed</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <MessageSquare className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Quick Response</h3>
                    <p className="text-gray-600 text-sm">
                      We typically respond to inquiries within 24 hours during business days.
                      For urgent matters, please call us directly.
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
