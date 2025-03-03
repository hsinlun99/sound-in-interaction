import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center overflow-hidden">
      <Image
        className="w-auto h-full object-contain"
        src={"/image/map.svg"}
        alt="sweden map"
        width={0}
        height={0}
        sizes="100vh"
      />
    </div>
  );
}
