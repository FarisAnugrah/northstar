export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-24 px-6">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, including:
          name, email address, company name, and payment information when you subscribe.
        </p>

        <h2>2. How We Use AI</h2>
        <p>
          Northstar uses third-party AI providers (such as Anthropic and OpenAI) to process your 
          project specifications. We do not use your proprietary data to train our own base models, 
          and our agreements with API providers prohibit them from using your data for model training.
        </p>

        <h2>3. Data Storage and Security</h2>
        <p>
          Your data is stored securely using industry-standard encryption both in transit and at rest. 
          We use role-based access control (RLS) to ensure your workspace data remains isolated.
        </p>

        <h2>4. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          privacy@northstar.ai
        </p>
      </div>
    </div>
  );
}
