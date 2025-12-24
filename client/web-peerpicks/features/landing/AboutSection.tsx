import Image from 'next/image';

export default function AboutSection() {
  return (
    <section id="about-us" className="py-24 px-6">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold">About PeerPicks</h2>
          <p className="mt-4 text-gray-600">
            PeerPicks empowers users through authentic community-driven experiences.
          </p>
        </div>
        <Image src="/logo1.jpg" alt="About PeerPicks" width={400} height={400} />
      </div>
    </section>
  );
}
