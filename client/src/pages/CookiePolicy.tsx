import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CookiePolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="font-outfit font-extrabold text-5xl mb-6 text-gray-900">Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: November 3, 2025</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">What Are Cookies</h2>
              <p className="text-gray-700">
                Cookies are small text files that are stored on your device when you visit our website or use our app. 
                They help us provide you with a better experience by remembering your preferences and understanding how 
                you use our services.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">How We Use Cookies</h2>
              <p className="text-gray-700">We use cookies for the following purposes:</p>
              
              <h3 className="font-semibold text-xl mt-6 mb-3">Essential Cookies</h3>
              <p className="text-gray-700">
                These cookies are necessary for the platform to function properly. They enable core functionality 
                such as security, authentication, and basic features.
              </p>

              <h3 className="font-semibold text-xl mt-6 mb-3">Performance Cookies</h3>
              <p className="text-gray-700">
                These cookies help us understand how you interact with our platform by collecting anonymous usage data. 
                This helps us improve our services.
              </p>

              <h3 className="font-semibold text-xl mt-6 mb-3">Functionality Cookies</h3>
              <p className="text-gray-700">
                These cookies remember your preferences and choices, such as language settings and location preferences, 
                to provide a more personalized experience.
              </p>

              <h3 className="font-semibold text-xl mt-6 mb-3">Analytics Cookies</h3>
              <p className="text-gray-700">
                We use analytics cookies to understand how visitors use our platform. This information helps us 
                improve our services and user experience.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <strong className="text-gray-900">Session Cookies:</strong>
                  <p className="text-gray-700">
                    Temporary cookies that expire when you close your browser. Used to maintain your session while 
                    you're logged in.
                  </p>
                </div>
                <div>
                  <strong className="text-gray-900">Persistent Cookies:</strong>
                  <p className="text-gray-700">
                    Remain on your device for a set period or until you delete them. Used to remember your preferences 
                    across visits.
                  </p>
                </div>
                <div>
                  <strong className="text-gray-900">First-Party Cookies:</strong>
                  <p className="text-gray-700">
                    Set by our platform directly.
                  </p>
                </div>
                <div>
                  <strong className="text-gray-900">Third-Party Cookies:</strong>
                  <p className="text-gray-700">
                    Set by our partners and service providers (e.g., analytics providers, payment processors).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">Managing Cookies</h2>
              <p className="text-gray-700">You have several options for managing cookies:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Most browsers allow you to refuse or accept cookies through settings</li>
                <li>You can delete cookies that are already stored on your device</li>
                <li>You can set your browser to notify you when cookies are sent</li>
                <li>Some browsers offer "Do Not Track" options</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Please note that disabling certain cookies may affect the functionality of our platform and your 
                user experience.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">Cookie Consent</h2>
              <p className="text-gray-700">
                When you first visit our platform, we'll ask for your consent to use cookies. You can change your 
                cookie preferences at any time through your account settings or browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with 
                an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="font-outfit font-bold text-3xl mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about our use of cookies, please contact us at:<br />
                Email: privacy@motech.com<br />
                Phone: +234 800 123 4567
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
