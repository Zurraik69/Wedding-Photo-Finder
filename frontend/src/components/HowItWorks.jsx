import "./HowItWorks.css";

function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-header">
        <p className="section-label">HOW IT WORKS</p>

        <h2>
          Find Your Memories in
          <br />
          Three Simple Steps
        </h2>

        <p className="section-description">
          Getting your wedding photos is simple, fast, and hassle-free.
        </p>
      </div>

      <div className="steps-container">

        <div className="step-card">
          <span className="step-number">01</span>

          <h3>Scan QR Code</h3>

          <p>
            Scan the QR code provided at the wedding to open your event
            gallery.
          </p>
        </div>

        <div className="step-card">
          <span className="step-number">02</span>

          <h3>Find Your Photos</h3>

          <p>
            Upload your selfie and let our system find your photos from
            the wedding.
          </p>
        </div>

        <div className="step-card">
          <span className="step-number">03</span>

          <h3>Download</h3>

          <p>
            Select your favorite photos and download your memories.
          </p>
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;