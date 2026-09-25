import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
      </main>

      <Footer />
    </>
  );
}

export default Home;