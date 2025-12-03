import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="font-outfit font-extrabold text-5xl mb-6 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: November 3, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">1. Information We Collect</h2>
              <p className="text-gray-700">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Location data for job matching and navigation</li>
                <li>Payment and banking information</li>
                <li>Photos of waste deliveries for verification</li>
                <li>Usage data and app interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process payments and transactions</li>
                <li>Match collectors with nearby collection jobs</li>
                <li>Verify waste deliveries and maintain quality standards</li>
                <li>Send important updates and notifications</li>
                <li>Detect and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">3. Information Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Factories when you accept a collection job</li>
                <li>Payment processors for transaction processing</li>
                <li>Government agencies as required by law</li>
                <li>Service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">5. Your Rights</h2>
              <p className="text-gray-700">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">6. Contact Us</h2>
              <p className="text-gray-700">
                For questions about this Privacy Policy, please contact us at:<br />
                Email: privacy@motech.com<br />
                Phone: +234 91 531 54401
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
