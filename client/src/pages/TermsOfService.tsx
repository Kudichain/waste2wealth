import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="font-outfit font-extrabold text-5xl mb-6 text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: November 3, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using KudiChain's platform, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using this platform.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">2. User Accounts</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must provide accurate and complete information</li>
                <li>One person or entity may not maintain multiple accounts</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">3. Collector Obligations</h2>
              <p className="text-gray-700">As a collector, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Collect only the types of waste specified in job descriptions</li>
                <li>Deliver waste to verified factories within agreed timeframes</li>
                <li>Provide accurate photos and documentation</li>
                <li>Follow safety guidelines and local regulations</li>
                <li>Maintain professional conduct at all times</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">4. Factory Obligations</h2>
              <p className="text-gray-700">As a factory, you agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Maintain valid licenses and permits</li>
                <li>Pay agreed rates for verified waste deliveries</li>
                <li>Process delivered waste according to environmental standards</li>
                <li>Provide accurate job descriptions and requirements</li>
                <li>Treat collectors with respect and professionalism</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">5. Payments and Fees</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Collectors receive payment after verified deliveries</li>
                <li>Factories pay monthly subscription fees</li>
                <li>Payment processing may take 1-3 business days</li>
                <li>We reserve the right to modify fees with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">6. Prohibited Activities</h2>
              <p className="text-gray-700">Users may not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Engage in fraudulent activities</li>
                <li>Provide false information or documentation</li>
                <li>Harass or threaten other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to manipulate the platform or payments</li>
              </ul>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">7. Termination</h2>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in 
                fraudulent activities. Users may close their accounts at any time.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                KudiChain shall not be liable for any indirect, incidental, special, or consequential 
                damages arising from the use of our platform.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">9. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at:<br />
                Email: legal@motech.com<br />
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
