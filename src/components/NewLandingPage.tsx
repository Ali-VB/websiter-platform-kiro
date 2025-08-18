import { Button } from "./ui/button";
import { FAQItem } from "./faq-item";
import koalaIllustration from "../assets/koala-illustration.png";
import actionBackground from "../assets/footer-trees.png";

export default function WebsiterLanding({ onStartProject, onSignInClick }: { onStartProject: () => void; onSignInClick: () => void }) {
  const handleHowItWorksClick = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0 items-center min-h-[80vh]">
              {/* Left side - Content */}
              <div className="space-y-8 p-12 lg:p-16 leading-4">
                {/* Navigation */}
                <nav className="flex items-center justify-between mb-12 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold font-sans text-2xl text-pink-600">websiter.click</span>
                  </div>
                  <Button
                    variant="outline"
                    className="border-gray-900 text-gray-900 hover:bg-gray-50 font-medium px-6 py-2 rounded-full bg-transparent"
                    onClick={onSignInClick}
                  >
                    Sign In →
                  </Button>
                </nav>

                <div className="space-y-8">
                  {/* Hero Content */}
                  <div className="space-y-4">
                    <h1 className="font-light text-gray-900 leading-tight tracking-wide text-6xl">Your Website,</h1>
                    <h2 className="text-4xl text-gray-900 leading-tight font-extrabold lg:text-6xl">Simplified</h2>
                    <p className="leading-relaxed max-w-lg text-lg text-slate-800">
                      Order your professional website like you'd order anything online – simple, transparent, and
                      entirely on your terms.
                    </p>
                  </div>

                  {/* Hero Stats Bar */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-600">100% Self-service ordering</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-600">$0 Hidden fees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-600">24/7 Dashboard access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-600">0 Meetings required</span>
                    </div>
                  </div>

                  {/* Updated CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-8 py-6 text-lg rounded-full"
                      onClick={onStartProject}
                    >
                      Start Your Order
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-900 text-gray-900 hover:bg-gray-50 font-medium px-8 py-6 text-lg rounded-full bg-transparent"
                      onClick={handleHowItWorksClick}
                    >
                      See How It Works ↓
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right side - Geometric Mosaic */}
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 lg:p-12 min-h-[80vh] flex items-center justify-center">
                <div className="grid grid-cols-4 gap-4 w-full max-w-md">
                  {/* Row 1 */}
                  <div className="aspect-square bg-pink-500 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-cream-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="aspect-square bg-pink-500 rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-cream-100 rounded-full"></div>
                  </div>
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                    <div className="w-8 h-8 bg-cream-100 rounded-full ml-1"></div>
                  </div>

                  {/* Row 2 */}
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-10 h-10 bg-pink-500 rounded-full"></div>
                  </div>
                  <div className="aspect-square bg-navy-900 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-navy-900 rounded-full"></div>
                    </div>
                  </div>
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-cream-100 rounded-full ml-1"></div>
                  </div>
                  <div className="aspect-square bg-pink-500 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-cream-100 rounded-full"></div>
                  </div>

                  {/* Row 3 */}
                  <div className="aspect-square bg-navy-900 rounded-lg flex items-center justify-center">
                    <div className="w-10 h-10 bg-cream-100 rounded-full"></div>
                  </div>
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-cream-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="aspect-square bg-pink-500 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-cream-100 rounded-full"></div>
                    <div className="w-6 h-6 bg-pink-500 rounded-full ml-1"></div>
                  </div>
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-pink-500 rounded-full"></div>
                  </div>

                  {/* Row 4 */}
                  <div className="aspect-square bg-pink-500 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="aspect-square bg-navy-900 rounded-lg flex items-center justify-center">
                    <div className="w-10 h-10 bg-navy-900 rounded-full"></div>
                  </div>
                  <div className="aspect-square bg-cream-100 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-cream-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="aspect-square bg-pink-500 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-cream-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20">
        <div className="px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-4xl font-normal text-gray-900 mb-8 border-l-4 border-gray-300 pl-6">
                Why Choose Websiter?
              </h2>

              <div className="text-gray-900 leading-relaxed space-y-1">
                <span className="text-2xl font-bold">Responsive & Mobile-Optimized</span>
                <span className="text-xl font-normal">
                  → Your website automatically adapts to every screen size and device.{" "}
                </span>
                <span className="text-3xl font-bold">All-in-One Project Dashboard </span>
                <span className="text-xl font-normal">
                  →Your personal command center to track project progress, submit support tickets, communicate and view
                  timeline estimates{" "}
                </span>
                <span className="text-2xl font-bold">Crystal-Clear Pricing Architecture</span>
                <span className="text-xl font-normal">→ No surprises, no hidden fees </span>
                <span className="text-2xl font-bold">And Precision-Tailored for Your Vision</span>
                <span className="text-xl font-normal">
                  → Custom websites built specifically for your business needs, brand identity, and industry
                  requirements.
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <img src={koalaIllustration} alt="Koala illustration" className="w-full max-w-3xl h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-16">
              <h2 className="font-black text-3xl lg:text-5xl text-gray-900 mb-6">Your Complete Ordering Journey</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Five simple steps to place your website order – just like shopping online, but for professional web
                development
              </p>
            </div>

            <div className="space-y-4">
              {/* First Row - 3 Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl overflow-hidden">
                {/* Step 1 - Pine Green */}
                <div className="bg-green-200 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
                  <div className="text-xs text-gray-700 mb-4 font-mono">
                    <div>STEP 01</div>
                    <div>PURPOSE</div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl text-gray-900 leading-tight mb-4 font-mono">
                      What's the Purpose
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Choose your website type: introducing business, personal blog, online store, appointment/booking
                      website, or fully custom website. Each option is tailored for specific business goals and
                      functionality needs.
                    </p>
                  </div>
                </div>

                {/* Step 2 - Oak Brown */}
                <div className="bg-gray-800 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
                  <div className="text-xs text-gray-300 mb-4 font-mono">
                    <div>STEP 02</div>
                    <div>FEATURES</div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl text-white leading-tight mb-4 font-mono">Add Extra Features</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Enhance your website with premium features: custom UI design ($1200), live chat ($20),
                      multi-language support ($600), social media integration ($200), and dozens of other powerful
                      add-ons to match your exact requirements.
                    </p>
                  </div>
                </div>

                {/* Step 3 - Ivory Yellow */}
                <div className="bg-yellow-100 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
                  <div className="text-xs text-gray-700 mb-4 font-mono">
                    <div>STEP 03</div>
                    <div>INSPIRATION</div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl text-gray-900 leading-tight mb-4 font-mono">
                      Website Inspiration
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Share at least 1 website you admire (up to 5 total). This helps us understand your aesthetic
                      preferences, functionality expectations, and overall vision to create something you'll absolutely
                      love.
                    </p>
                  </div>
                </div>
              </div>

              {/* Second Row - 2 Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl overflow-hidden">
                {/* Step 4 - Soft Blue */}
                <div className="bg-blue-100 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
                  <div className="text-xs text-gray-700 mb-4 font-mono">
                    <div>STEP 04</div>
                    <div>DOMAIN</div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl text-gray-900 leading-tight mb-4 font-mono">
                      Domain & Hosting Setup
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Select your perfect domain name and hosting package. We handle all technical configuration, SSL
                      certificates, and server setup while you focus on your business priorities.
                    </p>
                  </div>
                </div>

                {/* Step 5 - Soft Pink */}
                <div className="bg-pink-100 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
                  <div className="text-xs text-gray-700 mb-4 font-mono">
                    <div>STEP 05</div>
                    <div>SUPPORT</div>
                  </div>
                  <div>
                    <div className="mb-6">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl text-gray-900 leading-tight mb-4 font-mono">
                      Maintenance & Support
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Choose your ongoing support level: basic maintenance, priority support, or comprehensive
                      management. Your dashboard becomes your direct line to our team for any future needs or updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-gray-500 text-sm uppercase tracking-wide mb-4">FAQ</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Your Questions, Answered</h2>
            </div>

            <div className="space-y-0">
              {[
                {
                  question: "How does the ordering process actually work?",
                  answer:
                    "It works exactly like ordering anything online. Browse our website packages, add the features you want, customize your preferences, fill out your details, and checkout securely. The difference? Instead of receiving a package, you get a professional website and immediate access to your project dashboard.",
                },
                {
                  question: "What makes the dashboard so powerful?",
                  answer:
                    "Your dashboard is your complete project control center. Submit support tickets for questions or requests, track development milestones, communicate directly with your team, view project files, and maintain full visibility into every aspect of your website development process.",
                },
                {
                  question: "How does the ticket system work?",
                  answer:
                    "Our integrated ticket system lets you submit any request, question, or concern directly through your dashboard. Each ticket gets a unique number, priority level, and estimated response time. You can track ticket progress, add comments, attach files, and receive updates until resolution.",
                },
                {
                  question: "What are the payment options?",
                  answer:
                    "You have two flexible payment choices: pay the full amount upfront and receive a 5% discount, or choose our split payment option with 30% initial payment to start your project and the remaining 70% upon completion.",
                },
                {
                  question: "What happens after I place my order?",
                  answer:
                    "After completing your order and creating your account, your dashboard immediately becomes available. Once our development team confirms your project details and you complete your chosen payment option, your website development officially begins.",
                },
                {
                  question: "What if I need changes after my website launches?",
                  answer:
                    "Your dashboard transforms into your ongoing website management portal. Submit maintenance requests through the ticket system, request updates, access support services, and manage all future website needs through the same familiar interface.",
                },
              ].map((item, index) => (
                <FAQItem key={index} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section with Footer Content */}
      <section
        className="relative bg-cover bg-center bg-no-repeat min-h-screen flex flex-col justify-between"
        style={{ backgroundImage: `url(${actionBackground})` }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-black mb-8 leading-7 text-4xl font-medium">Ready to Place Your Website Order?</h2>
            <Button
              size="lg"
              className="bg-black hover:bg-gray-800 text-white font-medium px-12 py-6 text-xl rounded-full"
              onClick={onStartProject}
            >
              start your order
            </Button>
          </div>
        </div>

        <div className="py-12 text-center">
          <p className="text-black text-sm mb-6">© 2025 Websiter.click. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-black hover:text-gray-700 transition-colors">
              {/* GitHub icon */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a href="#" className="text-black hover:text-gray-700 transition-colors">
              {/* Twitter/X icon */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-black hover:text-gray-700 transition-colors">
              {/* LinkedIn icon */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}