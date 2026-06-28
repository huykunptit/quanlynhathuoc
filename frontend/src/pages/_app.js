import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Component {...pageProps} />
      </main>
      <ChatWidget />
    </div>
  );
}
