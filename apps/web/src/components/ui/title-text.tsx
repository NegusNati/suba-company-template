function TitleText({ title }: { title: string }) {
  return (
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
      {title || "This is the default title"}
    </h1>
  );
}

export default TitleText;
