import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Image
        className="w-full object-cover"
        src={"/image/map.svg"}
        alt="sweden map"
        width={0}
        height={0}
        sizes="100vw"
      />
    </div>
  );
}
