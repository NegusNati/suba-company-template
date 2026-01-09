import { useTestimonialByIdQuery } from "../lib/testimonials-query";
import { TestimonialForm } from "../TestimonialForm";

interface TestimonialEditProps {
  testimonialId: number;
}

export default function TestimonialEdit({
  testimonialId,
}: TestimonialEditProps) {
  const { data, isPending, isError, error } =
    useTestimonialByIdQuery(testimonialId);

  if (isPending) return <div className="p-8">Loading testimonial...</div>;
  if (isError || !data?.data)
    return (
      <div className="p-8 text-destructive">
        Failed to load testimonial{error ? `: ${error.message}` : ""}
      </div>
    );

  return <TestimonialForm mode="edit" testimonial={data.data} />;
}
